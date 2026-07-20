import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import { PageHeader } from '../components/ui/PageHeader'
import { PushOptInBanner } from '../components/ui/PushOptInBanner'
import { StatStrip } from '../components/ui/StatStrip'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { type AssessmentRecord, getStudentAssessmentsService } from '../services/assessments'
import { getStudentWorkoutsService } from '../services/workouts'
import type { WorkoutRecord } from '../@types/workout'

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const StudentDashboardPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [loading, setLoading] = useState(() => Boolean(user?.id))
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      return
    }
    Promise.all([
      getStudentWorkoutsService(user.id),
      getStudentAssessmentsService(user.id),
    ])
      .then(([w, a]) => {
        setLoadError('')
        setWorkouts(w)
        const sorted = [...a].sort(
          (x, y) => new Date(y.dataAvaliacao).getTime() - new Date(x.dataAvaliacao).getTime(),
        )
        setAssessments(sorted)
      })
      .catch(() => {
        setWorkouts([])
        setAssessments([])
        setLoadError('Não foi possível carregar seus dados agora. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  const latestAssessment = assessments[0]

  const stats = [
    {
      label: 'Treinos',
      value: loading ? '-' : String(workouts.length),
    },
    {
      label: 'Avaliacoes',
      value: loading ? '-' : String(assessments.length),
    },
  ]

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
        { label: 'Treinos', value: loading ? '-' : String(workouts.length) },
        { label: 'Avaliacoes', value: loading ? '-' : String(assessments.length) },
        { label: 'IMC', value: loading ? '-' : (latestAssessment?.imc?.toFixed(1) ?? '-') },
      ]}
      roleLabel="Aluno"
      tone="student"
    >
      <div className="space-y-6">
        {loadError ? (
          <p className="text-sm text-rose-400 light:text-rose-600">
            {loadError}
          </p>
        ) : null}

        <PageHeader
          description="Está pronto para treinar?"
          eyebrow="Home"
          title={`Ola, ${user?.name ?? 'Aluno'}`}
        />

        <PushOptInBanner />

        <StatStrip items={stats.slice(0, 2)} />
        <StatStrip items={stats.slice(2)} />

        <section className="card rounded-[2rem]">
          <div className="border-b border-line p-4">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Meus Treinos
            </h2>
          </div>
          <div className="divide-y divide-line">
            {loading && (
              <p className="p-4 text-sm text-faint">Carregando...</p>
            )}
            {!loading && workouts.length === 0 && (
              <p className="p-4 text-sm text-faint">Nenhum treino cadastrado.</p>
            )}
            {workouts.map((workout) => (
              <div key={workout.id} className="flex items-center gap-3 p-4">
                <div className="text-emerald-400 light:text-emerald-500">
                  <CheckCircle2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{workout.nome}</p>
                  <p className="mt-0.5 text-xs text-faint">
                    {formatDate(workout.criado_em)} · {workout.exercicios.length} exercicios
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                  {workout.categoria}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
