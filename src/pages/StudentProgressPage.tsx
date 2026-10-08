import { AlertCircle, CalendarOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ProgressPeriod } from '../@types/progress'
import type { StudentSchedule } from '../@types/schedule'
import type { SessionRecord } from '../@types/session'
import { BodyMetricsCharts } from '../components/charts/BodyMetricsCharts'
import { DashboardShell } from '../components/layout/DashboardShell'
import { EditSessionModal } from '../components/modules/session/EditSessionModal'
import { JustifyAbsenceModal } from '../components/modules/session/JustifyAbsenceModal'
import { AttendanceHeatmap } from '../components/progress/AttendanceHeatmap'
import { LoadProgressChart } from '../components/progress/LoadProgressChart'
import { ProgressOverviewCards } from '../components/progress/ProgressOverviewCards'
import { SessionTimeline } from '../components/progress/SessionTimeline'
import { WeeklyAttendanceChart } from '../components/progress/WeeklyAttendanceChart'
import { InlineNotice } from '../components/ui/InlineNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { PushOptInBanner } from '../components/ui/PushOptInBanner'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import { useSessions } from '../hooks/useSessions'
import { useSessionMutations } from '../hooks/useStudentSessionActions'
import { getMyScheduleService } from '../services/schedule'
import { getSessionService } from '../services/sessionService'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { studentEditLockReason, upcomingScheduleDays } from '../utils/schedule'
import { addDays, formatYmd, todayIn, weekdayName } from '../utils/sessionFormat'

const PERIODS: Array<{ value: ProgressPeriod; label: string; days: number }> = [
  { value: '30d', label: '30 dias', days: 30 },
  { value: '90d', label: '90 dias', days: 90 },
  { value: '180d', label: '180 dias', days: 180 },
]

type Modal =
  | { kind: 'edit'; session: SessionRecord }
  | { kind: 'justify'; session: SessionRecord }
  | { kind: 'prejustify'; date: string }
  | null

const horaLocal = (timeZone: string): string =>
  new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(),
  )

