import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import {
  Activity,
  ArrowLeft,
  Dumbbell,
  FileText,
  Heart,
  Minus,
  Scale,
  TrendingDown,
  TrendingUp,
  Loader2,
} from 'lucide-react'
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
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getStudentAssessmentsService, type AssessmentRecord } from '../services/assessments'
import { todayBR } from '../utils/formatDate'

const EVOLUTION_DATA = [
  { bodyFat: 27.2, month: 'Nov', muscle: 48.1, weight: 68.5 },
  { bodyFat: 26.1, month: 'Dez', muscle: 48.8, weight: 67.2 },
  { bodyFat: 25.5, month: 'Jan', muscle: 49.2, weight: 66.8 },
  { bodyFat: 25.0, month: 'Fev', muscle: 50.1, weight: 65.5 },
  { bodyFat: 24.8, month: 'Mar', muscle: 50.8, weight: 64.9 },
  { bodyFat: 24.3, month: 'Abr', muscle: 51.2, weight: 64.2 },
]

const PERIMETROS_DEFAULT = [
  { diff: -3, label: 'Tórax', prev: '95 cm', value: '92 cm' },
  { diff: -4, label: 'Cintura', prev: '77 cm', value: '73 cm' },
  { diff: -5, label: 'Abdômen', prev: '83 cm', value: '78 cm' },
  { diff: -2, label: 'Quadril', prev: '98 cm', value: '96 cm' },
  { diff: -2, label: 'Coxa D', prev: '56 cm', value: '54 cm' },
  { diff: +1, label: 'Braço D', prev: '30 cm', value: '31 cm' },
]

interface ResultsState {
  alunoId?: number
  bmi?: string
  bodyFat?: string
  date?: string
  iac?: string
  massaMagra?: string
  name?: string
  perimetros?: Record<string, string>
  status?: string
  weight?: string
}

