import type { DemandeAbonnement, Sujet } from './types.ts'

const CLE_VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function notificationsPossibles(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function notificationsActivees(): boolean {
  return Boolean(CLE_VAPID)
}

// La clé VAPID publique arrive en base64url, le navigateur veut des octets
function versOctets(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export type ResultatAbonnement = 'ok' | 'non_supporte' | 'pas_encore_active' | 'refuse' | 'erreur'

// À appeler uniquement depuis un geste (clic) : jamais au chargement de la page
export async function sAbonner(sujets: Sujet[], seuilCentimes: number | null): Promise<ResultatAbonnement> {
  if (!notificationsPossibles()) return 'non_supporte'
  if (!CLE_VAPID) return 'pas_encore_active'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'refuse'

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: versOctets(CLE_VAPID) }))
    const json = subscription.toJSON()
    const demande: DemandeAbonnement = {
      subscription: { endpoint: subscription.endpoint, keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' } },
      sujets,
      seuil_centimes: seuilCentimes,
    }
    const reponse = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demande),
    })
    return reponse.ok ? 'ok' : 'erreur'
  } catch {
    return 'erreur'
  }
}
