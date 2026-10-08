import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { StudentRecord } from '../@types/student'
import { DashboardShell } from '../components/layout/DashboardShell'
import { NewStudentModal } from '../components/modules/admin/NewStudentModal'
import { StudentProgressList } from '../components/modules/admin/StudentProgressList'
import { PageHeader } from '../components/ui/PageHeader'
import { useAssessments } from '../hooks/useAssessments'
import { useAuth } from '../hooks/useAuth'
import { useProgressSummary } from '../hooks/useProgressSummary'
import { invalidateStudents, useStudents } from '../hooks/useStudents'
import { useWorkouts } from '../hooks/useWorkouts'
import { updateStudentStatusService } from '../services/students'
import { getDashboardNavItems } from '../utils/dashboardNav'

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'alertas', label: 'Com alertas' },
  { value: 'inativos', label: 'Inativos' },
] as const
type Filter = (typeof FILTERS)[number]['value']

export const AdminStudentsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout, user } = useAuth()
  const personalId = user?.id

  const students = useStudents(personalId)
  const summary = useProgressSummary(personalId)
  const { data: workouts } = useWorkouts(personalId)
  const { data: assessments } = useAssessments(personalId)

  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [actionError, setActionError] = useState('')

  const filter: Filter = FILTERS.some((f) => f.value === searchParams.get('filtro'))
    ? (searchParams.get('filtro') as Filter)
    : 'todos'

  const summaryById = useMemo(
    () => new Map((summary.data ?? []).map((row) => [row.alunoId, row])),
    [summary.data],
  )
  const records = useMemo(() => students.data ?? [], [students.data])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return records.filter((student) => {
      if (term && !student.nome.toLowerCase().includes(term)) return false
      if (filter === 'inativos') return !student.ativo
      if (filter === 'alertas') return (summaryById.get(student.id)?.alertas.length ?? 0) > 0
      return true
    })
  }, [records, search, filter, summaryById])

  const alertCount = records.filter((s) => (summaryById.get(s.id)?.alertas.length ?? 0) > 0).length

  const toggleStatus = async (student: StudentRecord) => {
    setActionError('')
    try {
      await updateStudentStatusService(student.id, !student.ativo)
      await invalidateStudents()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Não foi possível atualizar o status do aluno agora.',
      )
    }
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
        { label: 'Alunos', value: String(records.length) },
        { label: 'Treinos', value: workouts ? String(workouts.length) : '…' },
        { label: 'Avaliacoes', value: assessments ? String(assessments.length) : '…' },
      ]}
      roleLabel="Personal Trainer"
      tone="personal"
    >
      {showNew ? (
        <NewStudentModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            void invalidateStudents()
          }}
        />
      ) : null}

      <div className="space-y-6">
        <PageHeader
          action={
            <button className="btn-primary shrink-0" onClick={() => setShowNew(true)} type="button">
              <Plus size={16} />
              Novo aluno
            </button>
          }
          description={
            alertCount > 0
              ? `${alertCount} ${alertCount === 1 ? 'aluno precisa' : 'alunos precisam'} de atenção`
              : 'Frequência e alertas dos seus alunos'
          }
          eyebrow="Alunos"
          title="Acompanhamento"
        />

        <div className="space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
              size={16}
            />
            <input
              className="field pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar aluno pelo nome"
              type="search"
              value={search}
            />
          </div>
          <div className="grid grid-cols-3 rounded-2xl bg-elev p-1 sm:max-w-sm" role="tablist">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                aria-selected={option.value === filter}
                className={`rounded-[0.85rem] px-3 py-2 text-xs font-medium transition ${
                  option.value === filter ? 'bg-surface text-ink shadow-sm' : 'text-mute hover:text-accent'
                }`}
                onClick={() =>
                  setSearchParams(option.value === 'todos' ? {} : { filtro: option.value }, { replace: true })
                }
                role="tab"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {students.error ? (
          <p className="text-sm text-rose-400 light:text-rose-600">
            Não foi possível carregar seus alunos agora. Tente recarregar a página.
          </p>
        ) : null}
        {summary.error ? (
          <p className="text-sm text-amber-400 light:text-amber-700">
            Não foi possível carregar a frequência dos alunos agora.
          </p>
        ) : null}
        {actionError ? <p className="text-sm text-rose-400 light:text-rose-600">{actionError}</p> : null}

        {students.isLoading && !students.data ? (
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : visible.length === 0 ? (
          <p className="card rounded-2xl p-8 text-center text-sm text-faint">
            {records.length === 0 ? 'Você ainda não cadastrou nenhum aluno.' : 'Nenhum aluno encontrado.'}
          </p>
        ) : (
          <StudentProgressList
            onOpen={(student) => navigate(`/dashboard/admin/alunos/${student.id}`)}
            onToggleStatus={(student) => void toggleStatus(student)}
            students={visible}
            summary={summaryById}
          />
        )}
      </div>
    </DashboardShell>
  )
}
