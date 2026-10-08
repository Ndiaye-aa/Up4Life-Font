import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ProgressPeriod } from '../@types/progress'
import type { SessionRecord, SessionStatus } from '../@types/session'
import { BodyMetricsCharts } from '../components/charts/BodyMetricsCharts'
import { DashboardShell } from '../components/layout/DashboardShell'
import { SessionActions } from '../components/modules/admin/SessionActions'
import { EditSessionModal } from '../components/modules/session/EditSessionModal'
import { AlertBadges } from '../components/progress/AlertBadges'
import { AttendanceHeatmap } from '../components/progress/AttendanceHeatmap'
import { LoadProgressChart } from '../components/progress/LoadProgressChart'
import { ProgressOverviewCards } from '../components/progress/ProgressOverviewCards'
import { SessionTimeline } from '../components/progress/SessionTimeline'
import { WeeklyAttendanceChart } from '../components/progress/WeeklyAttendanceChart'
import { InlineNotice } from '../components/ui/InlineNotice'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import { useSessions } from '../hooks/useSessions'
import { useSessionMutations } from '../hooks/useStudentSessionActions'
import { useStudents } from '../hooks/useStudents'
import { deleteSessionService } from '../services/sessionService'
import { formatPhone } from '../utils/formatPhone'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { addDays, formatYmd, todayIn } from '../utils/sessionFormat'

const PERIODS: Array<{ value: ProgressPeriod; label: string; days: number }> = [
  { value: '30d', label: '30 dias', days: 30 },
  { value: '90d', label: '90 dias', days: 90 },
  { value: '180d', label: '180 dias', days: 180 },
]

const TABS = [
  { value: 'geral', label: 'Visão geral' },
  { value: 'frequencia', label: 'Frequência' },
  { value: 'treinos', label: 'Treinos & feedback' },
  { value: 'avaliacoes', label: 'Avaliações' },
] as const
type Tab = (typeof TABS)[number]['value']

const NEW_STATUS: Array<{ value: SessionStatus; label: string }> = [
  { value: 'REALIZADA', label: 'Treino realizado' },
  { value: 'PARCIAL', label: 'Treino parcial' },
  { value: 'FALTA', label: 'Falta (presencial)' },
  { value: 'FALTA_JUSTIFICADA', label: 'Falta justificada' },
]

