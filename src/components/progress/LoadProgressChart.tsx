import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressData } from '../../@types/progress'
import { formatYmd } from '../../utils/sessionFormat'

const tooltipStyle = {
  backgroundColor: 'var(--ui-surface)',
  border: '1px solid var(--ui-line)',
  borderRadius: '12px',
  color: 'var(--ui-ink)',
  fontSize: '12px',
}
const tick = { fill: 'var(--ui-faint)', fontSize: 10 }

interface Props {
  cargas: ProgressData['cargaPorExercicio']
}

export const LoadProgressChart = ({ cargas }: Props) => {
  const [selected, setSelected] = useState<string | null>(null)
  const exercicio = cargas.find((c) => c.exercicio === selected) ?? cargas[0]

  return (
    <section className="card rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-ink">Evolução de carga</h3>
        {cargas.length > 0 ? (
          <select
            aria-label="Exercício"
            className="field w-auto py-2 text-xs"
            onChange={(event) => setSelected(event.target.value)}
            value={exercicio?.exercicio}
          >
            {cargas.map((c) => (
              <option key={c.exercicio} value={c.exercicio}>
                {c.exercicio}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {!exercicio ? (
        <p className="mt-3 text-sm text-faint">
          Registre a carga (em kg) nos treinos para acompanhar a evolução.
        </p>
      ) : (
        <div className="mt-3 h-56">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={exercicio.pontos}>
              <CartesianGrid stroke="var(--ui-line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="data" tick={tick} tickFormatter={(v: string) => formatYmd(v)} />
              <YAxis tick={tick} unit=" kg" width={48} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value} kg`, 'Carga']}
                labelFormatter={(label) => formatYmd(String(label), true)}
              />
              <Line
                dataKey="cargaKg"
                dot={{ r: 3 }}
                stroke="var(--ui-accent-strong)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
