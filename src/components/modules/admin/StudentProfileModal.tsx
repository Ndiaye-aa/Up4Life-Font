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
import { formatPhone } from '../../../utils/formatPhone'

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
  Cardio:      { bg: 'bg-orange-500/12 light:bg-orange-50', text: 'text-orange-400 light:text-orange-600' },
  Funcional:   { bg: 'bg-blue-500/12 light:bg-blue-50',   text: 'text-blue-400 light:text-blue-600' },
  Mobilidade:  { bg: 'bg-emerald-500/12 light:bg-emerald-50', text: 'text-emerald-400 light:text-emerald-600' },
  Musculacao:  { bg: 'bg-accent-soft', text: 'text-accent' },
}

interface Props {
  onClose: () => void
  student: StudentCard
}

export const StudentProfileModal = ({ onClose, student }: Props) => {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true)
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    setIsLoadingWorkouts(true)
    setLoadError('')
    getStudentWorkoutsService(student.id)
      .then(setWorkouts)
      .catch(() => {
        setWorkouts([])
        setLoadError('Não foi possível carregar os dados deste aluno agora.')
      })
      .finally(() => setIsLoadingWorkouts(false))

    getStudentAssessmentsService(student.id)
      .then((records) => setLatestAssessment(records[0] ?? null))
      .catch(() => {
        setLatestAssessment(null)
        setLoadError('Não foi possível carregar os dados deste aluno agora.')
      })
  }, [student.id])

  const imc = latestAssessment?.imc != null
    ? latestAssessment.imc.toFixed(1)
    : '—'

  const gordura = latestAssessment?.percentualGordura != null
    ? `${latestAssessment.percentualGordura.toFixed(1)}%`
    : '—'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-[1.6rem] border border-line bg-surface shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">
            Perfil do Aluno
          </p>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 space-y-4 p-5">
          {loadError ? (
            <p className="text-sm text-rose-400 light:text-rose-600">
              {loadError}
            </p>
          ) : null}
          {/* Profile header */}
          <div className="p-1">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-lg font-semibold text-white">
                  {student.initials}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface ${
                    student.status === 'ativo' ? 'bg-emerald-500' : 'bg-faint'
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {student.name}
                    </h2>
                    <p className="text-sm text-faint">Aluno · Cadastrado</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs ${
                      student.status === 'ativo'
                        ? 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600'
                        : 'bg-elev text-mute'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-mute">
                    <Phone size={12} />
                    {formatPhone(student.telefone)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-mute">
                    <Target size={12} />
                    {student.goal}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-4">
              {[
                { label: '% Gordura', value: gordura },
                { label: 'IMC', value: imc },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-elev p-3">
                  <p className="text-base font-semibold text-accent">{s.value}</p>
                  <p className="mt-0.5 text-xs text-mute">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workouts list */}
          <div className="border-t border-line">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft">
                  <Dumbbell className="text-accent" size={16} />
                </div>
                <h3 className="font-display font-semibold text-ink">Treinos</h3>
              </div>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                {workouts.filter((w) => w.ativo).length} ativos
              </span>
            </div>

            <div className="divide-y divide-line">
              {isLoadingWorkouts ? (
                <div className="flex justify-center p-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                </div>
              ) : workouts.length > 0 ? (
                workouts.map((w) => {
                  const style = CATEGORY_STYLES[w.categoria] ?? { bg: 'bg-elev', text: 'text-mute' }
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                        <Dumbbell className={style.text} size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{w.nome}</p>
                        <p className="mt-0.5 text-xs text-faint">
                          {w.exercicios.length} exercícios · {w.duracao_estimada}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            w.ativo ? 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600' : 'bg-elev text-mute'
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
                <p className="p-4 text-xs text-faint">Nenhum treino cadastrado.</p>
              )}
            </div>
          </div>

          {/* Avaliações */}
          <button
            className="group flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left transition-all hover:bg-elev"
            onClick={() => {
              navigate(`/dashboard/admin/avaliacoes?aluno=${student.id}`)
              onClose()
            }}
            type="button"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft transition-colors">
              <ClipboardList className="text-accent" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-ink">Avaliações</h3>
              <p className="mt-0.5 text-xs text-faint">
                Ver avaliações de {student.name.split(' ')[0]}
              </p>
            </div>
            <ChevronRight className="flex-shrink-0 text-faint transition-colors group-hover:text-accent" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