export const AdminStudentDetailPage = () => {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const alunoId = Number(params.id)
  const { logout, user } = useAuth()
  const hoje = todayIn(user?.timezone ?? 'America/Sao_Paulo')

  const [tab, setTab] = useState<Tab>('geral')
  const [periodo, setPeriodo] = useState<ProgressPeriod>('30d')
  const days = PERIODS.find((p) => p.value === periodo)?.days ?? 30
  const [editing, setEditing] = useState<SessionRecord | null>(null)

  const students = useStudents(user?.id)
  const student = students.data?.find((s) => s.id === alunoId)
  const progress = useProgress(alunoId, periodo, user?.id)
  const sessions = useSessions(alunoId, { de: addDays(hoje, -days), ate: addDays(hoje, 30) }, user?.id)
  const mutations = useSessionMutations(alunoId)

  const list = useMemo(() => sessions.data ?? [], [sessions.data])
  const closeEditing = () => setEditing(null)

  // Registro manual de presença/falta
  const [newDate, setNewDate] = useState(hoje)
  const [newStatus, setNewStatus] = useState<SessionStatus>('REALIZADA')
  const [newMotivo, setNewMotivo] = useState('')
  const [newError, setNewError] = useState('')
  const [creating, setCreating] = useState(false)

  const createSession = async () => {
    setCreating(true)
    setNewError('')
    try {
      await mutations.create(
        {
          alunoId,
          data: newDate,
          status: newStatus,
          motivoFalta: newStatus.startsWith('FALTA') && newMotivo.trim() ? newMotivo.trim() : undefined,
        },
        'Sessão registrada.',
      )
      setNewMotivo('')
    } catch (error) {
      setNewError(error instanceof Error ? error.message : 'Não foi possível registrar a sessão.')
    } finally {
      setCreating(false)
    }
  }

  const bodyData = (progress.data?.avaliacoes.serie ?? []).map((p) => ({
    month: formatYmd(p.data),
    weight: p.peso,
    bodyFat: p.percentualGordura,
    muscle: p.massaMagra,
  }))

  if (students.data && !student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <p className="text-sm text-mute">Aluno não encontrado.</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard/admin/alunos')} type="button">
          Voltar para Alunos
        </button>
      </div>
    )
  }

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Personal'}
      navItems={getDashboardNavItems('PERSONAL')}
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
        { label: 'Faltas seguidas', value: String(progress.data?.faltasConsecutivas ?? '—') },
      ]}
      roleLabel="Personal Trainer"
      tone="personal"
    >
      {editing ? (
        <EditSessionModal
          onClose={closeEditing}
          onSubmit={async (payload) => {
            await mutations.update(editing.id, payload, 'Sessão atualizada.')
            closeEditing()
          }}
          role="PERSONAL"
          session={editing}
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
        <header className="space-y-3">
          <button
            className="inline-flex items-center gap-1.5 text-sm text-mute transition hover:text-ink"
            onClick={() => navigate('/dashboard/admin/alunos')}
            type="button"
          >
            <ArrowLeft size={14} /> Alunos
          </button>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">{student?.nome ?? '…'}</h1>
              {student ? (
                <p className="mt-1 text-sm text-mute">
                  {formatPhone(student.telefone)} · {student.ativo ? 'Ativo' : 'Inativo'}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-3 rounded-2xl bg-elev p-1">
              {PERIODS.map((option) => (
                <button
                  key={option.value}
                  aria-pressed={option.value === periodo}
                  className={`rounded-[0.85rem] px-3 py-2 text-xs font-medium transition ${
                    option.value === periodo ? 'bg-surface text-ink shadow-sm' : 'text-mute hover:text-accent'
                  }`}
                  onClick={() => setPeriodo(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {progress.data ? <AlertBadges alertas={progress.data.alertas} /> : null}
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.value}
              aria-selected={item.value === tab}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                item.value === tab ? 'border-accent text-ink' : 'border-transparent text-mute hover:text-ink'
              }`}
              onClick={() => setTab(item.value)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {progress.error ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-rose-400 light:text-rose-600" role="alert">
            <span>Não foi possível carregar o progresso deste aluno agora.</span>
            <button
              className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-elev"
              onClick={() => void progress.refetch()}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {!progress.data && progress.isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : null}

        {progress.data && tab === 'geral' ? (
          <div className="space-y-4">
            <ProgressOverviewCards progress={progress.data} />
            <WeeklyAttendanceChart semanal={progress.data.semanal} />
            <p className="text-sm text-mute">
              RPE médio: {progress.data.feedback.rpeMedio ?? '—'}
              {progress.data.feedback.dorUltimos7d ? ' · dor reportada nos últimos 7 dias' : ''}
            </p>
          </div>
        ) : null}

        {progress.data && tab === 'frequencia' ? (
          <div className="space-y-4">
            <AttendanceHeatmap progress={progress.data} />
            <section className="card space-y-3 rounded-2xl p-4">
              <h3 className="font-display text-base font-semibold text-ink">Registrar presença ou falta</h3>
              <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                <input
                  aria-label="Data"
                  className="field"
                  max={addDays(hoje, 30)}
                  onChange={(event) => setNewDate(event.target.value)}
                  type="date"
                  value={newDate}
                />
                <select
                  aria-label="Situação"
                  className="field"
                  onChange={(event) => setNewStatus(event.target.value as SessionStatus)}
                  value={newStatus}
                >
                  {NEW_STATUS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button className="btn-primary" disabled={creating || !newDate} onClick={() => void createSession()} type="button">
                  {creating ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
              {newStatus.startsWith('FALTA') ? (
                <input
                  className="field"
                  maxLength={500}
                  onChange={(event) => setNewMotivo(event.target.value)}
                  placeholder="Motivo (opcional)"
                  value={newMotivo}
                />
              ) : null}
              {newError ? <p className="text-sm text-rose-400 light:text-rose-600">{newError}</p> : null}
            </section>
          </div>
        ) : null}

        {tab === 'treinos' ? (
          <div className="space-y-4">
            {progress.data ? <LoadProgressChart cargas={progress.data.cargaPorExercicio} /> : null}
            <SessionTimeline
              actions={(session) => (
                <SessionActions
                  hoje={hoje}
                  onDelete={async (s) => {
                    await mutations.run(() => deleteSessionService(s.id), 'Sessão excluída.')
                  }}
                  onEdit={setEditing}
                  onUpdate={async (s, payload) => {
                    await mutations.update(s.id, { ...payload, version: s.version }, 'Sessão atualizada.')
                  }}
                  session={session}
                />
              )}
              sessions={list}
            />
          </div>
        ) : null}

        {tab === 'avaliacoes' ? (
          <div className="space-y-4">
            {bodyData.length > 0 ? (
              <BodyMetricsCharts data={bodyData} />
            ) : (
              <p className="card rounded-2xl p-6 text-sm text-faint">Primeira avaliação pendente.</p>
            )}
            <button
              className="btn-primary"
              onClick={() => navigate(`/dashboard/admin/avaliacoes?aluno=${alunoId}`)}
              type="button"
            >
              Ver avaliações do aluno
            </button>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
