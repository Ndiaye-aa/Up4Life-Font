import { Activity, Calendar, Dumbbell, Heart, Loader2, Minus, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { DashboardShell } from '../components/layout/DashboardShell'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { type AssessmentRecord, getStudentAssessmentsService } from '../services/assessments'
import { getDashboardNavItems } from '../utils/dashboardNav'

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function imcStatus(imc: number): string {
  if (imc < 18.5) return 'Abaixo'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  return 'Obesidade'
}

function imcStatusColor(status: string): string {
  if (status === 'Normal') return 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600'
  if (status === 'Abaixo') return 'bg-blue-500/12 text-blue-400 light:bg-blue-50 light:text-blue-600'
  if (status === 'Sobrepeso') return 'bg-amber-500/12 text-amber-400 light:bg-amber-50 light:text-amber-600'
  return 'bg-rose-500/12 text-rose-400 light:bg-rose-50 light:text-rose-600'
}

function calcMassaMagra(a: AssessmentRecord): number | null {
  if (a.percentualGordura == null) return null
  if (a.percentualGordura < 0 || a.percentualGordura > 100) return null
  return parseFloat((a.peso * (1 - a.percentualGordura / 100)).toFixed(1))
}

export const StudentAssessmentsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null)

  const fetchAssessments = (id: number) => {
    setLoading(true)
    setError(null)
    getStudentAssessmentsService(id)
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime(),
        )
        setAssessments(sorted)
        setSelectedAssessment(sorted[0] ?? null)
      })
      .catch((err: unknown) => {
        setAssessments([])
        setSelectedAssessment(null)
        setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    fetchAssessments(user.id)
  }, [user?.id])

  const selectedIndex = assessments.findIndex((a) => a.id === selectedAssessment?.id)
  const previousAssessment = selectedIndex >= 0 ? (assessments[selectedIndex + 1] ?? null) : null

  const getTrend = (current: number | null | undefined, prev: number | null | undefined) => {
    if (current == null || prev == null) return null
    return parseFloat((current - prev).toFixed(1))
  }

  const massaMagra = selectedAssessment ? calcMassaMagra(selectedAssessment) : null
  const prevMassaMagra = previousAssessment ? calcMassaMagra(previousAssessment) : null

  const metrics = selectedAssessment
    ? [
        {
          icon: Scale,
          label: 'IMC',
          progress: selectedAssessment.imc ? Math.min(100, (selectedAssessment.imc / 40) * 100) : 0,
          range: '18.5 – 24.9',
          status: selectedAssessment.imc ? imcStatus(selectedAssessment.imc) : '—',
          statusColor: selectedAssessment.imc ? imcStatusColor(imcStatus(selectedAssessment.imc)) : 'bg-accent-soft text-accent',
          trend: getTrend(selectedAssessment.imc, previousAssessment?.imc),
          unit: 'kg/m²',
          value: selectedAssessment.imc?.toFixed(1) ?? '—',
        },
        {
          icon: Activity,
          label: '% Gordura',
          progress: selectedAssessment.percentualGordura ? Math.min(100, (selectedAssessment.percentualGordura / 40) * 100) : 0,
          range: 'Pollock 7 Dobras',
          status: selectedAssessment.percentualGordura != null ? 'Calculado' : '—',
          statusColor: 'bg-accent-soft text-accent',
          trend: getTrend(selectedAssessment.percentualGordura, previousAssessment?.percentualGordura),
          unit: '%',
          value: selectedAssessment.percentualGordura?.toFixed(1) ?? '—',
        },
        {
          icon: Heart,
          label: 'IAC',
          progress: selectedAssessment.iac ? Math.min(100, (selectedAssessment.iac / 40) * 100) : 0,
          range: 'Adiposidade',
          status: selectedAssessment.iac != null ? 'Normal' : '—',
          statusColor: 'bg-accent-soft text-accent',
          trend: getTrend(selectedAssessment.iac, previousAssessment?.iac),
          unit: '',
          value: selectedAssessment.iac?.toFixed(1) ?? '—',
        },
        {
          icon: Dumbbell,
          label: 'Massa Magra',
          progress: massaMagra ? Math.min(100, (massaMagra / 100) * 100) : 0,
          range: 'Referência pessoal',
          status: massaMagra != null ? 'Calculado' : '—',
          statusColor: 'bg-accent-soft text-accent',
          trend: getTrend(massaMagra, prevMassaMagra),
          unit: 'kg',
          value: massaMagra?.toFixed(1) ?? '—',
        },
      ]
    : []

  const chartData = useMemo(() => {
    return [...assessments].reverse().map((a) => {
      const mm = calcMassaMagra(a)
      return {
        bodyFat: a.percentualGordura != null ? parseFloat(a.percentualGordura.toString()) : null,
        month: new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        muscle: mm,
        weight: parseFloat(a.peso.toString()),
      }
    })
  }, [assessments])

  const perimetros = selectedAssessment
    ? [
        { label: 'Cíntura', prev: previousAssessment?.cintura, value: selectedAssessment.cintura },
        { label: 'Quadril', prev: previousAssessment?.quadril, value: selectedAssessment.quadril },
        { label: 'Abdômen', prev: previousAssessment?.abdominal, value: selectedAssessment.abdominal },
        { label: 'Peitoral', prev: previousAssessment?.peitoral, value: selectedAssessment.peitoral },
        { label: 'Coxa', prev: previousAssessment?.coxa, value: selectedAssessment.coxa },
      ].filter((p) => p.value != null)
    : []

  const latest = assessments[0]
  const overviewItems = latest
    ? [
        { label: 'Última', value: formatDate(latest.dataAvaliacao).slice(0, 5) },
        { label: 'IMC', value: latest.imc?.toFixed(1) ?? '-' },
        { label: 'Gordura', value: latest.percentualGordura ? `${latest.percentualGordura.toFixed(1)}%` : '-' },
      ]
    : [
        { label: 'Última', value: '-' },
        { label: 'IMC', value: '-' },
        { label: 'Gordura', value: '-' },
      ]

  const tooltipStyle = {
    backgroundColor: 'var(--ui-surface)',
    border: '1px solid var(--ui-line)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    color: 'var(--ui-ink)',
    fontSize: '12px',
  }
  const chartTick = { fill: 'var(--ui-faint)', fontSize: 10 }

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Aluno'}
      navItems={getDashboardNavItems('ALUNO')}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={overviewItems}
      roleLabel="Aluno"
      tone="student"
    >
      <div className="space-y-6">
        <PageHeader
          description=" "
          eyebrow="Avaliações"
          title=" "
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        )}

        {!loading && error && (
          <div className="py-10 text-center">
            <p className="text-sm text-rose-400 light:text-rose-600">{error}</p>
            {user?.id && (
              <button
                className="btn-primary mt-4 rounded-full px-4 py-2 text-xs"
                onClick={() => fetchAssessments(user.id)}
                type="button"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {!loading && !error && assessments.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-line p-10 text-center">
            <p className="text-sm text-faint">Nenhuma avaliação registrada.</p>
          </div>
        )}

        {!loading && selectedAssessment && (
          <>
            {/* Unified info block: assessment date + student personal data */}
            <section className="card p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-faint">
                    {user?.name ?? 'Aluno'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-accent" size={14} />
                    <p className="text-sm font-medium text-mute">
                      Avaliação de{' '}
                      <span className="font-semibold text-ink">{formatDate(selectedAssessment.dataAvaliacao)}</span>
                    </p>
                    {selectedAssessment.id === assessments[0]?.id && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">Mais recente</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-5 border-t border-line" />
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Peso', value: `${selectedAssessment.peso} kg` },
                  { label: 'Altura', value: `${selectedAssessment.altura} cm` },
                  { label: 'Idade', value: `${selectedAssessment.idade} anos` },
                  { label: 'Massa Magra', value: massaMagra != null ? `${massaMagra} kg` : '—' },
                ].map((item) => (
                  <article key={item.label}>
                    <p className="text-sm text-mute">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-ink">{item.value}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Indices com tendencia em uma unica superficie */}
            <section className="card grid grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="rounded-xl bg-accent-soft p-2">
                      <m.icon className="text-accent" size={16} />
                    </div>
                    {m.trend !== null ? (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          m.trend < 0 ? 'text-emerald-400 light:text-emerald-600' : m.trend > 0 ? 'text-blue-400 light:text-blue-600' : 'text-faint'
                        }`}
                      >
                        {m.trend < 0 ? <TrendingDown size={13} /> : m.trend > 0 ? <TrendingUp size={13} /> : <Minus size={13} />}
                        {Math.abs(m.trend)}{m.unit}
                      </div>
                    ) : (
                      <span className="text-xs text-faint">—</span>
                    )}
                  </div>
                  <p className="text-2xl text-ink">
                    {m.value}
                    {m.unit && <span className="ml-1 text-xs text-faint">{m.unit}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-mute">{m.label}</p>
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-elev">
                      <div className="h-full rounded-full bg-accent-strong" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.statusColor}`}>{m.status}</span>
                    <span className="text-xs text-faint">{m.range}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* Charts */}
            {chartData.length > 1 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="card p-5">
                  <h2 className="font-display text-base font-semibold text-ink">Peso &amp; % Gordura</h2>
                  <p className="mb-4 text-xs text-faint">Evolução histórica</p>
                  <ResponsiveContainer height={180} width="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={chartTick} />
                      <YAxis tick={chartTick} width={30} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line connectNulls dataKey="weight" dot={{ fill: '#8b5cf6', r: 3 }} name="Peso (kg)" stroke="#8b5cf6" strokeWidth={2} type="monotone" />
                      <Line connectNulls dataKey="bodyFat" dot={{ fill: '#3b82f6', r: 3 }} name="% Gordura" stroke="#3b82f6" strokeWidth={2} type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5">
                  <h2 className="font-display text-base font-semibold text-ink">Massa Muscular</h2>
                  <p className="mb-4 text-xs text-faint">Evolução histórica</p>
                  <ResponsiveContainer height={180} width="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={chartTick} />
                      <YAxis tick={chartTick} width={30} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line connectNulls dataKey="muscle" dot={{ fill: '#10b981', r: 3 }} name="Massa magra (kg)" stroke="#10b981" strokeWidth={2} type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Perimeters */}
            {perimetros.length > 0 && (
              <div className="card overflow-hidden">
                <div className="border-b border-line p-5">
                  <h2 className="font-display text-base font-semibold text-ink">Perímetros</h2>
                  <p className="mt-0.5 text-xs text-faint">Atual vs. avaliação anterior</p>
                </div>
                <div className="divide-y divide-line">
                  {perimetros.map((p) => {
                    const diff = p.prev != null ? parseFloat((p.value! - p.prev).toFixed(1)) : null
                    return (
                      <div key={p.label} className="flex items-center gap-3 px-5 py-3">
                        <span className="w-24 flex-shrink-0 text-sm text-mute">{p.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-elev">
                          <div
                            className="h-full rounded-full bg-accent-strong"
                            style={{ width: `${Math.min(100, (p.value! / 120) * 100)}%` }}
                          />
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="text-sm text-ink">{p.value} cm</span>
                          {diff !== null && (
                            <span className={`text-xs ${diff < 0 ? 'text-emerald-400 light:text-emerald-600' : diff > 0 ? 'text-blue-400 light:text-blue-600' : 'text-faint'}`}>
                              {diff > 0 ? '+' : ''}{diff} cm
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* History list */}
        {!loading && assessments.length > 0 && (
          <section className="card rounded-[2rem]">
            <div className="border-b border-line p-4">
              <h2 className="font-display text-2xl font-semibold text-ink">Hitórico de Avaliações</h2>
            </div>
            <div className="divide-y divide-line">
              {assessments.map((item) => {
                const status = item.imc ? imcStatus(item.imc) : '-'
                const colorClass = item.imc ? imcStatusColor(status) : 'bg-elev text-mute'
                const isSelected = item.id === selectedAssessment?.id
                return (
                  <button
                    key={item.id}
                    className={`flex w-full items-center gap-3 p-4 text-left transition ${isSelected ? 'bg-accent-soft/60' : 'hover:bg-elev'}`}
                    onClick={() => setSelectedAssessment(item)}
                    type="button"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isSelected ? 'bg-accent-strong text-white' : 'bg-accent-soft text-accent'}`}>
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{formatDate(item.dataAvaliacao)}</p>
                      <p className="mt-0.5 text-xs text-faint">
                        IMC {item.imc?.toFixed(1) ?? '-'} · Gordura {item.percentualGordura ? `${item.percentualGordura.toFixed(1)}%` : '-'}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${colorClass}`}>{status}</span>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-accent-strong" />}
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}
