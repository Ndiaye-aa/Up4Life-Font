import { AlertCircle, Clock, Dumbbell, FileText, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkoutRecord } from '../@types/workout'
import { DashboardShell } from '../components/layout/DashboardShell'
import { NewExerciseModal } from '../components/modules/admin/NewExerciseModal'
import { NewWorkoutModal } from '../components/modules/admin/NewWorkoutModal'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { exportWorkoutPdf } from '../utils/workoutPdf'
import { getAllWorkoutsService, deleteWorkoutService } from '../services/workouts'
import { getStudentsService } from '../services/students'

const buildInitials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

const WorkoutCardMenu: React.FC<{
  isDeleting: boolean
  onDelete: () => void
}> = ({ isDeleting, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Opções do treino"
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-9 z-20 min-w-[160px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <button
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={() => {
              if (!window.confirm('Tem certeza que deseja deletar este treino? Esta ação não pode ser desfeita.')) return
              onDelete()
              setIsOpen(false)
            }}
            type="button"
          >
            <Trash2 size={14} />
            {isDeleting ? 'Deletando...' : 'Deletar treino'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export const AdminWorkoutsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [linkedStudents, setLinkedStudents] = useState<{ id: number; nome: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<WorkoutRecord | null>(null)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    async function load() {
      try {
        const [wsResult, ssResult] = await Promise.allSettled([
          getAllWorkoutsService(),
          getStudentsService(),
        ])

        if (wsResult.status === 'fulfilled') {
          setWorkouts(wsResult.value)
        } else {
          setLoadError('Não foi possível carregar os treinos. Tente novamente.')
        }

        if (ssResult.status === 'fulfilled') {
          setLinkedStudents(ssResult.value.map((student) => ({ id: student.id, nome: student.nome })))
        } else {
          setLoadError('Não foi possível carregar os alunos vinculados. Faça login novamente.')
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id])

  // TODO(security): GET /treinos retorna todos os treinos no payload de rede.
  // O backend deve filtrar pelo personal autenticado via JWT antes deste filtro cliente ter efeito.
  const linkedWorkouts = useMemo(
    () => workouts.filter((workout) => workout.id_personal === user?.id),
    [user?.id, workouts],
  )

  const filteredWorkouts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) return linkedWorkouts
    return linkedWorkouts.filter(
      (workout) =>
        workout.nome.toLowerCase().includes(normalized) ||
        workout.nome_aluno.toLowerCase().includes(normalized),
    )
  }, [linkedWorkouts, searchTerm])

  const overviewItems = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return [
      { label: 'Ativos', value: String(linkedWorkouts.filter((item) => item.ativo).length) },
      { label: 'Hoje', value: String(linkedWorkouts.filter((w) => w.criado_em?.startsWith(today)).length) },
      { label: 'Modelos', value: String(linkedWorkouts.length) },
    ]
  }, [linkedWorkouts])

  // useAuth já redireciona para /login quando não autenticado — este guard é para o TypeScript
  if (!user) return null

  const personalId = user.id

  const openCreate = () => {
    setEditingWorkout(null)
    setIsModalOpen(true)
  }

  const openEdit = (workout: WorkoutRecord) => {
    setEditingWorkout(workout)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingWorkout(null)
  }

  const handleCreated = (workout: WorkoutRecord) => {
    setWorkouts((current) => [workout, ...current])
  }

  const handleUpdated = (updated: WorkoutRecord) => {
    setWorkouts((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  const handleDelete = async (workoutId: number) => {
    setDeletingId(workoutId)
    setDeleteError(null)
    try {
      await deleteWorkoutService(workoutId)
      setWorkouts((current) => current.filter((item) => item.id !== workoutId))
    } catch {
      setDeleteError('Não foi possível deletar o treino. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardShell
      contact={user.phone ?? ''}
      name={user.name ?? 'Personal'}
      navItems={getDashboardNavItems('PERSONAL')}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={overviewItems}
      roleLabel="Personal Trainer"
      subtitle="Biblioteca de treinos com acesso rapido para criar, revisar e reaproveitar estruturas."
      tone="personal"
    >
      {isExerciseModalOpen ? (
        <NewExerciseModal
          onClose={() => setIsExerciseModalOpen(false)}
          onCreated={() => setIsExerciseModalOpen(false)}
        />
      ) : null}

      {isModalOpen ? (
        <NewWorkoutModal
          idPersonal={personalId}
          initialData={editingWorkout ?? undefined}
          onClose={closeModal}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
          students={linkedStudents}
        />
      ) : null}

      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">Treinos</p>
            <h1 className="font-display mt-2 text-3xl font-semibold text-stone-950">
              Planilhas de treino
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Gerencie treinos e exercícios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-gray-50"
              onClick={() => setIsExerciseModalOpen(true)}
              type="button"
            >
              <Plus size={16} />
              Criar exercícios
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              onClick={openCreate}
              type="button"
            >
              <Plus size={16} />
              Criar treino
            </button>
          </div>
        </section>

        {loadError ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} />
            {loadError}
          </div>
        ) : null}

        {deleteError ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} />
            {deleteError}
          </div>
        ) : null}

        <section className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar treino ou aluno..."
            value={searchTerm}
          />
        </section>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7c3aed] border-t-transparent" />
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <article
                className="rounded-[1.5rem] border border-[#e5e7eb] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
                key={workout.id}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-[#7c3aed]">
                    {workout.categoria}
                  </span>
                  <WorkoutCardMenu
                    isDeleting={deletingId === workout.id}
                    onDelete={() => handleDelete(workout.id)}
                  />
                </div>

                <h3 className="font-display text-xl font-semibold text-stone-950">
                  {workout.nome}
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-xs font-semibold text-white">
                    {buildInitials(workout.nome_aluno)}
                  </div>
                  <span className="text-sm text-stone-500">{workout.nome_aluno}</span>
                </div>

                <div className="mt-4 flex gap-4 text-xs text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell size={13} />
                    {workout.exercicios.length > 0
                      ? `${workout.exercicios.length} exercicios`
                      : '—'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {workout.duracao_estimada}
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-gray-50"
                    onClick={() => openEdit(workout)}
                    type="button"
                  >
                    <Pencil size={13} />
                    Editar
                  </button>
                  <button
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-stone-600 transition hover:bg-gray-50"
                    onClick={() => exportWorkoutPdf(workout)}
                    title="Exportar planilha em PDF"
                    type="button"
                  >
                    <FileText size={13} />
                    PDF
                  </button>
                </div>
              </article>
            ))}

            {filteredWorkouts.length === 0 ? (
              <div className="col-span-full rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-stone-700">
                  Nenhum treino encontrado.
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Ajuste a busca ou crie um novo treino para esta biblioteca.
                </p>
              </div>
            ) : (
              <button
                className="group flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-gray-200 bg-gray-50 p-5 transition hover:border-[#7c3aed]/40 hover:bg-purple-50/30"
                onClick={openCreate}
                type="button"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-purple-100">
                  <Plus className="text-gray-400 group-hover:text-[#7c3aed]" size={20} />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-[#7c3aed]">
                  Criar novo treino
                </span>
              </button>
            )}
          </section>
        )}
      </div>
    </DashboardShell>
  )
}
