import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { StudentCard } from '../@types/student'
import { StudentFormModal } from '../components/modules/admin/StudentFormModal'
import { StudentsListModal } from '../components/modules/admin/StudentsListModal'
import { WeeklyScheduleCard } from '../components/modules/admin/WeeklyScheduleCard'
import { DashboardShell } from '../components/layout/DashboardShell'
import { PageHeader } from '../components/ui/PageHeader'
import { PushOptInBanner } from '../components/ui/PushOptInBanner'
import { StatStrip } from '../components/ui/StatStrip'
import { useAuth } from '../hooks/useAuth'
import { mapStudentRecordToCard } from '../utils/students'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { updateStudentStatusService } from '../services/students'
import { useStudents, invalidateStudents } from '../hooks/useStudents'
import { useWorkouts } from '../hooks/useWorkouts'
import { useAssessments } from '../hooks/useAssessments'

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const personalId = user?.id
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(false)

  const { data: studentsData } = useStudents(personalId)
  const { data: workoutsData } = useWorkouts(personalId)
  const { data: assessmentsData } = useAssessments(personalId)

  const students = useMemo(
    () => (studentsData ?? []).map(mapStudentRecordToCard),
    [studentsData],
  )
  const workoutsCount = workoutsData?.length ?? null
  const assessmentsCount = assessmentsData?.length ?? null

  const activeStudents = useMemo(
    () => students.filter((student) => student.status === 'ativo'),
    [students],
  )

  const handleToggleStatus = async (student: StudentCard) => {
    try {
      await updateStudentStatusService(student.id, student.status !== 'ativo')
      await invalidateStudents()
    } catch (error) {
      console.error('Erro ao atualizar status do aluno:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o status do aluno agora.',
      )
    }
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
      navItems={getDashboardNavItems()}
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
        <StudentFormModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            invalidateStudents()
          }}
        />
      ) : null}

      <div className="space-y-6">
        <PageHeader
          description=""
          eyebrow="Home"
          title={`Ola, ${user?.name ?? 'Personal'}`}
        />

        <PushOptInBanner />

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
