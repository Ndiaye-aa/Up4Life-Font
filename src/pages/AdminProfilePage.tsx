import { Activity, Bell, Camera, Download, Dumbbell, KeyRound, Pencil, UserPen } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WorkoutRecord } from '../@types/workout'
import { DashboardShell } from '../components/layout/DashboardShell'
import { ChangePasswordModal } from '../components/modules/admin/ChangePasswordModal'
import { EditPersonalDataModal } from '../components/modules/admin/EditPersonalDataModal'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { exportWorkoutPdf } from '../utils/workoutPdf'
import { getStudentsService } from '../services/students'
import { getAllWorkoutsService } from '../services/workouts'
import { getAllAssessmentsService, type AssessmentRecord } from '../services/assessments'
import { formatPhone } from '../utils/formatPhone'

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Cardio: { bg: 'bg-orange-500/12 light:bg-orange-50', text: 'text-orange-400 light:text-orange-600' },
  Funcional: { bg: 'bg-blue-500/12 light:bg-blue-50', text: 'text-blue-400 light:text-blue-600' },
  Mobilidade: { bg: 'bg-emerald-500/12 light:bg-emerald-50', text: 'text-emerald-400 light:text-emerald-600' },
  Musculacao: { bg: 'bg-accent-soft', text: 'text-accent' },
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR')
}

