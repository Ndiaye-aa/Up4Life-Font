import { CheckCircle2, ChevronLeft, ChevronRight, Clock, CloudOff, Dumbbell, Loader2, Trophy } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DashboardShell } from '../components/layout/DashboardShell'
import { FinishSessionModal, type FinishSessionValues } from '../components/modules/session/FinishSessionModal'
import { HealthConsentModal } from '../components/modules/session/HealthConsentModal'
import { useAuth } from '../hooks/useAuth'
import { invalidateProgress } from '../hooks/useProgress'
import { invalidateSessions } from '../hooks/useSessions'
import { useSessionDraft, type PendingFinish } from '../hooks/useSessionDraft'
import { ApiError } from '../services/api'
import {
  acceptHealthConsentService,
  createSessionService,
  listSessionsService,
  updateSessionService,
} from '../services/sessionService'
import type { SessionItem, SessionRecord } from '../@types/session'
import { todayIn } from '../utils/sessionFormat'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getStudentWorkoutsService } from '../services/workouts'
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

const isRetryable = (error: unknown): boolean =>
  !(error instanceof ApiError) || error.status >= 500 || error.status === 408

export const StudentWorkoutSessionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { logout, user } = useAuth()

  const hoje = todayIn(user?.timezone ?? 'America/Sao_Paulo')
  const draftStore = useSessionDraft(user?.id, hoje)

  const stateWorkout = location.state?.workout as WorkoutRecord | undefined
  const [fetchedWorkout, setFetchedWorkout] = useState<WorkoutRecord | undefined>(undefined)
  const [isFetchingWorkout, setIsFetchingWorkout] = useState(!stateWorkout)
  const workout = stateWorkout ?? fetchedWorkout

  const [exIdx, setExIdx] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<number, number>>({})
  const [cargas, setCargas] = useState<Record<number, string>>({})
  const [resting, setResting] = useState(false)
  const [finished, setFinished] = useState(false)
  const [elapsedMin, setElapsedMin] = useState(0)

  // Sessão no servidor
  const [session, setSession] = useState<SessionRecord | null>(null)
  const [existingDone, setExistingDone] = useState<SessionRecord | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const iniciadaEmRef = useRef<string>(new Date().toISOString())
  const startedRef = useRef(false)
  // Não usar `cancelled` no cleanup do efeito de abertura: no StrictMode (dev) o
  // cleanup roda entre o 1º e o 2º mount e descartaria o resultado, deixando a
  // tela em loading para sempre. `mountedRef` só bloqueia setState após o
  // desmonte real.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Envio final
  const [showFinish, setShowFinish] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [pending, setPending] = useState<PendingFinish | null>(null)
  const [pendingError, setPendingError] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)
  const lastFeedback = useRef<FinishSessionValues | null>(null)

  // Sem workout no state (F5, link direto ou bookmark): busca pelo id da URL.
  useEffect(() => {
    if (stateWorkout || !user?.id || !id) {
      setIsFetchingWorkout(false)
      return
    }
    let cancelled = false
    const workoutId = Number(id)

    getStudentWorkoutsService(user.id)
      .then((workouts) => {
        if (cancelled) return
        setFetchedWorkout(workouts.find((w) => w.id === workoutId))
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error('Erro ao carregar treino da sessão:', error)
      })
      .finally(() => { if (!cancelled) setIsFetchingWorkout(false) })

    return () => { cancelled = true }
  }, [stateWorkout, user?.id, id])

  // Ao abrir: restaura o rascunho e procura/cria a sessão de hoje (PARCIAL, com iniciadaEm).
  useEffect(() => {
    if (!workout || !user?.id || startedRef.current) return
    startedRef.current = true

    const draft = draftStore.load()
    const sameWorkout = draft?.treinoId === workout.id ? draft : null
    if (sameWorkout) {
      setCompletedSets(sameWorkout.completedSets)
      setCargas(sameWorkout.cargas)
      iniciadaEmRef.current = sameWorkout.iniciadaEm
      if (sameWorkout.pendingFinish) {
        setPending(sameWorkout.pendingFinish)
        setPendingError('Pendente de envio — tentar novamente.')
      }
    }

    const start = async () => {
      try {
        const [existing] = await listSessionsService('me', hoje, hoje)
        if (!mountedRef.current) return

        if (existing?.status === 'REALIZADA') {
          setExistingDone(existing)
          return
        }
        if (existing) {
          // PARCIAL em andamento ou pré-justificada: retoma/reativa a mesma sessão do dia.
          const active =
            existing.status === 'PARCIAL'
              ? existing
              : await updateSessionService(existing.id, {
                  version: existing.version,
                  status: 'PARCIAL',
                  iniciadaEm: iniciadaEmRef.current,
                })
          if (mountedRef.current) setSession(active)
          return
        }
        const created = await createSessionService({
          data: hoje,
          status: 'PARCIAL',
          treinoId: workout.id,
          iniciadaEm: iniciadaEmRef.current,
        })
        if (mountedRef.current) setSession(created)
      } catch (error) {
        // Sem rede/cold start: o treino segue localmente e a sessão é criada ao concluir.
        console.error('Não foi possível abrir a sessão no servidor:', error)
      } finally {
        if (mountedRef.current) setSessionReady(true)
      }
    }
    void start()
  }, [workout, user?.id, hoje, draftStore])

  // Persiste o rascunho a cada mudança relevante.
  useEffect(() => {
    if (!workout || !sessionReady || finished) return
    draftStore.save({
      treinoId: workout.id,
      sessionId: session?.id ?? null,
      version: session?.version ?? null,
      iniciadaEm: iniciadaEmRef.current,
      completedSets,
      cargas,
      pendingFinish: pending,
    })
  }, [workout, sessionReady, finished, session, completedSets, cargas, pending, draftStore])

  const exercises = useMemo(() => workout?.exercicios ?? [], [workout])
  const current = exercises[exIdx]
  const totalSets = current ? Number(current.series) || 1 : 0
  const doneSets = completedSets[exIdx] ?? 0
  const restSeconds = current ? Number(current.descanso) || 60 : 60

  const buildItems = useCallback(
    (): SessionItem[] =>
      exercises.map((ex, index) => ({
        ordem: index + 1,
        exercicio: ex.nome,
        seriesFeitas: completedSets[index] ?? 0,
        repsFeitas: ex.repeticoes || undefined,
        cargaTexto: (cargas[index] ?? ex.carga) || undefined,
        concluido: (completedSets[index] ?? 0) >= (Number(ex.series) || 1),
      })),
    [exercises, completedSets, cargas],
  )

  /** Envia a conclusão: PATCH na sessão aberta ou POST se ela nunca chegou ao servidor. */
  const sendFinish = useCallback(
    async (feedback: PendingFinish) => {
      if (!workout) return
      const base = {
        status: 'REALIZADA' as const,
        concluidaEm: feedback.concluidaEm,
        itens: buildItems(),
        rpe: feedback.rpe,
        disposicao: feedback.disposicao,
        dor: feedback.dor,
        dorLocal: feedback.dor ? feedback.dorLocal : undefined,
        comentarioAluno: feedback.comentarioAluno || undefined,
      }
      const target = session
      try {
        if (target) {
          await updateSessionService(target.id, { ...base, version: target.version })
        } else {
          await createSessionService({
            ...base,
            data: hoje,
            treinoId: workout.id,
            iniciadaEm: iniciadaEmRef.current,
          })
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 409 && target) {
          // Alterada por outra pessoa (ex.: personal): recarrega a versão e pede nova tentativa.
          const [fresh] = await listSessionsService('me', hoje, hoje).catch(() => [])
          if (fresh) setSession(fresh)
          throw new Error('O registro foi alterado, tente enviar novamente.')
        }
        throw error
      }
      draftStore.clear()
      void invalidateSessions('me')
      void invalidateProgress('me')
      setElapsedMin(Math.max(0, Math.round((Date.now() - new Date(iniciadaEmRef.current).getTime()) / 60000)))
      setPending(null)
      setFinished(true)
    },
    [workout, session, buildItems, hoje, draftStore],
  )

  const submitFinish = useCallback(
    async (values: FinishSessionValues) => {
      lastFeedback.current = values
      const feedback: PendingFinish = {
        concluidaEm: new Date().toISOString(),
        rpe: values.rpe,
        disposicao: values.disposicao,
        dor: values.dor,
        dorLocal: values.dorLocal || undefined,
        comentarioAluno: values.comentarioAluno || undefined,
      }
      try {
        await sendFinish(feedback)
        setShowFinish(false)
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          // Dor exige o consentimento de saúde (RN12): pede e reenvia.
          setPending(feedback)
          setShowConsent(true)
          return
        }
        if (isRetryable(error)) {
          // Timeout/cold start/sem rede: mantém o rascunho e oferece nova tentativa.
          setPending(feedback)
          setPendingError('Pendente de envio — tentar novamente.')
          setShowFinish(false)
          return
        }
        throw error
      }
    },
    [sendFinish],
  )

  const retryPending = useCallback(async () => {
    if (!pending) return
    setIsRetrying(true)
    try {
      await sendFinish(pending)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        // Dor exige o consentimento de saúde (RN12): mesmo caminho do envio normal.
        setShowConsent(true)
        return
      }
      setPendingError(
        error instanceof Error ? `Não enviado: ${error.message}` : 'Pendente de envio — tentar novamente.',
      )
    } finally {
      setIsRetrying(false)
    }
  }, [pending, sendFinish])

  const acceptConsent = useCallback(async () => {
    await acceptHealthConsentService()
    setShowConsent(false)
    if (lastFeedback.current) {
      await submitFinish(lastFeedback.current)
    } else if (pending) {
      // Envio pendente restaurado do rascunho (sem o formulário em memória).
      await sendFinish(pending)
    }
  }, [submitFinish, sendFinish, pending])

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
      setShowFinish(true)
    }
  }, [exIdx, exercises.length])

  const handlePrev = useCallback(() => {
    if (exIdx > 0) {
      setExIdx((i) => i - 1)
      setResting(false)
    }
  }, [exIdx])

  if (isFetchingWorkout || (workout && !sessionReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    )
  }

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

  if (existingDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
        <CheckCircle2 className="text-emerald-400" size={40} />
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Treino de hoje já registrado</h1>
          <p className="mt-2 text-sm text-mute">
            Só é possível registrar um treino por dia. Você pode ajustar o registro no seu progresso.
          </p>
        </div>
        <button className="btn-primary rounded-xl px-6" onClick={() => navigate('/dashboard/aluno/progresso')} type="button">
          Ver meu progresso
        </button>
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
        <div className="flex gap-3">
          <button
            className="rounded-xl border border-line px-6 py-3 text-sm font-medium text-ink hover:bg-elev"
            onClick={() => navigate('/dashboard/aluno/progresso')}
            type="button"
          >
            Ver progresso
          </button>
          <button
            className="btn-primary rounded-xl px-6"
            onClick={() => navigate('/dashboard/aluno/treinos')}
            type="button"
          >
            Voltar aos treinos
          </button>
        </div>
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
      {showFinish ? (
        <FinishSessionModal
          initialError={pendingError}
          onClose={() => setShowFinish(false)}
          onSubmit={submitFinish}
        />
      ) : null}
      {showConsent ? (
        <HealthConsentModal
          onAccept={acceptConsent}
          onClose={() => {
            setShowConsent(false)
            setShowFinish(true)
          }}
        />
      ) : null}

      <div className="space-y-4">
        {pending && !showConsent ? (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4" role="status">
            <CloudOff className="shrink-0 text-amber-400" size={18} />
            <p className="min-w-0 flex-1 text-sm text-ink">{pendingError || 'Pendente de envio — tentar novamente.'}</p>
            <button className="btn-primary rounded-xl px-4 py-2" disabled={isRetrying} onClick={() => void retryPending()} type="button">
              {isRetrying ? 'Enviando...' : 'Tentar novamente'}
            </button>
          </div>
        ) : null}

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
                  <input
                    aria-label="Carga usada"
                    className="w-full bg-transparent text-center text-2xl font-semibold text-ink outline-none placeholder:text-faint"
                    maxLength={30}
                    onChange={(event) => setCargas((prev) => ({ ...prev, [exIdx]: event.target.value }))}
                    placeholder={current.carga || '—'}
                    value={cargas[exIdx] ?? ''}
                  />
                  <p className="mt-1 text-xs text-faint">Carga usada (kg)</p>
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
