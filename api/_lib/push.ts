// Abonnements push (stockés dans Upstash) et envoi avec web-push.
import { createHash } from 'node:crypto'
import webpush from 'web-push'
import { redis } from './redis.js'

export const SUJETS = ['machine', 'bons_plans'] as const
export type Sujet = (typeof SUJETS)[number]

export type Abonnement = {
  endpoint: string
  p256dh: string
  auth: string
  sujets: Sujet[]
  seuil_centimes: number | null
  created_at: string
}

export type ChargePush = { title: string; body: string; url: string }

// Clés : abonnement:<id> (JSON) et abonnes:<sujet> (ensemble d'ids)
export function idAbonnement(endpoint: string): string {
  return createHash('sha256').update(endpoint).digest('hex').slice(0, 32)
}

export function pushPret(): boolean {
  return Boolean(process.env.VITE_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export async function enregistrer(abonnement: Abonnement): Promise<void> {
  const id = idAbonnement(abonnement.endpoint)
  await redis(['SET', `abonnement:${id}`, JSON.stringify(abonnement)])
  for (const sujet of SUJETS) {
    await redis([abonnement.sujets.includes(sujet) ? 'SADD' : 'SREM', `abonnes:${sujet}`, id])
  }
}

async function supprimer(id: string): Promise<void> {
  await redis(['DEL', `abonnement:${id}`])
  for (const sujet of SUJETS) await redis(['SREM', `abonnes:${sujet}`, id])
}

export async function abonnesA(sujet: Sujet): Promise<Abonnement[]> {
  const ids = await redis<string[]>(['SMEMBERS', `abonnes:${sujet}`])
  if (ids.length === 0) return []
  const brut = await redis<(string | null)[]>(['MGET', ...ids.map((id) => `abonnement:${id}`)])
  return brut.filter((s): s is string => s !== null).map((s) => JSON.parse(s) as Abonnement)
}

// Envoie à chaque abonné·e ; supprime les abonnements expirés (404 ou 410)
export async function envoyer(abonnements: Abonnement[], charge: ChargePush): Promise<{ envoyees: number; supprimees: number }> {
  webpush.setVapidDetails(
    'https://caf-croute.vercel.app',
    process.env.VITE_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  let envoyees = 0
  let supprimees = 0
  await Promise.all(
    abonnements.map(async (a) => {
      try {
        await webpush.sendNotification(
          { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
          JSON.stringify(charge),
          { TTL: 60 * 60, urgency: 'high' },
        )
        envoyees++
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          await supprimer(idAbonnement(a.endpoint))
          supprimees++
        }
      }
    }),
  )
  return { envoyees, supprimees }
}
