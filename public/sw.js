self.addEventListener('push', (event) => {
  let payload = {
    title: 'Up4Life',
    body: 'Você tem uma nova notificação.',
    url: '/',
  }

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() }
    } catch {
      payload.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favio.png',
      badge: '/favio.png',
      data: { url: payload.url },
    }),
  )
})

// Só navega para caminhos dentro do próprio app; payloads com URL externa caem no '/'.
const sanitizeUrl = (url) => {
  try {
    const resolved = new URL(url || '/', self.location.origin)
    return resolved.origin === self.location.origin
      ? resolved.pathname + resolved.search + resolved.hash
      : '/'
  } catch {
    return '/'
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = sanitizeUrl(event.notification.data?.url)

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
