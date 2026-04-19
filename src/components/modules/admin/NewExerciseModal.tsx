import { Dumbbell, X } from 'lucide-react'
import { useState } from 'react'
import { createExerciseService, type ExerciseFromApi } from '../../../services/exercises'

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombro',
  'Biceps',
  'Triceps',
  'Quadriceps',
  'Posterior',
  'Gluteo',
  'Panturrilha',
  'Abdomen',
  'Trapezio',
  'Antebraco',
]

interface NewExerciseModalProps {
  onClose: () => void
  onCreated: (exercise: ExerciseFromApi) => void
}

export const NewExerciseModal = ({ onClose, onCreated }: NewExerciseModalProps) => {
  const [nome, setNome] = useState('')
  const [grupoMuscular, setGrupoMuscular] = useState('')
  const [descricao, setDescricao] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitError('')

    if (nome.trim().length < 3) {
      setSubmitError('Informe um nome de exercicio valido (min. 3 caracteres).')
      return
    }

    if (!grupoMuscular) {
      setSubmitError('Selecione o grupo muscular.')
      return
    }

    setIsSubmitting(true)

    try {
      const created = await createExerciseService({
        nome: nome.trim(),
        grupoMuscular,
        descricao: descricao.trim() || undefined,
      })
      onCreated(created)
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Nao foi possivel salvar o exercicio agora.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="flex w-full flex-col rounded-t-[2rem] bg-white shadow-2xl sm:max-w-md sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">Exercicios</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-stone-950">
              Novo exercicio
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Adicione uma variacao ao catalogo de exercicios.
            </p>
          </div>
          <button
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Nome do exercicio
            </label>
            <div className="relative">
              <Dumbbell
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex: Supino Reto com Barra"
                type="text"
                value={nome}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Grupo muscular
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
              onChange={(event) => setGrupoMuscular(event.target.value)}
              value={grupoMuscular}
            >
              <option value="">Selecione...</option>
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Descricao <span className="normal-case text-gray-400">(opcional)</span>
            </label>
            <textarea
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex: Executar com pegada pronada, cotovelos proximos ao corpo..."
              rows={3}
              value={descricao}
            />
          </div>

          {submitError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
          <button
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Salvar exercicio
          </button>
        </div>
      </div>
    </div>
  )
}
