import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Dumbbell, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import type { WorkoutRecord } from '../@types/workout'

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onDone()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onDone])

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="44" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="44"
            stroke="#7c3aed"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            strokeLinecap="round"
            strokeWidth="8"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="text-3xl font-semibold text-stone-950">{remaining}s</span>
      </div>
      <p className="text-sm text-stone-500">Descansando…</p>
      <button
        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-gray-50"
        onClick={onDone}
        type="button"
      >
        Pular descanso
      </button>
    </div>
  )
}

export const StudentWorkoutSessionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const workout = location.state?.workout as WorkoutRecord | undefined

  const [exIdx, setExIdx] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<number, number>>({})
  const [resting, setResting] = useState(false)
  const [finished, setFinished] = useState(false)
  const startRef = useRef(Date.now())

  const exercises = workout?.exercicios ?? []
  const current = exercises[exIdx]
  const totalSets = current ? Number(current.series) || 1 : 0
  const doneSets = completedSets[exIdx] ?? 0
  const restSeconds = current ? Number(current.descanso) || 60 : 60

  const handleSetDone = useCallback(() => {
    const next = doneSets + 1
    setCompletedSets((prev) => ({ ...prev, [exIdx]: next }))
    if (next < totalSets) {
      setResting(true)
    }
  }, [doneSets, exIdx, totalSets])

  const handleRestDone = useCallback(() => setResting(false), [])

  const handleNext = useCallback(() => {
    if (exIdx < exercises.length - 1) {
      setExIdx((i) => i + 1)
      setResting(false)
    } else {
      setFinished(true)
    }
  }, [exIdx, exercises.length])

  const handlePrev = useCallback(() => {
    if (exIdx > 0) {
      setExIdx((i) => i - 1)
      setResting(false)
    }
  }, [exIdx])

  const elapsedMin = Math.round((Date.now() - startRef.current) / 60000)

  if (!workout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-stone-500">Treino não encontrado.</p>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
          <Trophy className="text-[#7c3aed]" size={36} />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-stone-950">Treino concluído!</h1>
          <p className="mt-2 text-sm text-stone-500">
            {workout.nome} · {elapsedMin} min
          </p>
        </div>
        <button
          className="rounded-xl bg-stone-950 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800"
          onClick={() => navigate('/dashboard/aluno/treinos')}
          type="button"
        >
          Voltar aos treinos
        </button>
      </div>
    )
  }

  const allCurrentSetsDone = doneSets >= totalSets
  const isLastExercise = exIdx === exercises.length - 1

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
        { label: 'Exercicio', value: `${exIdx + 1}/${exercises.length}` },
        { label: 'Series', value: `${doneSets}/${totalSets}` },
      ]}
      roleLabel="Aluno"
      subtitle={workout.nome}
      tone="student"
    >
      <div className="space-y-4">
        {/* Header */}
        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">
                Exercício {exIdx + 1} de {exercises.length}
              </p>
              <h1 className="font-display mt-1 text-2xl font-semibold text-stone-950">
                {current.nome}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Dumbbell size={12} />
                  {current.musculo}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {current.descanso}s descanso
                </span>
              </div>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-[#7c3aed]">
              {workout.categoria}
            </span>
          </div>
        </section>

        {/* Rest timer or sets tracker */}
        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
          {resting ? (
            <RestTimer onDone={handleRestDone} seconds={restSeconds} />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-2xl font-semibold text-stone-950">{current.series}</p>
                  <p className="mt-1 text-xs text-stone-400">Séries</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-2xl font-semibold text-stone-950">{current.repeticoes}</p>
                  <p className="mt-1 text-xs text-stone-400">Reps</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-2xl font-semibold text-stone-950">
                    {current.carga || '—'}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">Carga (kg)</p>
                </div>
              </div>

              {/* Series dots */}
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: totalSets }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                      i < doneSets
                        ? 'bg-[#7c3aed] text-white'
                        : 'border border-gray-200 bg-gray-50 text-stone-400'
                    }`}
                  >
                    {i < doneSets ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                ))}
              </div>

              {!allCurrentSetsDone && (
                <button
                  className="w-full rounded-xl bg-stone-950 py-3 text-sm font-medium text-white hover:bg-stone-800"
                  onClick={handleSetDone}
                  type="button"
                >
                  Concluir série {doneSets + 1}/{totalSets}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-stone-700 hover:bg-gray-50 disabled:opacity-40"
            disabled={exIdx === 0}
            onClick={handlePrev}
            type="button"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition ${
              allCurrentSetsDone
                ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                : 'border border-gray-200 text-stone-400'
            }`}
            disabled={!allCurrentSetsDone}
            onClick={handleNext}
            type="button"
          >
            {isLastExercise ? 'Finalizar' : 'Próximo'}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Exercise list overview */}
        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
          <p className="mb-3 text-xs uppercase tracking-widest text-stone-400">Exercícios</p>
          <div className="space-y-2">
            {exercises.map((ex, i) => {
              const sets = completedSets[i] ?? 0
              const total = Number(ex.series) || 1
              const done = sets >= total
              return (
                <div
                  key={ex.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    i === exIdx ? 'bg-purple-50' : ''
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      done
                        ? 'bg-[#7c3aed] text-white'
                        : i === exIdx
                          ? 'border-2 border-[#7c3aed] text-[#7c3aed]'
                          : 'border border-gray-200 text-stone-400'
                    }`}
                  >
                    {done ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span
                    className={`flex-1 text-sm ${
                      i === exIdx ? 'font-medium text-stone-950' : 'text-stone-500'
                    }`}
                  >
                    {ex.nome}
                  </span>
                  <span className="text-xs text-stone-400">
                    {sets}/{total}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
