import { Clock, Dumbbell, FileText, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkoutRecord } from '../@types/workout'
import { DashboardShell } from '../components/layout/DashboardShell'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { getStudentWorkoutsService } from '../services/workouts'
import { getDashboardNavItems } from '../utils/dashboardNav'

interface FichaModalProps {
  onClose: () => void
  workout: WorkoutRecord
}

const FichaModal = ({ onClose, workout }: FichaModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="card relative w-full max-w-2xl rounded-[2rem] shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line p-6">
          <div>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
              {workout.categoria}
            </span>
            <h2 className="font-display mt-2 text-xl font-semibold text-ink">
              {workout.nome}
            </h2>
            <div className="mt-1.5 flex gap-4 text-xs text-faint">
              <span className="flex items-center gap-1.5">
                <Dumbbell size={12} />
                {workout.exercicios.length} exercicios
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {workout.duracao_estimada}
              </span>
            </div>
          </div>
          <button
            className="rounded-xl p-2 text-faint transition hover:bg-elev"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {workout.exercicios.length === 0 ? (
            <p className="text-center text-sm text-faint">
              Nenhum exercicio cadastrado neste treino.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-faint">
                    <th className="pb-3 pr-4 font-medium">Exercicio</th>
                    <th className="pb-3 pr-4 font-medium">Musculo</th>
                    <th className="pb-3 pr-4 text-center font-medium">Series</th>
                    <th className="pb-3 pr-4 text-center font-medium">Reps</th>
                    <th className="pb-3 pr-4 text-center font-medium">Carga</th>
                    <th className="pb-3 text-center font-medium">Descanso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {workout.exercicios.map((ex) => (
                    <tr key={ex.id} className="text-ink">
                      <td className="py-3 pr-4 font-medium">{ex.nome}</td>
                      <td className="py-3 pr-4 text-mute">{ex.musculo}</td>
                      <td className="py-3 pr-4 text-center">{ex.series}</td>
                      <td className="py-3 pr-4 text-center">{ex.repeticoes}</td>
                      <td className="py-3 pr-4 text-center">{ex.carga}</td>
                      <td className="py-3 text-center">{ex.descanso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const StudentWorkoutsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [isLoading, setIsLoading] = useState(() => Boolean(user?.id))
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fichaWorkout, setFichaWorkout] = useState<WorkoutRecord | null>(null)

  useEffect(() => {
    if (!user?.id) {
      return
    }

    getStudentWorkoutsService(user.id)
      .then((data) => {
        setWorkouts(data)
        setFetchError(null)
      })
      .catch((err: unknown) => {
        console.error('[StudentWorkoutsPage] Erro ao buscar treinos:', err)
        setWorkouts([])
        setFetchError(err instanceof Error ? err.message : 'Erro ao carregar treinos.')
      })
      .finally(() => setIsLoading(false))
  }, [user?.id])

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
        { label: 'Total', value: String(workouts.length) },
        { label: 'Semana', value: '2/5' },
        { label: 'Historico', value: '24' },
      ]}
      roleLabel="Aluno"
      tone="student"
    >
      {fichaWorkout ? (
        <FichaModal onClose={() => setFichaWorkout(null)} workout={fichaWorkout} />
      ) : null}

      <div className="space-y-6">
        <PageHeader
          description=" "
          eyebrow="Treinos"
          title=" "
        />

        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="card h-24 animate-pulse rounded-[1.75rem]"
              />
            ))
          ) : fetchError ? (
            <div className="rounded-[1.75rem] border border-dashed border-rose-400/40 px-4 py-12 text-center">
              <p className="text-sm font-medium text-rose-400 light:text-rose-600">Erro ao carregar treinos.</p>
              <p className="mt-1 text-xs text-faint">{fetchError}</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-line px-4 py-12 text-center">
              <p className="text-sm font-medium text-ink">Nenhum treino vinculado ainda.</p>
              <p className="mt-1 text-xs text-faint">
                Aguarde seu personal configurar sua rotina de treinos.
              </p>
            </div>
          ) : (
            workouts.map((workout) => (
              <article
                key={workout.id}
                className="card rounded-[1.75rem] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
                        {workout.categoria}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-display text-xl font-semibold text-ink">
                      {workout.nome}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-faint">
                      <span className="flex items-center gap-1.5">
                        <Dumbbell size={13} />
                        {workout.exercicios.length} exercicios
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {workout.duracao_estimada}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-elev"
                      onClick={() => setFichaWorkout(workout)}
                      type="button"
                    >
                      <FileText size={14} />
                      Ficha
                    </button>
                    <button
                      className="btn-primary rounded-xl"
                      onClick={() => navigate(`/dashboard/aluno/treinos/${workout.id}/sessao`, { state: { workout } })}
                      type="button"
                    >
                      <Play size={14} />
                      Iniciar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
