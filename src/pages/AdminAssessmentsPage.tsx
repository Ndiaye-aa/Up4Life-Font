import { AlertCircle, Calendar, CalendarPlus, Check, ChevronRight, ClipboardList, Pencil, Plus, Trash2, User, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardShell } from '../components/layout/DashboardShell'
import { PageHeader } from '../components/ui/PageHeader'
import { StatStrip } from '../components/ui/StatStrip'
import { ScheduleAssessmentModal } from '../components/modules/admin/ScheduleAssessmentModal'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getAllAssessmentsService, type AssessmentRecord } from '../services/assessments'
import { getStudentsService } from '../services/students'
import {
  deleteAssessmentScheduleService,
  getAssessmentSchedulesService,
  updateAssessmentScheduleStatusService,
} from '../services/assessmentSchedule'
import type { AssessmentScheduleRecord, StatusAgendamento } from '../@types/assessmentSchedule'
import type { StudentRecord } from '../@types/student'
import { formatDateBR } from '../utils/formatDate'

const SCHEDULE_STATUS_STYLES: Record<StatusAgendamento, { className: string; label: string }> = {
  PENDENTE: { className: 'bg-amber-500/12 text-amber-400 light:bg-amber-50 light:text-amber-600', label: 'Pendente' },
  REALIZADA: { className: 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600', label: 'Realizada' },
  CANCELADA: { className: 'bg-rose-500/12 text-rose-400 light:bg-rose-50 light:text-rose-600', label: 'Cancelada' },
}

const getBmiStatus = (imc?: number) => {
  if (!imc) return { className: 'bg-elev text-mute', label: '—' }
  if (imc < 18.5) return { className: 'bg-blue-500/12 text-blue-400 light:bg-blue-50 light:text-blue-600', label: 'Abaixo do peso' }
  if (imc < 25) return { className: 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600', label: 'Normal' }
  if (imc < 30) return { className: 'bg-amber-500/12 text-amber-400 light:bg-amber-50 light:text-amber-600', label: 'Sobrepeso' }
  return { className: 'bg-rose-500/12 text-rose-400 light:bg-rose-50 light:text-rose-600', label: 'Obesidade' }
}

const buildInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')

export const AdminAssessmentsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const alunoId = searchParams.get('aluno') ? Number(searchParams.get('aluno')) : null

  const [tab, setTab] = useState<'agendamentos' | 'concluidas'>('agendamentos')
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [schedules, setSchedules] = useState<AssessmentScheduleRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleActionId, setScheduleActionId] = useState<number | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<AssessmentScheduleRecord | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [as_, ss, sc] = await Promise.all([
          getAllAssessmentsService(),
          getStudentsService(),
          getAssessmentSchedulesService().catch(() => []),
        ])
        setAssessments(as_)
        setStudents(ss)
        setSchedules(sc)
      } catch (error) {
        setLoadError('Não foi possível carregar as avaliações. Tente novamente.')
        console.error('Erro ao carregar avaliações:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleUpdateScheduleStatus = async (id: number, status: StatusAgendamento) => {
    setScheduleActionId(id)
    try {
      const updated = await updateAssessmentScheduleStatusService(id, status)
      setSchedules((current) => current.map((s) => (s.id === id ? updated : s)))
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
    } finally {
      setScheduleActionId(null)
    }
  }

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Excluir este agendamento? Essa ação não pode ser desfeita.')) return
    setScheduleActionId(id)
    try {
      await deleteAssessmentScheduleService(id)
      setSchedules((current) => current.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
    } finally {
      setScheduleActionId(null)
    }
  }

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  )

  const displaySchedules = useMemo(() => {
    return schedules
      .slice()
      .sort((a, b) => new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime())
      .map((schedule) => {
        const student = studentMap.get(schedule.alunoId)
        const nome = schedule.nomeAluno ?? student?.nome ?? `Aluno ${schedule.alunoId}`
        return {
          ...schedule,
          nome,
          initials: buildInitials(nome),
          dataLabel: formatDateBR(schedule.dataAgendada),
        }
      })
  }, [schedules, studentMap])

  const displayAssessments = useMemo(() => {
    const filtered = alunoId
      ? assessments.filter((a) => a.alunoId === alunoId)
      : assessments

    return filtered
      .slice()
      .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
      .map((a) => {
        const nome =
          a.alunoId == null
            ? (user?.name ?? 'Você')
            : (studentMap.get(a.alunoId)?.nome ?? `Aluno ${a.alunoId}`)
        const bmiStatus = getBmiStatus(a.imc)
        const massaMagra = a.percentualGordura && a.peso
          ? (a.peso * (1 - a.percentualGordura / 100)).toFixed(1)
          : undefined
        return {
          id: a.id,
          alunoId: a.alunoId,
          bmi: a.imc != null ? a.imc.toFixed(1) : '—',
          bodyFat: a.percentualGordura != null ? `${a.percentualGordura.toFixed(1)}%` : '—',
          cintura: a.cintura,
          date: formatDateBR(a.dataAvaliacao),
          iac: a.iac != null ? a.iac.toFixed(1) : undefined,
          initials: buildInitials(nome),
          massaMagra,
          name: nome,
          perimetros: {
            abdomen: a.abdominal != null ? String(a.abdominal) : '',
            chest: a.peitoral != null ? String(a.peitoral) : '',
            hip: a.quadril != null ? String(a.quadril) : '',
            thigh: a.coxa != null ? String(a.coxa) : '',
            waist: a.cintura != null ? String(a.cintura) : '',
          },
          status: bmiStatus.label,
          statusClassName: bmiStatus.className,
          weight: a.peso != null ? String(a.peso) : undefined,
        }
      })
  }, [assessments, alunoId, studentMap, user?.name])

  const activeStudentName = alunoId
    ? (displayAssessments[0]?.name ?? null)
    : null

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const stats = useMemo(() => {
    const thisMonth = assessments.filter((a) => {
      const d = new Date(a.dataAvaliacao)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).length

    const assessedStudentIds = new Set(
      assessments.filter((a) => a.alunoId != null).map((a) => a.alunoId),
    )
    const avaliados = assessedStudentIds.size
    const pendentes = Math.max(0, students.length - avaliados)

    return { avaliados, pendentes, thisMonth }
  }, [assessments, students, currentMonth, currentYear])

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
        { label: 'Mês', value: String(stats.thisMonth) },
        { label: 'Avaliados', value: String(stats.avaliados) },
        { label: 'Pendentes', value: String(stats.pendentes) },
      ]}
      roleLabel="Personal Trainer"
      tone="personal"
    >
      {isScheduleModalOpen ? (
        <ScheduleAssessmentModal
          onClose={() => setIsScheduleModalOpen(false)}
          onSaved={(schedule) => setSchedules((current) => [...current, schedule])}
          students={students}
        />
      ) : null}

      {editingSchedule ? (
        <ScheduleAssessmentModal
          initialSchedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSaved={(updated) =>
            setSchedules((current) => current.map((s) => (s.id === updated.id ? updated : s)))
          }
          students={students}
        />
      ) : null}

      <div className="space-y-6">
        <PageHeader
          action={
            <div className="flex gap-2">
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard/admin/avaliacoes/nova')}
                type="button"
              >
                <Plus size={16} />
                Nova avaliação
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-elev"
                onClick={() => setIsScheduleModalOpen(true)}
                type="button"
              >
                <CalendarPlus size={16} />
                Agendar avaliação
              </button>
            </div>
          }
          description=""
          eyebrow="Avaliações"
          title=""
        />


        {loadError ? (
          <p className="flex items-center gap-2 text-sm text-rose-400 light:text-rose-600">
            <AlertCircle size={16} />
            {loadError}
          </p>
        ) : null}

        <div className="flex gap-1 border-b border-line">
          <button
            className={`px-4 py-2.5 text-sm font-medium transition ${
              tab === 'agendamentos'
              ? 'border-b-2 border-accent text-ink'
              : 'border-b-2 border-transparent text-mute hover:text-ink'
            }`}
            onClick={() => setTab('agendamentos')}
            type="button"
          >
            Agendamentos
            {schedules.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-elev px-1.5 py-0.5 text-xs text-faint">
                {schedules.length}
              </span>
            ) : null}
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium transition ${
              tab === 'concluidas'
                ? 'border-b-2 border-accent text-ink'
                : 'border-b-2 border-transparent text-mute hover:text-ink'
            }`}
            onClick={() => setTab('concluidas')}
            type="button"
          >
            Concluídas
            {assessments.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-elev px-1.5 py-0.5 text-xs text-faint">
                {assessments.length}
              </span>
            ) : null}
          </button>
        </div>

        {tab === 'agendamentos' ? (
          <section className="card rounded-[2rem]">
            <div className="border-b border-line p-4">
              <h2 className="font-display text-2xl font-semibold text-ink">Agendamentos</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {displaySchedules.length > 0 ? displaySchedules.map((schedule) => {
                  const statusStyle = SCHEDULE_STATUS_STYLES[schedule.status]
                  const isActing = scheduleActionId === schedule.id
                  return (
                    <div className="flex items-center gap-3 p-4" key={schedule.id}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-sm text-white">
                        {schedule.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{schedule.nome}</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-faint">
                          <Calendar size={11} />
                          {schedule.dataLabel}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                      {schedule.status === 'PENDENTE' ? (
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50 light:bg-emerald-50 light:text-emerald-600"
                            disabled={isActing}
                            onClick={() => handleUpdateScheduleStatus(schedule.id, 'REALIZADA')}
                            title="Marcar como realizada"
                            type="button"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/12 text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50 light:bg-rose-50 light:text-rose-600"
                            disabled={isActing}
                            onClick={() => handleUpdateScheduleStatus(schedule.id, 'CANCELADA')}
                            title="Cancelar"
                            type="button"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-elev hover:text-ink disabled:opacity-50"
                            disabled={isActing}
                            onClick={() => setEditingSchedule(schedule)}
                            title="Editar agendamento"
                            type="button"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-rose-500/12 hover:text-rose-400 disabled:opacity-50 light:hover:text-rose-600"
                            disabled={isActing}
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            title="Excluir agendamento"
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                }) : (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-ink">Nenhum agendamento.</p>
                    <p className="mt-1 text-xs text-faint">Agende uma avaliação para um aluno.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
        <section className="card rounded-[2rem]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <h2 className="font-display text-2xl font-semibold text-ink">Avaliações Concluídas</h2>
            <div className="flex items-center gap-2">
              <select
                className="field w-auto py-2 text-sm"
                onChange={(event) => {
                  if (event.target.value) {
                    setSearchParams({ aluno: event.target.value })
                  } else {
                    setSearchParams({})
                  }
                }}
                value={alunoId ?? ''}
              >
                <option value="">Todos os alunos</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nome}
                  </option>
                ))}
              </select>
              {activeStudentName ? (
                <div className="flex items-center gap-2 rounded-full bg-accent-soft py-1 pl-3 pr-1.5 text-xs font-medium text-accent">
                  {activeStudentName.split(' ')[0]}
                  <button
                    className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-accent/20"
                    onClick={() => setSearchParams({})}
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {displayAssessments.length > 0 ? displayAssessments.map((assessment) => (
                <button
                  key={assessment.id}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-elev"
                  onClick={() =>
                    navigate('/dashboard/admin/avaliacoes/resultados', {
                      state: {
                        alunoId: assessment.alunoId ?? undefined,
                        bmi: assessment.bmi,
                        bodyFat: assessment.bodyFat,
                        date: assessment.date,
                        iac: assessment.iac,
                        massaMagra: assessment.massaMagra,
                        name: assessment.name,
                        perimetros: assessment.perimetros,
                        status: assessment.status,
                        weight: assessment.weight,
                      },
                    })
                  }
                  type="button"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-sm text-white">
                    {assessment.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{assessment.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-faint">
                      <Calendar size={11} />
                      {assessment.date}
                    </div>
                  </div>
                  <div className="hidden gap-4 sm:flex">
                    <div className="text-center">
                      <p className="text-sm text-ink">{assessment.bmi}</p>
                      <p className="text-xs text-faint">IMC</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-ink">{assessment.bodyFat}</p>
                      <p className="text-xs text-faint">Gordura</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${assessment.statusClassName}`}>
                    {assessment.status}
                  </span>
                  <ChevronRight className="text-faint" size={16} />
                </button>
              )) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-ink">Nenhuma avaliação encontrada.</p>
                  <p className="mt-1 text-xs text-faint">Este aluno ainda não possui avaliações registradas.</p>
                </div>
              )}
            </div>
          )}
        </section>
        )}
      </div>
    </DashboardShell>
  )
}
