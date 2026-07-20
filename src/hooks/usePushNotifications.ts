import { useCallback, useEffect, useState } from 'react'
import {
  getPushStatusService,
  getVapidPublicKeyService,
  subscribePushService,
  unsubscribePushService,
  urlBase64ToUint8Array,
} from '../services/notifications'

const isSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied',
  )
  const [subscribed, setSubscribed] = useState(false)
  const [accountSubscribed, setAccountSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(!isSupported)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupported) return

    const browserCheck = navigator.serviceWorker
      .getRegistration('/sw.js')
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => Boolean(subscription))
      .catch(() => false)

    const accountCheck = getPushStatusService().catch(() => false)

    Promise.all([browserCheck, accountCheck])
      .then(([browser, account]) => {
        setSubscribed(browser)
        setAccountSubscribed(account)
      })
      .finally(() => setReady(true))
  }, [])

  const subscribe = useCallback(async () => {
    if (!isSupported || busy) return false
    setBusy(true)
    setError(null)

    let step: 'navegador' | 'servidor' = 'navegador'
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return false

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const publicKey = await getVapidPublicKeyService()
      if (!publicKey) {
        setError('O servidor não está configurado para enviar notificações.')
        return false
      }

      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }))

      step = 'servidor'
      await subscribePushService(subscription.toJSON())
      setSubscribed(true)
      setAccountSubscribed(true)
      return true
    } catch (err) {
      console.error(`Falha ao ativar push (${step}):`, err)
      if (step === 'servidor') {
        setError('Não foi possível salvar sua inscrição no servidor. Tente novamente.')
      } else {
        setError(
          'brave' in navigator
            ? 'O Brave bloqueou o registro de push. Ative "Use Google services for push messaging" em Configurações → Privacidade e tente de novo.'
            : 'Seu navegador não conseguiu registrar as notificações push. Tente outro navegador (ex.: Chrome).',
        )
      }
      return false
    } finally {
      setBusy(false)
    }
  }, [busy])

  const unsubscribe = useCallback(async () => {
    if (!isSupported || busy) return false
    setBusy(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()

      if (subscription) {
        await unsubscribePushService(subscription.endpoint).catch(() => undefined)
        await subscription.unsubscribe()
      }

      setSubscribed(false)
      setAccountSubscribed(await getPushStatusService().catch(() => false))
      return true
    } catch (err) {
      console.error('Falha ao desativar push:', err)
      setError('Não foi possível desativar. Tente novamente.')
      return false
    } finally {
      setBusy(false)
    }
  }, [busy])

  return {
    supported: isSupported,
    permission,
    subscribed,
    accountSubscribed,
    busy,
    ready,
    error,
    subscribe,
    unsubscribe,
  }
}
