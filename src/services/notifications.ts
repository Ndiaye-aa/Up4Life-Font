import { api } from './api'

export const getPushStatusService = async (): Promise<boolean> => {
  const result = await api('/notificacoes/status')
  return Boolean(result?.subscribed)
}

export const getVapidPublicKeyService = async (): Promise<string | null> => {
  const result = await api('/notificacoes/vapid-public-key')
  return (result?.publicKey as string) ?? null
}

export const subscribePushService = async (subscription: PushSubscriptionJSON) => {
  return api('/notificacoes/subscribe', {
    data: {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      },
    },
  })
}

export const unsubscribePushService = async (endpoint: string) => {
  return api('/notificacoes/subscribe', {
    method: 'DELETE',
    data: { endpoint },
  })
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
