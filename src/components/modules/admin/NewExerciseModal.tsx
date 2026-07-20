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
      setSubmitError('Informe um nome de exercício válido (min. 3 caracteres).')
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
        error instanceof Error ? error.message : 'Não foi possivel salvar o exercício agora.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex w-full flex-col rounded-t-[2rem] border border-line bg-surface shadow-2xl sm:max-w-md sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent">Exercícios</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-ink">
              Novo exercício
            </h2>
            <p className="mt-1 text-sm text-mute">
              Adicione uma variação ao catálogo de exercícios.
            </p>
          </div>
          <button
            className="rounded-xl p-2 text-faint transition hover:bg-elev"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-mute">
              Nome do exercício
            </label>
            <div className="relative">
              <Dumbbell
                className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                size={16}
              />
              <input
                className="field pl-10"
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex: Supino Reto com Barra"
                type="text"
                value={nome}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-mute">
              Grupo muscular
            </label>
            <select
              className="field"
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
            <label className="text-xs font-medium uppercase tracking-wide text-mute">
              Descrição <span className="normal-case text-faint">(opcional)</span>
            </label>
            <textarea
              className="field resize-none"
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex: Executar com pegada pronada, cotovelos proximos ao corpo..."
              rows={3}
              value={descricao}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-rose-400 light:text-rose-600">{submitError}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-line p-5">
          <button
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-elev"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="btn-primary rounded-xl px-5 py-2.5"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Salvar exercício
          </button>
        </div>
      </div>
    </div>
  )
}