export const AdminProfilePage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'data' | 'password' | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [counts, setCounts] = useState({ alunos: 0, avaliacoes: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const push = usePushNotifications()

  useEffect(() => {
    Promise.all([getStudentsService(), getAllWorkoutsService(), getAllAssessmentsService()])
      .then(([students, allWorkouts, allAssessments]) => {
        setWorkouts(allWorkouts)
        setAssessments(allAssessments)
        setCounts({ alunos: students.length, avaliacoes: allAssessments.length })
      })
      .catch(() => {
        setWorkouts([])
        setAssessments([])
        setCounts({ alunos: 0, avaliacoes: 0 })
      })
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const selfWorkouts = workouts.filter((workout) => workout.id_aluno === null)
  const selfAssessments = useMemo(
    () => assessments.filter((assessment) => assessment.alunoId == null),
    [assessments],
  )

  const chartData = useMemo(() => {
    return selfAssessments
      .slice()
      .sort((a, b) => new Date(a.dataAvaliacao).getTime() - new Date(b.dataAvaliacao).getTime())
      .map((a) => {
        const massaMagra = a.percentualGordura ? a.peso * (1 - a.percentualGordura / 100) : 0
        return {
          bodyFat: a.percentualGordura ? parseFloat(a.percentualGordura.toString()) : 0,
          month: new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { month: 'short' }),
          muscle: parseFloat(massaMagra.toFixed(1)),
          weight: parseFloat(a.peso.toString()),
        }
      })
  }, [selfAssessments])

  const tooltipStyle = {
    backgroundColor: 'var(--ui-surface)',
    border: '1px solid var(--ui-line)',
    borderRadius: '12px',
    color: 'var(--ui-ink)',
    fontSize: '12px',
  }
  const chartTick = { fill: 'var(--ui-faint)', fontSize: 10 }

  const openModal = (modal: 'data' | 'password') => {
    setMenuOpen(false)
    setActiveModal(modal)
  }

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Personal'}
      navItems={getDashboardNavItems('PERSONAL')}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={[
        { label: 'Alunos', value: String(counts.alunos) },
        { label: 'Treinos', value: String(workouts.length) },
        { label: 'Aval.', value: String(counts.avaliacoes) },
      ]}
      roleLabel="Personal Trainer"
      tone="personal"
    >
      <PageHeader
        eyebrow="Perfil"
        title=" "
        description=" "
      />

      <div className="mx-auto w-full max-w-4xl space-y-4">
        <section className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-2xl text-white">
                {user?.name?.charAt(0)}
              </div>
              <button
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Editar perfil"
                className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent-strong text-white shadow-lg transition hover:brightness-110"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                <Pencil size={13} />
              </button>

              {menuOpen ? (
                <div
                  className="absolute left-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl"
                  role="menu"
                >
                  <button
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-ink transition hover:bg-elev"
                    onClick={() => openModal('data')}
                    role="menuitem"
                    type="button"
                  >
                    <UserPen className="text-mute" size={15} />
                    Dados pessoais
                  </button>
                  <button
                    className="flex w-full cursor-not-allowed items-center gap-2.5 px-4 py-3 text-left text-sm text-ink opacity-50"
                    disabled
                    role="menuitem"
                    type="button"
                  >
                    <Camera className="text-mute" size={15} />
                    Alterar foto de perfil
                    <span className="ml-auto whitespace-nowrap rounded-full bg-elev px-2 py-0.5 text-[10px] uppercase tracking-wide text-faint">
                      Em breve
                    </span>
                  </button>
                  <button
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-ink transition hover:bg-elev"
                    onClick={() => openModal('password')}
                    role="menuitem"
                    type="button"
                  >
                    <KeyRound className="text-mute" size={15} />
                    Alterar senha
                  </button>
                </div>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-ink">{user?.name}</h2>
              <p className="truncate text-sm text-mute">{formatPhone(user?.phone ?? '')}</p>
              <span className="mt-2 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                Personal Trainer
              </span>
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">Meus treinos</h3>
            </div>
          </div>

          {selfWorkouts.length === 0 ? (
            <div className="py-12 text-center text-faint">
              <Dumbbell className="mx-auto mb-3 opacity-40" size={32} />
              <p className="text-sm">Você ainda não criou treinos para si.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {selfWorkouts.map((workout) => {
                const style = CATEGORY_STYLES[workout.categoria] ?? {
                  bg: 'bg-elev',
                  text: 'text-mute',
                }

                return (
                  <div className="flex items-center gap-3 px-5 py-3.5" key={workout.id}>
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${style.bg}`}
                    >
                      <Dumbbell className={style.text} size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{workout.nome}</p>
                      <p className="mt-0.5 text-xs text-faint">
                        {workout.exercicios.length} exercícios · criado em{' '}
                        {formatDate(workout.criado_em)}
                      </p>
                    </div>
                    <button
                      aria-label="Exportar PDF"
                      className="rounded-xl p-2 text-faint transition hover:bg-elev hover:text-ink"
                      onClick={() => exportWorkoutPdf(workout)}
                      title="Exportar PDF"
                      type="button"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">Minhas avaliações</h3>
            </div>
            {selfAssessments.length > 0 ? (
              <button
                className="text-xs font-medium text-accent hover:underline"
                onClick={() => navigate('/dashboard/admin/avaliacoes')}
                type="button"
              >
                Ver histórico completo
              </button>
            ) : null}
          </div>

          {selfAssessments.length === 0 ? (
            <div className="py-12 text-center text-faint">
              <Activity className="mx-auto mb-3 opacity-40" size={32} />
              <p className="text-sm">Você ainda não registrou avaliações para si.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">Peso &amp; % Gordura</h4>
                <p className="mb-3 text-xs text-faint">Evolução histórica</p>
                <ResponsiveContainer height={180} width="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={chartTick} />
                    <YAxis tick={chartTick} width={30} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      dataKey="weight"
                      dot={{ fill: '#8b5cf6', r: 3 }}
                      name="Peso (kg)"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      type="monotone"
                    />
                    <Line
                      dataKey="bodyFat"
                      dot={{ fill: '#3b82f6', r: 3 }}
                      name="% Gordura"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-ink">Massa Muscular</h4>
                <p className="mb-3 text-xs text-faint">Evolução histórica</p>
                <ResponsiveContainer height={180} width="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={chartTick} />
                    <YAxis tick={chartTick} width={30} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      dataKey="muscle"
                      dot={{ fill: '#10b981', r: 3 }}
                      name="Massa magra (kg)"
                      stroke="#10b981"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </div>

      {activeModal === 'data' ? (
        <EditPersonalDataModal onClose={() => setActiveModal(null)} />
      ) : null}
      {activeModal === 'password' ? (
        <ChangePasswordModal onClose={() => setActiveModal(null)} />
      ) : null}
    </DashboardShell>
  )
}
