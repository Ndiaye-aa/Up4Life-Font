import { Clock, Dumbbell, FileText, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkoutRecord } from '../@types/workout'
import { DashboardShell } from '../components/layout/DashboardShell'
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[2rem] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-[#7c3aed]">
              {workout.categoria}
            </span>
            <h2 className="font-display mt-2 text-xl font-semibold text-stone-950">
              {workout.nome}
            </h2>
            <div className="mt-1.5 flex gap-4 text-xs text-stone-400">
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
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {workout.exercicios.length === 0 ? (
            <p className="text-center text-sm text-stone-400">
              Nenhum exercicio cadastrado neste treino.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-stone-400">
                    <th className="pb-3 pr-4 font-medium">Exercicio</th>
                    <th className="pb-3 pr-4 font-medium">Musculo</th>
                    <th className="pb-3 pr-4 text-center font-medium">Series</th>
                    <th className="pb-3 pr-4 text-center font-medium">Reps</th>
                    <th className="pb-3 pr-4 text-center font-medium">Carga</th>
                    <th className="pb-3 text-center font-medium">Descanso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {workout.exercicios.map((ex) => (
                    <tr key={ex.id} className="text-stone-700">
                      <td className="py-3 pr-4 font-medium">{ex.nome}</td>
                      <td className="py-3 pr-4 text-stone-500">{ex.musculo}</td>
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
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fichaWorkout, setFichaWorkout] = useState<WorkoutRecord | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setFetchError(null)
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
      subtitle="Lista de treinos com leitura rapida e acesso imediato ao treino do dia."
      tone="student"
    >
      {fichaWorkout ? (
        <FichaModal onClose={() => setFichaWorkout(null)} workout={fichaWorkout} />
      ) : null}

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">Treinos</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-stone-950">Fichas de treino</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Acompanhe as fichas recebidas pelo seu personal e acesse seus treinos.
          </p>
        </section>

        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-[1.75rem] border border-[#e5e7eb] bg-white"
              />
            ))
          ) : fetchError ? (
            <div className="rounded-[1.75rem] border border-dashed border-red-200 bg-red-50 px-4 py-12 text-center">
              <p className="text-sm font-medium text-red-700">Erro ao carregar treinos.</p>
              <p className="mt-1 text-xs text-red-400">{fetchError}</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
              <p className="text-sm font-medium text-stone-700">Nenhum treino vinculado ainda.</p>
              <p className="mt-1 text-xs text-stone-400">
                Aguarde seu personal configurar sua rotina de treinos.
              </p>
            </div>
          ) : (
            workouts.map((workout) => (
              <article
                key={workout.id}
                className="rounded-[1.75rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-[#7c3aed]">
                        {workout.categoria}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-display text-xl font-semibold text-stone-950">
                      {workout.nome}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-400">
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
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-gray-50"
                      onClick={() => setFichaWorkout(workout)}
                      type="button"
                    >
                      <FileText size={14} />
                      Ficha
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
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