export const AdminAssessmentResultsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const location = useLocation()
  const state = (location.state ?? {}) as ResultsState

  const [history, setHistory] = useState<AssessmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (state.alunoId) {
      setIsLoading(true)
      getStudentAssessmentsService(state.alunoId)
        .then(setHistory)
        .finally(() => setIsLoading(false))
    }
  }, [state.alunoId])

  const name = state.name ?? 'Aluno'
  const date = state.date ?? todayBR()
  const bmi = state.bmi ?? '—'
  const bodyFat = state.bodyFat ?? '—'
  const iac = state.iac ?? '—'
  const massaMagra = state.massaMagra ?? '—'

  const chartData = useMemo(() => {
    return history
      .slice()
      .reverse()
      .map((a) => {
        const mm = a.percentualGordura ? a.peso * (1 - a.percentualGordura / 100) : 0
        return {
          bodyFat: a.percentualGordura ? parseFloat(a.percentualGordura.toString()) : 0,
          month: new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', {
            month: 'short',
          }),
          muscle: parseFloat(mm.toFixed(1)),
          weight: parseFloat(a.peso.toString()),
        }
      })
  }, [history])

  const previousAssessment = history.length > 1 ? history[1] : null

  const getTrend = (current: string | number, prev: string | number | undefined | null) => {
    if (prev === undefined || prev === null) return 0
    const currVal = typeof current === 'string' ? parseFloat(current.replace('%', '')) : current
    const prevVal = typeof prev === 'string' ? parseFloat(prev.replace('%', '')) : prev
    return parseFloat((currVal - prevVal).toFixed(1))
  }
  const metrics = [
    {
      icon: Scale,
      iconBg: 'bg-indigo-50',
      iconColor: 'bg-purple-50',
      label: 'IMC',
      progress: bmi !== '—' ? Math.min(100, (parseFloat(bmi) / 40) * 100) : 0,
      progressColor: 'bg-purple-50',
      range: '18.5 – 24.9',
      status: state.status ?? 'Normal',
      statusBg: 'bg-emerald-50',
      statusColor: 'bg-purple-50',
      trend: getTrend(bmi, previousAssessment?.imc),
      unit: 'kg/m²',
      value: bmi,
    },
    {
      icon: Activity,
      iconBg: 'bg-blue-50',
      iconColor: 'bg-purple-50',
      label: '% Gordura',
      progress: bodyFat !== '—' ? Math.min(100, (parseFloat(bodyFat) / 40) * 100) : 0,
      progressColor: 'bg-purple-50',
      range: 'Pollock 7 Dobras',
      status: 'Calculado',
      statusBg: 'bg-emerald-50',
      statusColor: 'bg-purple-50',
      trend: getTrend(bodyFat, previousAssessment?.percentualGordura),
      unit: '%',
      value: bodyFat.replace('%', ''),
    },
    {
      icon: Heart,
      iconBg: 'bg-rose-50',
      iconColor: 'bg-purple-50',
      label: 'IAC',
      progress: iac !== '—' ? Math.min(100, (parseFloat(iac) / 40) * 100) : 0,
      progressColor: 'bg-purple-50',
      range: 'Adiposidade',
      status: 'Normal',
      statusBg: 'bg-emerald-50',
      statusColor: 'bg-purple-50',
      trend: getTrend(iac, previousAssessment?.iac),
      unit: '',
      value: iac,
    },
    {
      icon: Dumbbell,
      iconBg: 'bg-emerald-50',
      iconColor: 'bg-purple-50',
      label: 'Massa Magra',
      progress: 75,
      progressColor: 'bg-purple-50',
      range: 'Referência pessoal',
      status: 'Calculado',
      statusBg: 'bg-purple-50',
      statusColor: 'bg-purple-50',
      trend: 0,
      unit: 'kg',
      value: massaMagra,
    },
  ]

  const perimetros = state.perimetros
    ? [
        {
          diff: previousAssessment?.peitoral ? parseFloat(state.perimetros.chest) - parseFloat(previousAssessment.peitoral.toString()) : 0,
          label: 'Tórax',
          prev: previousAssessment?.peitoral ? `${previousAssessment.peitoral} cm` : '—',
          value: state.perimetros.chest ? `${state.perimetros.chest} cm` : '—',
        },
        {
          diff: previousAssessment?.cintura ? parseFloat(state.perimetros.waist) - parseFloat(previousAssessment.cintura.toString()) : 0,
          label: 'Cintura',
          prev: previousAssessment?.cintura ? `${previousAssessment.cintura} cm` : '—',
          value: state.perimetros.waist ? `${state.perimetros.waist} cm` : '—',
        },
        {
          diff: previousAssessment?.abdominal ? parseFloat(state.perimetros.abdomen) - parseFloat(previousAssessment.abdominal.toString()) : 0,
          label: 'Abdômen',
          prev: previousAssessment?.abdominal ? `${previousAssessment.abdominal} cm` : '—',
          value: state.perimetros.abdomen ? `${state.perimetros.abdomen} cm` : '—',
        },
        {
          diff: previousAssessment?.quadril ? parseFloat(state.perimetros.hip) - parseFloat(previousAssessment.quadril.toString()) : 0,
          label: 'Quadril',
          prev: previousAssessment?.quadril ? `${previousAssessment.quadril} cm` : '—',
          value: state.perimetros.hip ? `${state.perimetros.hip} cm` : '—',
        },
        {
          diff: previousAssessment?.coxa ? parseFloat(state.perimetros.thigh) - parseFloat(previousAssessment.coxa.toString()) : 0,
          label: 'Coxa D',
          prev: previousAssessment?.coxa ? `${previousAssessment.coxa} cm` : '—',
          value: state.perimetros.thigh ? `${state.perimetros.thigh} cm` : '—',
        },
      ]
    : PERIMETROS_DEFAULT

  const tooltipStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
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
        { label: 'Mês', value: '8' },
        { label: 'Avaliados', value: '6' },
        { label: 'Pendentes', value: '4' },
      ]}
      roleLabel="Personal Trainer"
      subtitle="Analise detalhada dos indices de composição corporal do aluno."
      tone="personal"
    >
      <div className="space-y-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            className="flex-shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">Resultados</p>
            <h1 className="font-display text-2xl font-semibold text-stone-950">{name}</h1>
            <p className="mt-0.5 text-xs text-stone-500">{date}</p>
          </div>
          <button
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
            type="button"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className={`${m.iconBg} rounded-xl p-2`}>
                  <m.icon className={m.iconColor} size={16} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${
                    m.trend < 0
                      ? 'text-emerald-600'
                      : m.trend > 0
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
                >
                  {m.trend < 0 ? (
                    <TrendingDown size={13} />
                  ) : m.trend > 0 ? (
                    <TrendingUp size={13} />
                  ) : (
                    <Minus size={13} />
                  )}
                  {Math.abs(m.trend)}
                  {m.unit}
                </div>
              </div>
              <p className="text-2xl text-stone-950">
                {m.value}
                {m.unit && <span className="ml-1 text-xs text-stone-400">{m.unit}</span>}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">{m.label}</p>
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${m.progressColor} rounded-full`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${m.statusBg} ${m.statusColor}`}
                >
                  {m.status}
                </span>
                <span className="text-xs text-stone-400">{m.range}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <h2 className="font-display text-base font-semibold text-stone-950">
              Peso &amp; % Gordura
            </h2>
            <p className="mb-4 text-xs text-stone-400">Evolução histórica</p>
            {isLoading ? (
              <div className="flex h-[180px] items-center justify-center">
                <Loader2 className="animate-spin text-stone-400" />
              </div>
            ) : (
              <ResponsiveContainer height={180} width="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} width={30} />
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
            )}
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <h2 className="font-display text-base font-semibold text-stone-950">
              Massa Muscular
            </h2>
            <p className="mb-4 text-xs text-stone-400">Evolução histórica</p>
            {isLoading ? (
              <div className="flex h-[180px] items-center justify-center">
                <Loader2 className="animate-spin text-stone-400" />
              </div>
            ) : (
              <ResponsiveContainer height={180} width="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} width={30} />
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
            )}
          </div>
        </div>

        {/* Perimeters comparison */}
        <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-display text-base font-semibold text-stone-950">
              Comparativo de Perímetros
            </h2>
            <p className="mt-0.5 text-xs text-stone-400">Atual vs. avaliação anterior</p>
          </div>
          <div className="divide-y divide-gray-50">
            {perimetros.map((p) => (
              <div key={p.label} className="flex items-center gap-3 px-5 py-3">
                <span className="w-20 flex-shrink-0 text-sm text-stone-600">{p.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-purple-400"
                    style={{
                      width: `${Math.min(100, (parseFloat(p.value) / 120) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="text-sm text-stone-950">{p.value}</span>
                  <span
                    className={`text-xs ${p.diff < 0 ? 'text-emerald-600' : 'text-blue-600'}`}
                  >
                    {p.diff > 0 ? '+' : ''}
                    {p.diff}cm
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
