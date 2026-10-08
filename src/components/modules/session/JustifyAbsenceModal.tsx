import { useState } from 'react'
import { formatYmd, weekdayName } from '../../../utils/sessionFormat'
import { ModalShell } from '../../ui/ModalShell'

interface Props {
  /** YYYY-MM-DD do treino a justificar */
  date: string
  /** `pre`: aviso antecipado de um dia futuro; `post`: justificar uma falta já registrada */
  mode: 'pre' | 'post'
  onClose: () => void
  onSubmit: (motivo: string) => Promise<void>
}

export const JustifyAbsenceModal = ({ date, mode, onClose, onSubmit }: Props) => {
  const [motivo, setMotivo] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await onSubmit(motivo.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar a justificativa.')
      setBusy(false)
    }
  }

  return (
    <ModalShell
      eyebrow={mode === 'pre' ? 'Aviso antecipado' : 'Justificar falta'}
      onClose={onClose}
      title={`Treino de ${weekdayName(date)} (${formatYmd(date)})`}
    >
      <p className="text-sm text-mute">
        {mode === 'pre'
          ? 'Avise com antecedência que não vai conseguir treinar nesse dia. Você não receberá lembrete de falta.'
          : 'Conte o que aconteceu. A falta justificada não entra no cálculo da sua frequência.'}
      </p>
      <label className="mt-4 block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-mute">Motivo (opcional)</span>
        <textarea
          className="field min-h-24 resize-none"
          maxLength={500}
          onChange={(event) => setMotivo(event.target.value)}
          placeholder="Ex.: viagem, consulta médica..."
          value={motivo}
        />
        <span className="block text-right text-xs text-faint">{motivo.length}/500</span>
      </label>
      {error ? <p className="mt-2 text-sm text-rose-400 light:text-rose-600">{error}</p> : null}
      <div className="mt-4 flex gap-3">
        <button
          className="flex-1 rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-mute transition hover:bg-elev"
          disabled={busy}
          onClick={onClose}
          type="button"
        >
          Cancelar
        </button>
        <button className="btn-primary flex-1" disabled={busy} onClick={() => void submit()} type="button">
          {busy ? 'Salvando...' : mode === 'pre' ? 'Não vou treinar' : 'Justificar'}
        </button>
      </div>
    </ModalShell>
  )
}
