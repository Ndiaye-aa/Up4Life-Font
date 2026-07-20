import { Check, Dumbbell, GripVertical, Plus, Save, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type {
  CreateWorkoutPayload,
  ExerciseEntry,
  UpdateWorkoutPayload,
  WorkoutCategory,
  WorkoutRecord,
} from '../../../@types/workout'
import { createWorkoutService, updateWorkoutService } from '../../../services/workouts'
import { getAllExercisesService, type ExerciseFromApi } from '../../../services/exercises'

const CATEGORY_OPTIONS: WorkoutCategory[] = [
  'Musculacao',
  'Funcional',
  'Mobilidade',
  'Cardio',
]

interface LinkedStudent {
  id: number
  nome: string
}

interface NewWorkoutModalProps {
  idPersonal: number
  initialData?: WorkoutRecord
  onClose: () => void
  onCreated: (workout: WorkoutRecord) => void
  onUpdated?: (workout: WorkoutRecord) => void
  personalName?: string
  students: LinkedStudent[]
}

export const NewWorkoutModal = ({
  idPersonal,
  initialData,
  onClose,
  onCreated,
  onUpdated,
  personalName,
  students,
}: NewWorkoutModalProps) => {
  const isEditMode = initialData !== undefined
  const firstStudent = students[0]
  const [workoutName, setWorkoutName] = useState(initialData?.nome ?? 'Treino ')
  const [category, setCategory] = useState<WorkoutCategory>(initialData?.categoria ?? 'Musculacao')
  const [studentId, setStudentId] = useState<number | 'self' | ''>(
    initialData ? (initialData.id_aluno ?? 'self') : (firstStudent?.id ?? ''),
  )
  const [observations, setObservations] = useState(initialData?.observacoes ?? '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ExerciseEntry[]>(initialData?.exercicios ?? [])
  const [activeTab, setActiveTab] = useState<'catalog' | 'plan'>('catalog')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [catalog, setCatalog] = useState<ExerciseFromApi[]>([])
  const [catalogError, setCatalogError] = useState('')
  const [catalogReloadKey, setCatalogReloadKey] = useState(0)

  useEffect(() => {
    if (studentId === 'self') {
      return
    }

    if (studentId !== '' && students.some((student) => student.id === studentId)) {
      return
    }

    if (initialData) {
      setStudentId(initialData.id_aluno ?? 'self')
      return
    }

    setStudentId(students[0]?.id ?? '')
  }, [initialData, studentId, students])

  useEffect(() => {
    const fetchCatalog = async () => {
      setCatalogError('')
      try {
        const data = await getAllExercisesService()
        setCatalog(data)
      } catch (error) {
        console.error('Falha ao carregar exercícios:', error)
        setCatalogError('Não foi possível carregar o catálogo de exercícios.')
      }
    }
    fetchCatalog()
  }, [catalogReloadKey])

  const filteredCatalog = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    if (!normalized) {
      return catalog
    }

    return catalog.filter(
      (exercise) =>
        exercise.nome.toLowerCase().includes(normalized) ||
        exercise.grupoMuscular.toLowerCase().includes(normalized),
    )
  }, [catalog, search])

  const totalSeries = useMemo(
    () =>
      selected.reduce((accumulator, exercise) => {
        const parsed = Number.parseInt(exercise.series, 10)

        return accumulator + (Number.isNaN(parsed) ? 0 : parsed)
      }, 0),
    [selected],
  )

  const handleAddExercise = (exerciseId: string) => {
    const catalogItem = catalog.find((item) => item.id.toString() === exerciseId)

    if (!catalogItem || selected.some((item) => item.id === exerciseId)) {
      return
    }

    setSelected((current) => [
      ...current,
      {
        carga: '',
        descanso: '60',
        id: catalogItem.id.toString(),
        musculo: catalogItem.grupoMuscular,
        nome: catalogItem.nome,
        repeticoes: '12',
        series: '3',
      },
    ])
  }

  const handleRemoveExercise = (exerciseId: string) => {
    setSelected((current) => current.filter((item) => item.id !== exerciseId))
  }

  const handleUpdateField = (
    exerciseId: string,
    field: 'carga' | 'descanso' | 'repeticoes' | 'series',
    value: string,
  ) => {
    setSelected((current) =>
      current.map((item) =>
        item.id === exerciseId ? { ...item, [field]: value } : item,
      ),
    )
  }

  const handleSubmit = async () => {
    setSubmitError('')

    if (workoutName.trim().length < 3) {
      setSubmitError('Informe um nome de treino válido (min. 3 caracteres).')
      return
    }

    if (studentId === '') {
      setSubmitError('Selecione quem vai receber o treino.')
      return
    }

    if (selected.length === 0) {
      setSubmitError('Adicione pelo menos um exercício a planilha.')
      return
    }

    const hasInvalidNumbers = selected.some((item) => {
      const series = Number.parseInt(item.series, 10)
      const descanso = Number.parseInt(item.descanso, 10)
      return Number.isNaN(series) || series <= 0 || Number.isNaN(descanso) || descanso < 0
    })

    if (hasInvalidNumbers) {
      setSubmitError('Preencha séries e descanso com valores numericos válidos em todos os exercícios.')
      return
    }

    const targetStudent =
      studentId === 'self' ? null : students.find((item) => item.id === studentId)

    if (studentId !== 'self' && !targetStudent) {
      setSubmitError('Aluno selecionado não esta vinculado ao personal.')
      return
    }

    setIsSubmitting(true)

    try {
      const base: CreateWorkoutPayload = {
        categoria: category,
        exercicios: selected,
        id_aluno: targetStudent?.id ?? null,
        id_personal: idPersonal,
        nome: workoutName,
        nome_aluno: targetStudent?.nome ?? personalName ?? 'Você',
        observacoes: observations,
      }

      if (isEditMode) {
        const payload: UpdateWorkoutPayload = { ...base, id: initialData.id }
        const updatedWorkout = await updateWorkoutService(payload)
        onUpdated?.(updatedWorkout)
      } else {
        const createdWorkout = await createWorkoutService(base)
        onCreated(createdWorkout)
      }
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o treino agora.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex max-h-[95vh] w-full flex-col rounded-t-[2rem] border border-line bg-surface shadow-2xl sm:max-w-4xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent">
              {isEditMode ? 'Editar treino' : 'Criar treino'}
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-ink">
              {isEditMode ? 'Editar planilha' : 'Construtor de planilha'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-mute">
              Monte a planilha com séries, repetições, carga e descanso por exercício.
            </p>
          </div>
          <button
            className="rounded-xl p-2 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <section className="grid gap-3 border-b border-line pb-4 sm:grid-cols-3">
            <label className="block space-y-2 sm:col-span-1">
              <span className="text-xs font-medium uppercase tracking-wider text-mute">
                Nome do treino
              </span>
              <input
                className="field"
                onChange={(event) => setWorkoutName(event.target.value)}
                value={workoutName}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-mute">
                Aluno
              </span>
              <select
                className="field"
                onChange={(event) => {
                  const { value } = event.target
                  setStudentId(value === 'self' ? 'self' : value ? Number(value) : '')
                }}
                value={studentId}
              >
                <option value="">Selecione o aluno</option>
                <option value="self">Eu mesmo ({personalName ?? 'personal'})</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-mute">
                Categoria
              </span>
              <select
                className="field"
                onChange={(event) =>
                  setCategory(event.target.value as WorkoutCategory)
                }
                value={category}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-mute">
              Obs
              <span className="ml-1 normal-case text-faint">(opcional)</span>
            </span>
            <textarea
              className="field resize-none"
              onChange={(event) => setObservations(event.target.value)}
              placeholder="Observações sobre o treino, adaptações, cuidados especiais..."
              rows={2}
              value={observations}
            />
          </label>

          <div className="mt-4 flex gap-1 rounded-xl bg-elev p-1 lg:hidden">
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${
                activeTab === 'catalog'
                  ? 'bg-surface font-medium text-ink shadow-sm'
                  : 'text-mute'
              }`}
              onClick={() => setActiveTab('catalog')}
              type="button"
            >
              Catalogo
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm transition-all ${
                activeTab === 'plan'
                  ? 'bg-surface font-medium text-ink shadow-sm'
                  : 'text-mute'
              }`}
              onClick={() => setActiveTab('plan')}
              type="button"
            >
              Planilha
              {selected.length > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-strong text-xs text-white">
                  {selected.length}
                </span>
              ) : null}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section
              className={`rounded-2xl border border-line ${
                activeTab === 'plan' ? 'hidden lg:block' : ''
              }`}
            >
              <div className="border-b border-line p-4">
                <h3 className="font-display text-lg font-semibold text-ink">
                  Catalogo de exercícios
                </h3>
                <div className="relative mt-3">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                    size={15}
                  />
                  <input
                    className="field pl-9"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar exercicio ou musculo..."
                    value={search}
                  />
                </div>
              </div>
              {catalogError ? (
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-sm text-rose-400 light:text-rose-600">
                  <span>{catalogError}</span>
                  <button
                    className="shrink-0 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/25 light:bg-rose-100 light:text-rose-700"
                    onClick={() => setCatalogReloadKey((key) => key + 1)}
                    type="button"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : null}
              <div className="max-h-[55vh] divide-y divide-line overflow-y-auto">
                {filteredCatalog.map((exercise) => {
                  const isAdded = selected.some((item) => item.id === exercise.id.toString())

                  return (
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-elev"
                      key={exercise.id}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elev">
                        <Dumbbell className="text-faint" size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">
                          {exercise.nome}
                        </p>
                        <p className="text-xs text-faint">
                          {exercise.grupoMuscular}
                        </p>
                      </div>
                      <button
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                          isAdded
                            ? 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-500'
                            : 'bg-elev text-mute hover:bg-accent-soft hover:text-accent'
                        }`}
                        disabled={isAdded}
                        onClick={() => handleAddExercise(exercise.id.toString())}
                        type="button"
                      >
                        {isAdded ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  )
                })}
                {filteredCatalog.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-faint">
                    Nenhum exercício encontrado.
                  </div>
                ) : null}
              </div>
            </section>

            <section
              className={`rounded-2xl border border-line ${
                activeTab === 'catalog' ? 'hidden lg:block' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-line p-4">
                <h3 className="font-display text-lg font-semibold text-ink">
                  Planilha{' '}
                  <span className="ml-1 text-sm text-faint">
                    ({selected.length} ex.)
                  </span>
                </h3>
              </div>

              {selected.length === 0 ? (
                <div className="py-16 text-center text-faint">
                  <Dumbbell className="mx-auto mb-3 opacity-40" size={32} />
                  <p className="text-sm">Adicione exercícios do catalogo</p>
                  <button
                    className="mt-3 text-sm text-accent lg:hidden"
                    onClick={() => setActiveTab('catalog')}
                    type="button"
                  >
                    Ver catalogo
                  </button>
                </div>
              ) : (
                <div className="max-h-[55vh] divide-y divide-line overflow-y-auto">
                  {selected.map((exercise, index) => (
                    <div className="p-4" key={exercise.id}>
                      <div className="mb-3 flex items-center gap-3">
                        <GripVertical
                          className="shrink-0 cursor-grab text-faint"
                          size={16}
                        />
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-ink">
                            {exercise.nome}
                          </p>
                          <p className="text-xs text-faint">
                            {exercise.musculo}
                          </p>
                        </div>
                        <button
                          className="rounded-lg p-1.5 text-faint transition hover:bg-rose-500/10 hover:text-rose-400"
                          onClick={() => handleRemoveExercise(exercise.id)}
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(
                          [
                            { field: 'series', label: 'Series' },
                            { field: 'repeticoes', label: 'Reps' },
                            { field: 'carga', label: 'Carga' },
                            { field: 'descanso', label: 'Desc.(s)' },
                          ] as const
                        ).map(({ field, label }) => (
                          <div key={field}>
                            <label className="mb-1 block text-xs text-faint">
                              {label}
                            </label>
                            <input
                              className="w-full rounded-lg border border-line bg-elev px-2 py-2 text-center text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                              inputMode={field === 'series' || field === 'descanso' ? 'numeric' : undefined}
                              onChange={(event) =>
                                handleUpdateField(
                                  exercise.id,
                                  field,
                                  event.target.value,
                                )
                              }
                              pattern={field === 'series' || field === 'descanso' ? '[0-9]*' : undefined}
                              value={exercise[field]}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected.length > 0 ? (
                <div className="rounded-b-2xl border-t border-line bg-elev/60 p-4">
                  <div className="flex items-center justify-between text-sm text-mute">
                    <span>{totalSeries} series totais</span>
                    <span className="text-accent">~{selected.length * 8} min</span>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          {submitError ? (
            <div className="mt-4 text-sm text-rose-400 light:text-rose-600">
              {submitError}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-elev"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            <Save size={14} />
            {isSubmitting
              ? 'Salvando...'
              : isEditMode
                ? 'Salvar alteracoes'
                : studentId === 'self'
                  ? 'Salvar meu treino'
                  : 'Salvar e enviar ao aluno'}
          </button>
        </div>
      </div>
    </div>
  )
}
