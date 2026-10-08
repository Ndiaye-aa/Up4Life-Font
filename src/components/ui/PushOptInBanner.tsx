import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '../../hooks/usePushNotifications'

export const PushOptInBanner = () => {
  const dismissedKey = 'up4life.push.banner_dismissed.personal'
  const { supported, permission, subscribed, accountSubscribed, busy, ready, error, subscribe } =
    usePushNotifications()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(dismissedKey) === '1',
  )

  if (
    !supported ||
    !ready ||
    subscribed ||
    accountSubscribed ||
    dismissed ||
    permission === 'denied'
  ) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem(dismissedKey, '1')
    setDismissed(true)
  }

  return (
    <section className="card flex items-center gap-3 rounded-2xl p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Bell size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">Lembretes de avaliação</p>
        <p className="mt-0.5 text-xs text-faint">
          Receba um aviso no seu celular na véspera e no dia das avaliações agendadas dos seus alunos.
        </p>
        {error ? (
          <p className="mt-1 text-xs text-rose-400 light:text-rose-600">{error}</p>
        ) : null}
      </div>
      <button
        className="btn-primary rounded-xl px-4 py-2 text-sm"
        disabled={busy}
        onClick={() => void subscribe()}
        type="button"
      >
        {busy ? 'Ativando...' : error ? 'Tentar novamente' : 'Ativar'}
      </button>
      <button
        aria-label="Dispensar"
        className="shrink-0 rounded-lg p-1.5 text-faint transition hover:bg-elev hover:text-ink"
        onClick={handleDismiss}
        type="button"
      >
        <X size={16} />
      </button>
    </section>
  )
}
