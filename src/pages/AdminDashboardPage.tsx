import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Clock,
  Dumbbell,
  Plus,
  Search,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react'
import type { StudentRecord } from '../@types/student'
import { NewStudentModal } from '../components/modules/admin/NewStudentModal'
import { StudentDetailDrawer } from '../components/modules/admin/StudentDetailDrawer'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getStudentsService } from '../services/students'
import { getAllWorkoutsService } from '../services/workouts'
import { getAllAssessmentsService } from '../services/assessments'

interface StudentCard {
  goal: string
  id: number
  personalId: number
  initials: string
  lastWorkout: string
  name: string
  progress: number
  status: 'ativo' | 'inativo'
  telefone: string
}

const mapStudentRecordToCard = (student: StudentRecord): StudentCard => ({
  goal: student.historicoSaude?.trim() ? 'Saude acompanhada' : 'Novo cadastro',
  id: student.id,
  personalId: student.personalId,
  initials: student.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase() ?? '')
    .join(''),
  lastWorkout: 'Recem cadastrado',
  name: student.nome,
  progress: 0,
  status: 'ativo',
  telefone: student.telefone,
})

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const personalId = user?.id
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllStudents, setShowAllStudents] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos')
  const [students, setStudents] = useState<StudentCard[]>([])
  const [workoutsCount, setWorkoutsCount] = useState<number | null>(null)
  const [assessmentsCount, setAssessmentsCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentCard | null>(null)

  useEffect(() => {
    if (!personalId) return

    async function load() {
      try {
        const [studentsData, workoutsData, assessmentsData] = await Promise.all([
          getStudentsService(),
          getAllWorkoutsService().catch(() => []),
          getAllAssessmentsService().catch(() => []),
        ])
        setStudents(studentsData.map(mapStudentRecordToCard))
        setWorkoutsCount(workoutsData.length)
        setAssessmentsCount(assessmentsData.length)
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [personalId])

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return students.filter((student) => {
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativos' && student.status === 'ativo') ||
        (statusFilter === 'Inativos' && student.status === 'inativo')

      const matchesSearch =
        normalizedSearch.length === 0 ||
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.goal.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [students, searchTerm, statusFilter])

  const visibleStudents = useMemo(() => {
    if (showAllStudents) return filteredStudents
    return filteredStudents.slice(0, 3)
  }, [filteredStudents, showAllStudents])

  const metrics = useMemo(() => [
    {
      accent: 'bg-purple-50 text-[#A020F0]',
      change: 'Total de alunos',
      icon: Users,
      label: 'Alunos ativos',
      value: String(students.length),
    },
    {
      accent: 'bg-purple-50 text-[#A020F0]',
      change: 'Total de treinos',
      icon: Dumbbell,
      label: 'Treinos',
      value: workoutsCount != null ? String(workoutsCount) : '…',
    },
    {
      accent: 'bg-purple-50 text-[#A020F0]',
      change: 'Total de avaliacoes',
      icon: ClipboardList,
      label: 'Avaliacoes',
      value: assessmentsCount != null ? String(assessmentsCount) : '…',
    },
    {
      accent: 'bg-purple-50 text-[#A020F0]',
      change: 'Sem dados',
      icon: TrendingUp,
      label: 'Engajamento',
      value: '—',
    },
  ], [students.length, workoutsCount, assessmentsCount])

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
        { label: 'Alunos', value: String(students.length) },
        { label: 'Treinos', value: workoutsCount != null ? String(workoutsCount) : '…' },
        { label: 'Avaliacoes', value: assessmentsCount != null ? String(assessmentsCount) : '…' },
      ]}
      roleLabel="Personal Trainer"
      subtitle="Central de gestao com alunos, treinos e avaliacoes na mesma tela."
      tone="personal"
    >
      {selectedStudent ? (
        <StudentDetailDrawer
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
        />
      ) : null}

      {isModalOpen ? (
        <NewStudentModal
          idPersonal={personalId ?? 1}
          onClose={() => setIsModalOpen(false)}
          onCreated={(student) => {
            setStudents((currentStudents) => [
              mapStudentRecordToCard(student),
              ...currentStudents,
            ])
          }}
        />
      ) : null}

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">
                Home
              </p>
              <h1 className="font-display text-3xl font-semibold text-stone-950">
                Ola, {user?.name}
              </h1>
              <p className="text-sm leading-6 text-stone-500">
                Vamos começar?
              </p>
            </div>
            <button
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-stone-950 px-6 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              <Plus size={16} />
              Novo aluno
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[1.5rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-xl p-2 ${metric.accent}`}>
                  <metric.icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-stone-950">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-stone-500">{metric.label}</p>
              <p className="mt-2 text-xs text-stone-400">{metric.change}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="border-b border-gray-100 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl font-semibold text-stone-950">
                Meus Alunos
              </h2>
              <select
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as 'Todos' | 'Ativos' | 'Inativos',
                  )
                  setShowAllStudents(false)
                }}
                value={statusFilter}
              >
                <option>Todos</option>
                <option>Ativos</option>
                <option>Inativos</option>
              </select>
            </div>

            <div className="relative mt-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={15}
              />
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setShowAllStudents(false)
                }}
                placeholder="Buscar aluno ou objetivo..."
                value={searchTerm}
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#7c3aed] border-t-transparent" />
                <p className="text-sm font-medium text-stone-500">
                  Carregando sua lista de alunos...
                </p>
              </div>
            ) : visibleStudents.length > 0 ? (
              visibleStudents.map((student) => (
                <button
                  key={student.id}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50"
                  onClick={() => setSelectedStudent(student)}
                  type="button"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-sm font-semibold text-white">
                    {student.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-stone-950">
                        {student.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          student.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-stone-400">
                      {student.goal} · Ultimo treino {student.lastWorkout}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 sm:hidden">
                      <div
                        className="h-full rounded-full bg-[#7c3aed]"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="hidden w-28 flex-col items-end gap-1.5 sm:flex">
                    <div className="flex w-full items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#7c3aed]"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-stone-500">
                        {student.progress}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <Clock size={11} />
                      {student.lastWorkout}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300" size={16} />
                </button>
              ))
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-stone-700">
                  Nenhum aluno encontrado.
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Ajuste a busca ou o filtro para ver os alunos vinculados a este personal.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">
                {visibleStudents.length} aluno(s) exibido(s)
              </span>
              <button
                className="text-xs font-medium text-[#7c3aed] transition hover:text-[#6d28d9]"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('Todos')
                  setShowAllStudents(true)
                }}
                type="button"
              >
                Ver todos
              </button>
            </div>
          </div>
        </section>

        <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-3 lg:hidden">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30"
            onClick={() => navigate('/dashboard/admin/avaliacoes')}
            type="button"
          >
            <ClipboardList size={20} />
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-950 text-white shadow-lg"
            onClick={() => navigate('/dashboard/admin/treinos')}
            type="button"
          >
            <Dumbbell size={20} />
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}
