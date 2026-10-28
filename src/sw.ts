/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

const CACHE_PAGES = 'pages'

// Mise à jour automatique : le nouveau service worker prend la main tout de suite
self.skipWaiting()
clientsClaim()

// Fichiers statiques (JS, CSS, icônes) : précachés à chaque déploiement
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Page HTML : réseau d'abord (nouvelles données à chaque déploiement), cache si hors ligne.
// Les appels /api ne sont jamais mis en cache.
registerRoute(
  new NavigationRoute(new NetworkFirst({ cacheName: CACHE_PAGES, networkTimeoutSeconds: 3 }), {
    denylist: [/^\/api\//],
  }),
)

// Garde une copie de la page dès l'installation pour le premier usage hors ligne
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_PAGES).then((cache) => cache.add('/')))
})

// Notifications push : charge utile JSON { title, body, url }
type ChargePush = { title: string; body: string; url: string }

function lireCharge(data: PushMessageData | null): ChargePush {
  const parDefaut: ChargePush = { title: 'La Pause', body: '', url: '/' }
  if (!data) return parDefaut
  try {
    const json = data.json() as Partial<ChargePush>
    return {
      title: typeof json.title === 'string' ? json.title : parDefaut.title,
      body: typeof json.body === 'string' ? json.body : parDefaut.body,
      url: typeof json.url === 'string' ? json.url : parDefaut.url,
    }
  } catch {
    return { ...parDefaut, body: data.text() }
  }
}

// N'ouvre que des adresses du site lui-même
function urlSure(url: string): string {
  const cible = new URL(url, self.location.origin)
  return cible.origin === self.location.origin ? cible.href : self.location.origin + '/'
}

self.addEventListener('push', (event) => {
  const { title, body, url } = lireCharge(event.data)
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      lang: 'fr',
      data: { url: urlSure(url) },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string = event.notification.data?.url ?? self.location.origin + '/'
  event.waitUntil(
    (async () => {
      const fenetres = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const existante = fenetres.find((f) => f.url === url)
      if (existante) return existante.focus()
      return self.clients.openWindow(url)
    })(),
  )
})
