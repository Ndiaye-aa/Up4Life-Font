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

export interface BodyMetricsChartPoint {
  month: string
  weight: number | null
  bodyFat: number | null
  muscle: number | null
}

const tooltipStyle = {
  backgroundColor: 'var(--ui-surface)',
  border: '1px solid var(--ui-line)',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  color: 'var(--ui-ink)',
  fontSize: '12px',
}
const chartTick = { fill: 'var(--ui-faint)', fontSize: 10 }

interface Props {
  data: BodyMetricsChartPoint[]
  isLoading?: boolean
  /** true quando os gráficos já estão dentro de um card pai (sem borda/fundo próprios). */
  bare?: boolean
}

/** Par de gráficos de evolução (Peso/% Gordura e Massa Muscular) usado nas telas de avaliação. */
export const BodyMetricsCharts = ({ data, isLoading, bare }: Props) => {
  const wrapperClass = bare ? '' : 'card p-5'
  const titleClass = bare ? 'text-sm font-semibold text-ink' : 'font-display text-base font-semibold text-ink'

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className={wrapperClass}>
        <h2 className={titleClass}>
          Peso &amp; % Gordura
        </h2>
        <p className="mb-4 text-xs text-faint">Evolução histórica</p>
        {isLoading ? (
          <div className="flex h-[180px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <ResponsiveContainer height={180} width="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={chartTick} />
              <YAxis tick={chartTick} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                connectNulls
                dataKey="weight"
                dot={{ fill: '#8b5cf6', r: 3 }}
                name="Peso (kg)"
                stroke="#8b5cf6"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                connectNulls
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

      <div className={wrapperClass}>
        <h2 className={titleClass}>
          Massa Muscular
        </h2>
        <p className="mb-4 text-xs text-faint">Evolução histórica</p>
        {isLoading ? (
          <div className="flex h-[180px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <ResponsiveContainer height={180} width="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={chartTick} />
              <YAxis tick={chartTick} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                connectNulls
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
  )
}
