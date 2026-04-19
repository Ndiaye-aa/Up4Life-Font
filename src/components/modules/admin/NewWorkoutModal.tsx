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
  students: LinkedStudent[]
}

export const NewWorkoutModal = ({
  idPersonal,
  initialData,
  onClose,
  onCreated,
  onUpdated,
  students,
}: NewWorkoutModalProps) => {
  const isEditMode = initialData !== undefined
  const firstStudent = students[0]
  const [workoutName, setWorkoutName] = useState(initialData?.nome ?? 'Treino A - Peito e Triceps')
  const [category, setCategory] = useState<WorkoutCategory>(initialData?.categoria ?? 'Musculacao')
  const [studentId, setStudentId] = useState<number | ''>(initialData?.id_aluno ?? firstStudent?.id ?? '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ExerciseEntry[]>(initialData?.exercicios ?? [])
  const [activeTab, setActiveTab] = useState<'catalog' | 'plan'>('catalog')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [catalog, setCatalog] = useState<ExerciseFromApi[]>([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await getAllExercisesService()
        setCatalog(data)
      } catch (error) {
        console.error('Falha ao carregar exercicios:', error)
      } finally {
        setIsLoadingCatalog(false)
      }
    }
    fetchCatalog()
  }, [])

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
      setSubmitError('Informe um nome de treino valido (min. 3 caracteres).')
      return
    }

    if (studentId === '') {
      setSubmitError('Selecione o aluno para receber o treino.')
      return
    }

    if (selected.length === 0) {
      setSubmitError('Adicione pelo menos um exercicio a planilha.')
      return
    }

    const targetStudent = students.find((item) => item.id === studentId)

    if (!targetStudent) {
      setSubmitError('Aluno selecionado nao esta vinculado ao personal.')
      return
    }

    setIsSubmitting(true)

    try {
      const base: CreateWorkoutPayload = {
        categoria: category,
        exercicios: selected,
        id_aluno: targetStudent.id,
        id_personal: idPersonal,
        nome: workoutName,
        nome_aluno: targetStudent.nome,
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
          : 'Nao foi possivel salvar o treino agora.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[95vh] w-full flex-col rounded-t-[2rem] bg-white shadow-2xl sm:max-w-4xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">
              {isEditMode ? 'Editar treino' : 'Criar treino'}
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-stone-950">
              {isEditMode ? 'Editar planilha' : 'Construtor de planilha'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Monte a planilha com series, repeticoes, carga e descanso por exercicio.
            </p>
          </div>
          <button
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <section className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-3">
            <label className="block space-y-2 sm:col-span-1">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Nome do treino
              </span>
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
                onChange={(event) => setWorkoutName(event.target.value)}
                value={workoutName}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Aluno
              </span>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
                onChange={(event) =>
                  setStudentId(event.target.value ? Number(event.target.value) : '')
                }
                value={studentId}
              >
                <option value="">Selecione o aluno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Categoria
              </span>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
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

          <div className="mt-4 flex gap-1 rounded-xl bg-gray-100 p-1 lg:hidden">
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white font-medium text-stone-950 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => setActiveTab('catalog')}
              type="button"
            >
              Catalogo
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm transition-all ${
                activeTab === 'plan'
                  ? 'bg-white font-medium text-stone-950 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => setActiveTab('plan')}
              type="button"
            >
              Planilha
              {selected.length > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed] text-xs text-white">
                  {selected.length}
                </span>
              ) : null}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section
              className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${
                activeTab === 'plan' ? 'hidden lg:block' : ''
              }`}
            >
              <div className="border-b border-gray-100 p-4">
                <h3 className="font-display text-lg font-semibold text-stone-950">
                  Catalogo de exercicios
                </h3>
                <div className="relative mt-3">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar exercicio ou musculo..."
                    value={search}
                  />
                </div>
              </div>
              <div className="max-h-[55vh] divide-y divide-gray-50 overflow-y-auto">
                {filteredCatalog.map((exercise) => {
                  const isAdded = selected.some((item) => item.id === exercise.id.toString())

                  return (
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50"
                      key={exercise.id}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Dumbbell className="text-gray-400" size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-stone-950">
                          {exercise.nome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {exercise.grupoMuscular}
                        </p>
                      </div>
                      <button
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-500'
                            : 'bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-[#7c3aed]'
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
                  <div className="px-4 py-10 text-center text-sm text-gray-400">
                    Nenhum exercicio encontrado.
                  </div>
                ) : null}
              </div>
            </section>

            <section
              className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${
                activeTab === 'catalog' ? 'hidden lg:block' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h3 className="font-display text-lg font-semibold text-stone-950">
                  Planilha{' '}
                  <span className="ml-1 text-sm text-gray-400">
                    ({selected.length} ex.)
                  </span>
                </h3>
              </div>

              {selected.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Dumbbell className="mx-auto mb-3 opacity-40" size={32} />
                  <p className="text-sm">Adicione exercicios do catalogo</p>
                  <button
                    className="mt-3 text-sm text-[#7c3aed] lg:hidden"
                    onClick={() => setActiveTab('catalog')}
                    type="button"
                  >
                    Ver catalogo
                  </button>
                </div>
              ) : (
                <div className="max-h-[55vh] divide-y divide-gray-50 overflow-y-auto">
                  {selected.map((exercise, index) => (
                    <div className="p-4" key={exercise.id}>
                      <div className="mb-3 flex items-center gap-3">
                        <GripVertical
                          className="shrink-0 cursor-grab text-gray-300"
                          size={16}
                        />
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs text-[#7c3aed]">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-stone-950">
                            {exercise.nome}
                          </p>
                          <p className="text-xs text-gray-400">
                            {exercise.musculo}
                          </p>
                        </div>
                        <button
                          className="rounded-lg p-1.5 text-gray-300 transition hover:bg-rose-50 hover:text-rose-400"
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
                            <label className="mb-1 block text-xs text-gray-400">
                              {label}
                            </label>
                            <input
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-center text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                              onChange={(event) =>
                                handleUpdateField(
                                  exercise.id,
                                  field,
                                  event.target.value,
                                )
                              }
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
                <div className="rounded-b-2xl border-t border-gray-100 bg-gray-50/50 p-4">
                  <div className="flex items-center justify-between text-sm text-stone-500">
                    <span>{totalSeries} series totais</span>
                    <span className="text-[#7c3aed]">~{selected.length * 8} min</span>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          {submitError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            <Save size={14} />
            {isSubmitting ? 'Salvando...' : isEditMode ? 'Salvar alteracoes' : 'Salvar e enviar ao aluno'}
          </button>
        </div>
      </div>
    </div>
  )
}
