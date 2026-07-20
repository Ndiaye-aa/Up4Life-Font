import { X } from 'lucide-react'
import { useState } from 'react'
import type { DiaSemana } from '../../../@types/schedule'

const DAYS: { value: DiaSemana; abbr: string; letter: string; full: string }[] = [
  { value: 1, abbr: 'Seg', letter: 'S', full: 'Segunda' },
  { value: 2, abbr: 'Ter', letter: 'T', full: 'Terça' },
  { value: 3, abbr: 'Qua', letter: 'Q', full: 'Quarta' },
  { value: 4, abbr: 'Qui', letter: 'Q', full: 'Quinta' },
  { value: 5, abbr: 'Sex', letter: 'S', full: 'Sexta' },
  { value: 6, abbr: 'Sáb', letter: 'S', full: 'Sábado' },
  { value: 0, abbr: 'Dom', letter: 'D', full: 'Domingo' },
]

interface Props {
  initialDias: DiaSemana[]
  initialHorarios?: Partial<Record<DiaSemana, string>>
  onClose: () => void
  onSave: (dias: DiaSemana[], horarios: Partial<Record<DiaSemana, string>>) => void
  studentInitials: string
  studentName: string
}

export const EditScheduleModal = ({
  initialDias,
  initialHorarios,
  onClose,
  onSave,
  studentInitials,
  studentName,
}: Props) => {
  const [dias, setDias] = useState<DiaSemana[]>(initialDias)
  const [horarios, setHorarios] = useState<Partial<Record<DiaSemana, string>>>(
    initialHorarios ?? {},
  )

  const toggleDay = (value: DiaSemana) => {
    setDias((current) =>
      current.includes(value)
        ? current.filter((day) => day !== value)
        : [...current, value],
    )
    setHorarios((current) => {
      if (dias.includes(value)) {
        const { [value]: _removed, ...rest } = current
        return rest
      }
      return current
    })
  }

  const setHorario = (value: DiaSemana, horario: string) => {
    setHorarios((current) => ({ ...current, [value]: horario }))
  }

  const daysLabel = DAYS.filter((day) => dias.includes(day.value))
    .map((day) => day.abbr)
    .join(' · ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[1.6rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <h3 className="font-display text-lg font-semibold text-ink">
            Dias de treino
          </h3>
          <button
            className="rounded-xl p-1.5 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-elev p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-xs font-semibold text-white">
            {studentInitials}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{studentName}</p>
            <p className="text-xs text-faint">Aluno</p>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-2.5 text-xs uppercase tracking-[0.14em] text-faint">
            Selecione os dias
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((day) => {
              const active = dias.includes(day.value)
              return (
                <button
                  key={day.value}
                  aria-pressed={active}
                  className={`rounded-xl border py-2.5 text-center transition ${
                    active
                      ? 'border-accent-strong bg-accent-strong text-white'
                      : 'border-line bg-surface text-mute hover:border-accent/50'
                  }`}
                  onClick={() => toggleDay(day.value)}
                  title={day.full}
                  type="button"
                >
                  <span className="block font-display text-sm font-semibold">
                    {day.letter}
                  </span>
                  <span className="block text-[0.55rem] uppercase tracking-wide">
                    {day.abbr}
                  </span>
                </button>
              )
            })}
          </div>

          <p
            className={`mt-3 min-h-[1.2em] text-xs ${
              dias.length === 0 ? 'text-rose-400 light:text-rose-600' : 'text-mute'
            }`}
          >
            {dias.length === 0
              ? 'Selecione pelo menos um dia.'
              : `${dias.length}x por semana · ${daysLabel}`}
          </p>

          {dias.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] text-faint">
                Horário por dia (opcional)
              </p>
              {DAYS.filter((day) => dias.includes(day.value)).map((day) => (
                <div className="flex items-center gap-3" key={day.value}>
                  <span className="w-12 shrink-0 text-xs font-medium text-mute">
                    {day.abbr}
                  </span>
                  <input
                    className="field"
                    onChange={(event) => setHorario(day.value, event.target.value)}
                    type="time"
                    value={horarios[day.value] ?? ''}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex gap-3">
            <button
              className="flex-1 rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-mute transition hover:bg-elev"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="btn-primary flex-1"
              disabled={dias.length === 0}
              onClick={() => onSave(dias, horarios)}
              type="button"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
