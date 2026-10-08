import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressData } from '../../@types/progress'

const tooltipStyle = {
  backgroundColor: 'var(--ui-surface)',
  border: '1px solid var(--ui-line)',
  borderRadius: '12px',
  color: 'var(--ui-ink)',
  fontSize: '12px',
}
const tick = { fill: 'var(--ui-faint)', fontSize: 10 }

interface Props {
  semanal: ProgressData['semanal']
}

export const WeeklyAttendanceChart = ({ semanal }: Props) => (
  <section className="card rounded-2xl p-4">
    <h3 className="font-display text-base font-semibold text-ink">Previsto × cumprido por semana</h3>
    {semanal.length === 0 ? (
      <p className="mt-3 text-sm text-faint">Ainda sem sessões registradas.</p>
    ) : (
      <div className="mt-3 h-56">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={semanal}>
            <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="semana" tick={tick} tickFormatter={(v: string) => v.split('-')[1]} />
            <YAxis allowDecimals={false} tick={tick} width={24} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="previstas" fill="var(--ui-faint)" fillOpacity={0.45} name="Previstos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cumpridas" fill="var(--ui-accent-strong)" name="Cumpridos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </section>
)
