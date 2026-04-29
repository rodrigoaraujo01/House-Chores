// Service Worker — House Chores
const CACHE_NAME = 'house-chores-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim())
})

// Handle push notifications sent from Supabase Edge Functions
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'House Chores 🏠', {
      body: data.body ?? 'Daily recap time!',
      icon: '/House-Chores/icon-192.png',
      badge: '/House-Chores/icon-192.png',
      tag: 'daily-overview',
      data: { url: data.url ?? '/#/overview' },
    })
  )
})

// Open overview page on notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/#/overview'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('house-chores') && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
