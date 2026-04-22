import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Dumbbell,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    Promise.all([
      getStudentWorkoutsService(user.id),
      getStudentAssessmentsService(user.id),
    ])
      .then(([w, a]) => {
        setWorkouts(w)
        const sorted = [...a].sort(
          (x, y) => new Date(y.dataAvaliacao).getTime() - new Date(x.dataAvaliacao).getTime(),
        )
        setAssessments(sorted)
      })
      .catch(() => {
        setWorkouts([])
        setAssessments([])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  const latestAssessment = assessments[0]

  const stats = [
    {
      bg: 'bg-purple-50 text-[#A020F0]',
      color: 'text-[#7c3aed]',
      icon: Dumbbell,
      label: 'Treinos',
      value: loading ? '-' : String(workouts.length),
    },
    {
      bg: 'bg-purple-50 text-[#A020F0]',
      color: 'text-blue-600',
      icon: TrendingUp,
      label: 'Avaliacoes',
      value: loading ? '-' : String(assessments.length),
    },
    {
      bg: 'bg-purple-50 text-[#A020F0]',
      color: 'text-emerald-600',
      icon: Trophy,
      label: 'IMC atual',
      value: loading ? '-' : (latestAssessment?.imc?.toFixed(1) ?? '-'),
    },
    {
      bg: 'bg-purple-50 text-[#A020F0]',
      color: 'text-amber-500',
      icon: CheckCircle2,
      label: '% Gordura',
      value: loading
        ? '-'
        : latestAssessment?.percentualGordura
          ? `${latestAssessment.percentualGordura.toFixed(1)}%`
          : '-',
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
      subtitle="Acompanhamento rapido do treino do dia e da evolucao recente."
      tone="student"
    >
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">
              Home
            </p>
            <h1 className="font-display text-3xl font-semibold text-stone-950">
              Ola, {user?.name}
            </h1>
            <p className="text-sm leading-6 text-stone-500">
              Está pronto para treinar?
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.5rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`${stat.bg} rounded-xl p-2`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-stone-950">{stat.value}</p>
              <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4">
          <div className="rounded-[2rem] border border-[#e5e7eb] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
            <div className="border-b border-gray-100 p-4">
              <h2 className="font-display text-2xl font-semibold text-stone-950">
                Meus Treinos
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {loading && (
                <p className="p-4 text-sm text-stone-400">Carregando...</p>
              )}
              {!loading && workouts.length === 0 && (
                <p className="p-4 text-sm text-stone-400">Nenhum treino cadastrado.</p>
              )}
              {workouts.map((workout) => (
                <div key={workout.id} className="flex items-center gap-3 p-4">
                  <div className="text-emerald-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-stone-950">{workout.nome}</p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {formatDate(workout.criado_em)} · {workout.exercicios.length} exercicios
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-[#7c3aed]">
                    {workout.categoria}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
