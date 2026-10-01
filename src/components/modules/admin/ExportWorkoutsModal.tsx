import { Check, Dumbbell, FileText, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WorkoutRecord } from '../../../@types/workout'

interface ExportWorkoutsModalProps {
  candidates: WorkoutRecord[]
  onClose: () => void
  onConfirm: (selected: WorkoutRecord[]) => void
  preSelected?: WorkoutRecord
}

export const ExportWorkoutsModal = ({
  candidates,
  onClose,
  onConfirm,
  preSelected,
}: ExportWorkoutsModalProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(preSelected ? [preSelected.id] : [])
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) return candidates
    return candidates.filter(
      (w) =>
        w.nome.toLowerCase().includes(normalized) ||
        w.nome_aluno.toLowerCase().includes(normalized),
    )
  }, [candidates, searchTerm])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((w) => selectedIds.includes(w.id))

  const toggle = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))

  const toggleAllFiltered = () => {
    const filteredIds = filtered.map((w) => w.id)
    setSelectedIds((prev) =>
      allFilteredSelected
        ? prev.filter((id) => !filteredIds.includes(id))
        : [...new Set([...prev, ...filteredIds])],
    )
  }

  const handleConfirm = () => {
    onConfirm(candidates.filter((w) => selectedIds.includes(w.id)))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex max-h-[90vh] w-full flex-col rounded-t-[2rem] border border-line bg-surface shadow-2xl sm:max-w-lg sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent">Exportar PDF</p>
            <h2 className="font-display mt-2 text-xl font-semibold text-ink">
              Selecione os treinos
            </h2>
            <p className="mt-1 text-sm text-mute">Escolha quais treinos entram no PDF.</p>
          </div>
          <button
            aria-label="Fechar"
            className="rounded-xl p-2 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={14} />
            <input
              className="field pl-9"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar treino ou aluno..."
              value={searchTerm}
            />
          </div>
          <button
            className="shrink-0 text-xs font-medium text-accent transition hover:underline disabled:opacity-50"
            disabled={filtered.length === 0}
            onClick={toggleAllFiltered}
            type="button"
          >
            {allFilteredSelected ? 'Limpar' : 'Selecionar todos'}
          </button>
        </div>

        <div className="flex-1 divide-y divide-line overflow-y-auto">
          {filtered.map((workout) => {
            const isSelected = selectedIds.includes(workout.id)
            return (
              <div className="flex items-center gap-3 px-5 py-3.5" key={workout.id}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-elev">
                  <Dumbbell className="text-faint" size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{workout.nome}</p>
                  <p className="truncate text-xs text-faint">
                    {workout.nome_aluno} · {workout.categoria} · {workout.exercicios.length} exercícios
                  </p>
                </div>
                <button
                  aria-label={isSelected ? 'Remover da exportação' : 'Adicionar à exportação'}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isSelected
                      ? 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-500'
                      : 'bg-elev text-mute hover:bg-accent-soft hover:text-accent'
                  }`}
                  onClick={() => toggle(workout.id)}
                  type="button"
                >
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                </button>
              </div>
            )
          })}
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-faint">Nenhum treino encontrado.</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-elev"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={selectedIds.length === 0}
            onClick={handleConfirm}
            type="button"
          >
            <FileText size={14} />
            Exportar {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
