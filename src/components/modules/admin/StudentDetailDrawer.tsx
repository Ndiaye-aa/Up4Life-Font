import {
  X,
  Phone,
  Target,
  Dumbbell,
  ClipboardList,
  ChevronRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkoutRecord } from '../../../@types/workout'
import { getStudentWorkoutsService } from '../../../services/workouts'
import { getStudentAssessmentsService, type AssessmentRecord } from '../../../services/assessments'

interface StudentCard {
  goal: string
  id: number
  personalId: number
  initials: string
  lastWorkout: string
  name: string
  progress: number
  status: 'ativo' | 'inativo'
  telefone: string
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Cardio:      { bg: 'bg-orange-50', text: 'text-orange-600' },
  Funcional:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
  Mobilidade:  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Musculacao:  { bg: 'bg-purple-50', text: 'text-purple-600' },
}

interface Props {
  onClose: () => void
  student: StudentCard
}

export const StudentDetailDrawer = ({ onClose, student }: Props) => {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true)
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null)

  useEffect(() => {
    setIsLoadingWorkouts(true)
    getStudentWorkoutsService(student.id)
      .then(setWorkouts)
      .catch(() => setWorkouts([]))
      .finally(() => setIsLoadingWorkouts(false))

    getStudentAssessmentsService(student.id)
      .then((records) => setLatestAssessment(records[0] ?? null))
      .catch(() => setLatestAssessment(null))
  }, [student.id])

  const imc = latestAssessment?.imc != null
    ? latestAssessment.imc.toFixed(1)
    : '—'

  const gordura = latestAssessment?.percentualGordura != null
    ? `${latestAssessment.percentualGordura.toFixed(1)}%`
    : '—'

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-md">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <p className="text-sm uppercase tracking-[0.2em] text-[#7c3aed]">
            Perfil do Aluno
          </p>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 space-y-4 p-5">
          {/* Profile header */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-lg font-semibold text-white">
                  {student.initials}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                    student.status === 'ativo' ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-stone-950">
                      {student.name}
                    </h2>
                    <p className="text-sm text-stone-400">Aluno · Cadastrado</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs ${
                      student.status === 'ativo'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Phone size={12} />
                    {student.telefone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Target size={12} />
                    {student.goal}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-4">
              {[
                { bg: 'bg-purple-50', color: 'text-purple-600', label: 'Treinos', value: isLoadingWorkouts ? '…' : String(workouts.length) },
                { bg: 'bg-orange-50', color: 'text-orange-500', label: 'Sequência', value: '—' },
                { bg: 'bg-blue-50',   color: 'text-blue-600',   label: '% Gordura', value: gordura },
                { bg: 'bg-emerald-50', color: 'text-emerald-600', label: 'IMC', value: imc },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                  <p className={`text-base font-semibold ${s.color}`}>{s.value}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workouts list */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50">
                  <Dumbbell className="text-purple-600" size={16} />
                </div>
                <h3 className="font-display font-semibold text-stone-900">Treinos</h3>
              </div>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">
                {workouts.filter((w) => w.ativo).length} ativos
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {isLoadingWorkouts ? (
                <div className="flex justify-center p-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#7c3aed] border-t-transparent" />
                </div>
              ) : workouts.length > 0 ? (
                workouts.map((w) => {
                  const style = CATEGORY_STYLES[w.categoria] ?? { bg: 'bg-gray-50', text: 'text-gray-500' }
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                        <Dumbbell className={style.text} size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900">{w.nome}</p>
                        <p className="mt-0.5 text-xs text-stone-400">
                          {w.exercicios.length} exercícios · {w.duracao_estimada}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            w.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {w.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${style.bg} ${style.text}`}>
                          {w.categoria}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="p-4 text-xs text-stone-400">Nenhum treino cadastrado.</p>
              )}
            </div>
          </div>

          {/* Avaliações */}
          <button
            className="group flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            onClick={() => {
              navigate(`/dashboard/admin/avaliacoes?aluno=${student.id}`)
              onClose()
            }}
            type="button"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
              <ClipboardList className="text-blue-600" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-stone-900">Avaliações</h3>
              <p className="mt-0.5 text-xs text-stone-400">
                Ver avaliações de {student.name.split(' ')[0]}
              </p>
            </div>
            <ChevronRight className="flex-shrink-0 text-gray-300 transition-colors group-hover:text-blue-400" size={18} />
          </button>
        </div>
      </aside>
    </>
  )
}
