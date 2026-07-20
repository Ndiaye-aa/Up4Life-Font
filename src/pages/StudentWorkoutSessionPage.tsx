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
          <circle cx="50" cy="50" fill="none" r="44" stroke="var(--ui-line)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="44"
            stroke="var(--ui-accent-strong)"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            strokeLinecap="round"
            strokeWidth="8"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="text-3xl font-semibold text-ink">{remaining}s</span>
      </div>
      <p className="text-sm text-mute">Descansando…</p>
      <button
        className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-elev"
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
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-mute">Treino não encontrado.</p>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-mute">Este treino ainda não tem exercícios.</p>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
          <Trophy className="text-accent" size={36} />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">Treino concluído!</h1>
          <p className="mt-2 text-sm text-mute">
            {workout.nome} · {elapsedMin} min
          </p>
        </div>
        <button
          className="btn-primary rounded-xl px-6"
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
      tone="student"
    >
      <div className="space-y-4">
        {/* Header flat */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent">
              Exercício {exIdx + 1} de {exercises.length}
            </p>
            <h1 className="font-display mt-1 text-2xl font-semibold text-ink">
              {current.nome}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-faint">
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
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
            {workout.categoria}
          </span>
        </header>

        {/* Rest timer or sets tracker */}
        <section className="card rounded-[2rem] p-6">
          {resting ? (
            <RestTimer onDone={handleRestDone} seconds={restSeconds} />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 divide-x divide-line text-center">
                <div className="p-4">
                  <p className="text-2xl font-semibold text-ink">{current.series}</p>
                  <p className="mt-1 text-xs text-faint">Séries</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-semibold text-ink">{current.repeticoes}</p>
                  <p className="mt-1 text-xs text-faint">Reps</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-semibold text-ink">
                    {current.carga || '—'}
                  </p>
                  <p className="mt-1 text-xs text-faint">Carga (kg)</p>
                </div>
              </div>

              {/* Series dots */}
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: totalSets }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                      i < doneSets
                        ? 'bg-accent-strong text-white'
                        : 'border border-line bg-elev text-faint'
                    }`}
                  >
                    {i < doneSets ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                ))}
              </div>

              {!allCurrentSetsDone && (
                <button
                  className="btn-primary w-full rounded-xl"
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium text-ink hover:bg-elev disabled:opacity-40"
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
                ? 'bg-accent-strong text-white hover:brightness-110'
                : 'border border-line text-faint'
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
        <section className="card rounded-[2rem] p-4">
          <p className="mb-3 text-xs uppercase tracking-widest text-faint">Exercícios</p>
          <div className="space-y-2">
            {exercises.map((ex, i) => {
              const sets = completedSets[i] ?? 0
              const total = Number(ex.series) || 1
              const done = sets >= total
              return (
                <div
                  key={ex.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    i === exIdx ? 'bg-accent-soft/60' : ''
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      done
                        ? 'bg-accent-strong text-white'
                        : i === exIdx
                          ? 'border-2 border-accent text-accent'
                          : 'border border-line text-faint'
                    }`}
                  >
                    {done ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span
                    className={`flex-1 text-sm ${
                      i === exIdx ? 'font-medium text-ink' : 'text-mute'
                    }`}
                  >
                    {ex.nome}
                  </span>
                  <span className="text-xs text-faint">
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