export const StudentProgressPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout, user } = useAuth()
  const timezone = user?.timezone ?? 'America/Sao_Paulo'
  const hoje = todayIn(timezone)

  const [periodo, setPeriodo] = useState<ProgressPeriod>('30d')
  const days = PERIODS.find((p) => p.value === periodo)?.days ?? 30
  const [modal, setModal] = useState<Modal>(null)
  const [schedule, setSchedule] = useState<StudentSchedule | null>(null)

  const progress = useProgress('me', periodo, user?.id)
  // Inclui os próximos 30 dias para listar as pré-justificativas já feitas.
  const sessions = useSessions('me', { de: addDays(hoje, -days), ate: addDays(hoje, 30) }, user?.id)
  const mutations = useSessionMutations('me')

  useEffect(() => {
    let cancelled = false
    getMyScheduleService()
      .then((value) => !cancelled && setSchedule(value))
      .catch(() => !cancelled && setSchedule(null))
    return () => {
      cancelled = true
    }
  }, [])

  const list = useMemo(() => sessions.data ?? [], [sessions.data])

  // Deep link ?sessao=<id>&acao=justificar (vindo do push de falta).
  const deepLinkId = Number(searchParams.get('sessao')) || null
  const deepLinkAction = searchParams.get('acao')
  useEffect(() => {
    if (!deepLinkId || deepLinkAction !== 'justificar' || sessions.isLoading) return
    let cancelled = false
    const open = (session: SessionRecord) => {
      if (cancelled) return
      // Só abre quando ainda há o que justificar; limpa os parâmetros em qualquer caso.
      if (session.status === 'FALTA' && !studentEditLockReason(session, hoje)) {
        setModal({ kind: 'justify', session })
      }
      setSearchParams({}, { replace: true })
    }
    const found = list.find((s) => s.id === deepLinkId)
    if (found) open(found)
    else
      getSessionService(deepLinkId)
        .then(open)
        .catch(() => !cancelled && setSearchParams({}, { replace: true }))
    return () => {
      cancelled = true
    }
  }, [deepLinkId, deepLinkAction, list, sessions.isLoading, hoje, setSearchParams])

  const faltasParaJustificar = useMemo(
    () => list.filter((s) => s.status === 'FALTA' && !s.reposta && !studentEditLockReason(s, hoje)),
    [list, hoje],
  )
  const upcoming = useMemo(
    () => upcomingScheduleDays(schedule, list, hoje, horaLocal(timezone)),
    [schedule, list, hoje, timezone],
  )

  const closeModal = () => setModal(null)

  const bodyData = (progress.data?.avaliacoes.serie ?? []).map((p) => ({
    month: formatYmd(p.data),
    weight: p.peso,
    bodyFat: p.percentualGordura,
    muscle: p.massaMagra,
  }))

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Aluno'}
      navItems={getDashboardNavItems('ALUNO')}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={[
        {
          label: 'Frequência',
          value: progress.data?.frequencia.percentual != null
            ? `${Math.round(progress.data.frequencia.percentual * 100)}%`
            : '—',
        },
        { label: 'Sequência', value: String(progress.data?.sequenciaAtual ?? '—') },
      ]}
      roleLabel="Aluno"
      tone="student"
    >
      {modal?.kind === 'edit' ? (
        <EditSessionModal
          lockedReason={studentEditLockReason(modal.session, hoje) ?? undefined}
          onClose={closeModal}
          onSubmit={async (payload) => {
            await mutations.update(modal.session.id, payload, 'Sessão atualizada.')
            closeModal()
          }}
          role="ALUNO"
          session={modal.session}
        />
      ) : null}
      {modal?.kind === 'justify' ? (
        <JustifyAbsenceModal
          date={modal.session.data}
          mode="post"
          onClose={closeModal}
          onSubmit={async (motivo) => {
            await mutations.update(
              modal.session.id,
              {
                version: modal.session.version,
                status: 'FALTA_JUSTIFICADA',
                motivoFalta: motivo || undefined,
              },
              'Falta justificada.',
            )
            closeModal()
          }}
        />
      ) : null}
      {modal?.kind === 'prejustify' ? (
        <JustifyAbsenceModal
          date={modal.date}
          mode="pre"
          onClose={closeModal}
          onSubmit={async (motivo) => {
            await mutations.create(
              { data: modal.date, status: 'FALTA_JUSTIFICADA', motivoFalta: motivo || undefined },
              'Aviso registrado.',
            )
            closeModal()
          }}
        />
      ) : null}
      {mutations.notice ? (
        <InlineNotice
          message={mutations.notice.message}
          onDismiss={mutations.clearNotice}
          tone={mutations.notice.tone}
        />
      ) : null}

      <div className="space-y-6">
        <PageHeader
          description="Frequência, evolução de carga e avaliações."
          eyebrow="Progresso"
          title="Meu progresso"
        />

        <PushOptInBanner />

        {faltasParaJustificar.length > 0 ? (
          <section className="card rounded-2xl border-amber-500/30 p-4" role="alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-400" size={18} />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-ink">
                  Você tem {faltasParaJustificar.length}{' '}
                  {faltasParaJustificar.length === 1 ? 'falta' : 'faltas'} para justificar
                </p>
                <p className="text-xs text-mute">
                  Treinou e esqueceu de registrar? Edite a sessão. Se não treinou, justifique a falta.
                </p>
                <ul className="space-y-1.5">
                  {faltasParaJustificar.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="capitalize text-ink">
                        {weekdayName(s.data)} ({formatYmd(s.data)})
                      </span>
                      <button
                        className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-elev"
                        onClick={() => setModal({ kind: 'justify', session: s })}
                        type="button"
                      >
                        Justificar
                      </button>
                      <button
                        className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-elev"
                        onClick={() => setModal({ kind: 'edit', session: s })}
                        type="button"
                      >
                        Eu treinei
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {upcoming.length > 0 ? (
          <section className="card rounded-2xl p-4">
            <h3 className="font-display text-base font-semibold text-ink">Próximos treinos</h3>
            <ul className="mt-2 divide-y divide-line">
              {upcoming.map((day) => (
                <li key={day.data} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm capitalize text-ink">
                    {weekdayName(day.data)}, {formatYmd(day.data)}
                    {day.hora ? <span className="text-faint"> · {day.hora}</span> : null}
                  </span>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-mute hover:bg-elev hover:text-ink"
                    onClick={() => setModal({ kind: 'prejustify', date: day.data })}
                    type="button"
                  >
                    <CalendarOff size={13} />
                    Não vou conseguir treinar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="grid grid-cols-3 rounded-2xl bg-elev p-1 sm:max-w-sm" role="tablist">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              aria-selected={option.value === periodo}
              className={`rounded-[0.85rem] px-3 py-2 text-xs font-medium transition ${
                option.value === periodo ? 'bg-surface text-ink shadow-sm' : 'text-mute hover:text-accent'
              }`}
              onClick={() => setPeriodo(option.value)}
              role="tab"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {progress.error ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-rose-400 light:text-rose-600" role="alert">
            <span>Não foi possível carregar seu progresso agora.</span>
            <button
              className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-elev"
              onClick={() => void progress.refetch()}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {progress.data ? (
          <>
            <ProgressOverviewCards progress={progress.data} />
            <div className="grid gap-4 lg:grid-cols-2">
              <AttendanceHeatmap progress={progress.data} />
              <WeeklyAttendanceChart semanal={progress.data.semanal} />
            </div>
            <LoadProgressChart cargas={progress.data.cargaPorExercicio} />
            {bodyData.length > 0 ? (
              <BodyMetricsCharts data={bodyData} />
            ) : (
              <section className="card rounded-2xl p-4">
                <h3 className="font-display text-base font-semibold text-ink">Avaliações</h3>
                <p className="mt-3 text-sm text-faint">Primeira avaliação pendente.</p>
              </section>
            )}
          </>
        ) : progress.isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : null}

        <SessionTimeline
          actions={(session) => {
            const locked = studentEditLockReason(session, hoje)
            return (
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-elev"
                  onClick={() => setModal({ kind: 'edit', session })}
                  type="button"
                >
                  {locked ? 'Ver detalhes' : 'Editar'}
                </button>
                {session.status === 'FALTA' && !session.reposta && !locked ? (
                  <button
                    className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-elev"
                    onClick={() => setModal({ kind: 'justify', session })}
                    type="button"
                  >
                    Justificar
                  </button>
                ) : null}
              </div>
            )
          }}
          sessions={list}
        />
      </div>
    </DashboardShell>
  )
}
