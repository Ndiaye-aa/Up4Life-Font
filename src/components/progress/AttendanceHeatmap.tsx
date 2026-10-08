import { useMemo } from 'react'
import type { ProgressData } from '../../@types/progress'
import { addDays, formatYmd, STATUS_LABEL, weekdayOf } from '../../utils/sessionFormat'

interface Props {
  progress: ProgressData
}

const LEGEND = [
  { label: 'Realizado', className: 'bg-emerald-500' },
  { label: 'Parcial', className: 'bg-amber-400' },
  { label: 'Falta', className: 'bg-rose-500' },
  { label: 'Justificada', className: 'bg-faint/60' },
  { label: 'Falta reposta', className: 'border-2 border-emerald-500 bg-rose-500/30' },
]

/** Calendário (semanas em colunas, dias em linhas) com a situação de cada dia do período. */
export const AttendanceHeatmap = ({ progress }: Props) => {
  const { periodo, calendario } = progress

  const { weeks, byDate } = useMemo(() => {
    const map = new Map(calendario.map((c) => [c.data, c]))
    // Começa no domingo da semana do primeiro dia para alinhar as linhas.
    const start = addDays(periodo.de, -weekdayOf(periodo.de))
    const cols: string[][] = []
    for (let cursor = start; cursor <= periodo.ate; cursor = addDays(cursor, 7)) {
      cols.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
    }
    return { weeks: cols, byDate: map }
  }, [periodo.de, periodo.ate, calendario])

  const cellClass = (data: string): string => {
    if (data < periodo.de || data > periodo.ate) return 'bg-transparent'
    const entry = byDate.get(data)
    if (!entry) return 'bg-elev'
    if (entry.status === 'REALIZADA') return 'bg-emerald-500'
    if (entry.status === 'PARCIAL') return 'bg-amber-400'
    if (entry.status === 'FALTA_JUSTIFICADA') return 'bg-faint/60'
    return entry.reposta ? 'border-2 border-emerald-500 bg-rose-500/30' : 'bg-rose-500'
  }

  return (
    <section className="card rounded-2xl p-4">
      <h3 className="font-display text-base font-semibold text-ink">Frequência</h3>
      {calendario.length === 0 ? (
        <p className="mt-3 text-sm text-faint">Ainda sem sessões registradas.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week) => (
              <div key={week[0]} className="flex flex-col gap-1">
                {week.map((data) => {
                  const entry = byDate.get(data)
                  const label = entry
                    ? `${formatYmd(data)} — ${STATUS_LABEL[entry.status]}${entry.reposta ? ' (reposta)' : ''}${entry.modalidade ? ` · ${entry.modalidade === 'ONLINE' ? 'online' : 'presencial'}` : ''}`
                    : `${formatYmd(data)} — sem sessão`
                  return (
                    <div
                      key={data}
                      aria-label={label}
                      className={`h-4 w-4 rounded-[4px] ${cellClass(data)}`}
                      role="img"
                      title={label}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-mute">
            <span className={`inline-block h-3 w-3 rounded-[3px] ${item.className}`} />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
