import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { StudentCard, StudentRecord } from '../@types/student'
import { DashboardShell } from '../components/layout/DashboardShell'
import { StudentFormModal } from '../components/modules/admin/StudentFormModal'
import { StudentProfileModal } from '../components/modules/admin/StudentProfileModal'
import { PageHeader } from '../components/ui/PageHeader'
import { useAssessments } from '../hooks/useAssessments'
import { useAuth } from '../hooks/useAuth'
import { invalidateStudents, useStudents } from '../hooks/useStudents'
import { useWorkouts } from '../hooks/useWorkouts'
import {
  deleteStudentService,
  updateStudentStatusService,
} from '../services/students'
import { formatPhone } from '../utils/formatPhone'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { mapStudentRecordToCard } from '../utils/students'

const STATUS_OPTIONS = ['Todos', 'Ativos', 'Inativos'] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

type FormState = { student?: StudentRecord } | null

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

export const AdminStudentsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const personalId = user?.id

  const { data: studentsData, error: studentsError, isLoading } = useStudents(personalId)
  const { data: workoutsData } = useWorkouts(personalId)
  const { data: assessmentsData } = useAssessments(personalId)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
  const [formState, setFormState] = useState<FormState>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentCard | null>(null)
  const [actionError, setActionError] = useState('')

  const records = useMemo(() => studentsData ?? [], [studentsData])
  const students = useMemo(() => records.map(mapStudentRecordToCard), [records])

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return students.filter((student) => {
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativos' ? student.status === 'ativo' : student.status === 'inativo')
      const matchesSearch =
        term.length === 0 ||
        student.name.toLowerCase().includes(term) ||
        student.telefone.includes(term.replace(/\D/g, '') || term)

      return matchesStatus && matchesSearch
    })
  }, [students, searchTerm, statusFilter])

  const handleToggleStatus = async (student: StudentCard) => {
    setActionError('')
    try {
      await updateStudentStatusService(student.id, student.status !== 'ativo')
      await invalidateStudents()
    } catch (error) {
      setActionError(errorMessage(error, 'Não foi possível atualizar o status do aluno agora.'))
    }
  }

  const handleDelete = async (student: StudentCard) => {
    const confirmed = window.confirm(
      `Excluir ${student.name}? Os treinos e avaliações deste aluno também serão removidos. Essa ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    setActionError('')
    try {
      await deleteStudentService(student.id)
      await invalidateStudents()
    } catch (error) {
      setActionError(errorMessage(error, 'Não foi possível excluir o aluno agora.'))
    }
  }

  const activeCount = students.filter((student) => student.status === 'ativo').length

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Personal'}
      navItems={getDashboardNavItems()}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={[
        { label: 'Alunos', value: String(students.length) },
        { label: 'Treinos', value: workoutsData ? String(workoutsData.length) : '…' },
        { label: 'Avaliacoes', value: assessmentsData ? String(assessmentsData.length) : '…' },
      ]}
      roleLabel="Personal Trainer"
      tone="personal"
    >
      {formState ? (
        <StudentFormModal
          onClose={() => setFormState(null)}
          onSaved={() => {
            void invalidateStudents()
          }}
          student={formState.student}
        />
      ) : null}

      {selectedStudent ? (
        <StudentProfileModal
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
        />
      ) : null}

      <div className="space-y-6">
        <PageHeader
          action={
            <button
              className="btn-primary shrink-0"
              onClick={() => setFormState({})}
              type="button"
            >
              <Plus size={16} />
              Novo aluno
            </button>
          }
          description={`${activeCount} ativos de ${students.length} cadastrados`}
          eyebrow="Alunos"
          title="Meus alunos"
        />

        <div className="space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
              size={16}
            />
            <input
              className="field pl-10"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome ou telefone"
              type="text"
              value={searchTerm}
            />
          </div>

          <div className="grid grid-cols-3 rounded-2xl bg-elev p-1 sm:max-w-sm">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                className={`rounded-[0.85rem] px-3 py-2 text-xs font-medium transition ${
                  option === statusFilter
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-mute hover:text-accent'
                }`}
                onClick={() => setStatusFilter(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {studentsError ? (
          <p className="text-sm text-rose-400 light:text-rose-600">
            Não foi possível carregar seus alunos agora. Tente recarregar a página.
          </p>
        ) : null}
        {actionError ? (
          <p className="text-sm text-rose-400 light:text-rose-600">{actionError}</p>
        ) : null}

        <section className="card divide-y divide-line rounded-2xl">
          {isLoading && !studentsData ? (
            <div className="flex justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <p className="p-8 text-center text-sm text-faint">
              {students.length === 0
                ? 'Você ainda não cadastrou nenhum aluno.'
                : 'Nenhum aluno encontrado.'}
            </p>
          ) : (
            filteredStudents.map((student) => {
              const isActive = student.status === 'ativo'
              const record = records.find((item) => item.id === student.id)

              return (
                <div className="flex items-center gap-3 p-4" key={student.id}>
                  <button
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition hover:opacity-80"
                    onClick={() => setSelectedStudent(student)}
                    type="button"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-xs font-semibold text-white">
                      {student.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{student.name}</p>
                      <p className="truncate text-xs text-faint">
                        {formatPhone(student.telefone)} · {student.goal}
                      </p>
                    </div>
                  </button>

                  <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold sm:inline ${
                      isActive ? 'bg-accent-soft text-accent' : 'bg-elev text-faint'
                    }`}
                  >
                    {isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <button
                    aria-label={isActive ? `Desativar ${student.name}` : `Ativar ${student.name}`}
                    aria-pressed={isActive}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                      isActive ? 'bg-accent-strong' : 'bg-line'
                    }`}
                    onClick={() => void handleToggleStatus(student)}
                    title={isActive ? 'Desativar aluno' : 'Ativar aluno'}
                    type="button"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        isActive ? 'left-[1.125rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <button
                    aria-label={`Editar ${student.name}`}
                    className="shrink-0 rounded-lg p-2 text-faint transition hover:bg-elev hover:text-ink"
                    disabled={!record}
                    onClick={() => record && setFormState({ student: record })}
                    type="button"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    aria-label={`Excluir ${student.name}`}
                    className="shrink-0 rounded-lg p-2 text-faint transition hover:bg-elev hover:text-rose-400"
                    onClick={() => void handleDelete(student)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })
          )}
        </section>
      </div>
    </DashboardShell>
  )
}
