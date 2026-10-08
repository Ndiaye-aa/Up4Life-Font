import { useState } from 'react'
import { ModalShell } from '../../ui/ModalShell'

interface Props {
  onAccept: () => Promise<void>
  onClose: () => void
}

export const HealthConsentModal = ({ onAccept, onClose }: Props) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const accept = async () => {
    setBusy(true)
    setError('')
    try {
      await onAccept()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível registrar o consentimento.')
      setBusy(false)
    }
  }

  return (
    <ModalShell eyebrow="Privacidade" onClose={onClose} title="Dados de saúde">
      <div className="space-y-3 text-sm leading-6 text-mute">
        <p>
          Para registrar dor ou desconforto, precisamos do seu consentimento para tratar esse dado
          de saúde (LGPD, art. 11).
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>A informação é usada apenas para o seu personal ajustar o seu treino.</li>
          <li>Ela é visível somente para você e para o seu personal.</li>
          <li>Ela nunca aparece em notificações enviadas ao seu celular.</li>
          <li>Você pode pedir a exclusão dos seus dados ao seu personal a qualquer momento.</li>
        </ul>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-400 light:text-rose-600">{error}</p> : null}
      <div className="mt-5 flex gap-3">
        <button
          className="flex-1 rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-mute transition hover:bg-elev"
          disabled={busy}
          onClick={onClose}
          type="button"
        >
          Agora não
        </button>
        <button className="btn-primary flex-1" disabled={busy} onClick={() => void accept()} type="button">
          {busy ? 'Registrando...' : 'Concordo'}
        </button>
      </div>
    </ModalShell>
  )
}
