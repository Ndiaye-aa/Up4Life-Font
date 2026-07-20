import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { StudentRecord } from '../@types/student'
import { NewStudentModal } from '../components/modules/admin/NewStudentModal'
import { StudentsListModal } from '../components/modules/admin/StudentsListModal'
import { WeeklyScheduleCard } from '../components/modules/admin/WeeklyScheduleCard'
import { DashboardShell } from '../components/layout/DashboardShell'
import { PageHeader } from '../components/ui/PageHeader'
import { PushOptInBanner } from '../components/ui/PushOptInBanner'
import { StatStrip } from '../components/ui/StatStrip'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getStudentsService, updateStudentStatusService } from '../services/students'
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
  status: student.ativo ? 'ativo' : 'inativo',
  telefone: student.telefone,
})

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const personalId = user?.id
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [students, setStudents] = useState<StudentCard[]>([])
  const [workoutsCount, setWorkoutsCount] = useState<number | null>(null)
  const [assessmentsCount, setAssessmentsCount] = useState<number | null>(null)
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(false)

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
      }
    }

    load()
  }, [personalId])

  const activeStudents = useMemo(
    () => students.filter((student) => student.status === 'ativo'),
    [students],
  )

  const handleToggleStatus = async (student: StudentCard) => {
    const updated = await updateStudentStatusService(
      student.id,
      student.status !== 'ativo',
    )
    setStudents((currentStudents) =>
      currentStudents.map((current) =>
        current.id === student.id ? mapStudentRecordToCard(updated) : current,
      ),
    )
  }

  const metrics = useMemo(() => [
    {
      label: 'Alunos ativos',
      onClick: () => setIsStudentsListOpen(true),
      sub: 'Total de alunos',
      value: String(activeStudents.length),
    },
  ], [activeStudents.length])

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
      tone="personal"
    >
      {isStudentsListOpen ? (
        <StudentsListModal
          onClose={() => setIsStudentsListOpen(false)}
          onToggleStatus={handleToggleStatus}
          students={students}
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
        <PageHeader
          description=""
          eyebrow="Home"
          title={`Ola, ${user?.name ?? 'Personal'}`}
        />

        <PushOptInBanner variant="personal" />

        <div className="flex items-center gap-3">
          <StatStrip items={metrics} />
          <button
            className="btn-primary shrink-0"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <Plus size={16} />
            Novo aluno
          </button>
        </div>

        <WeeklyScheduleCard personalId={personalId ?? 0} students={activeStudents} />
      </div>
    </DashboardShell>
  )
}
