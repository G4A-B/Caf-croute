// POST /api/notify : appelé par le webhook Vercel « deployment.succeeded ».
// SQUELETTE : vérifie la signature et le type d'événement, puis s'arrête. Rien n'est envoyé.
// Étape suivante (voir src/features/notifications/README.md) :
//   1. lire les abonnements et l'état (relevés connus, dernier signalement, dernier envoi) dans Upstash
//   2. calculer les envois avec calculerEnvois() de src/features/notifications/calcul.ts
//   3. npm install web-push, envoyer avec VAPID_PRIVATE_KEY, supprimer les abonnements en 404 ou 410
//   4. enregistrer le nouvel état dans Upstash
import { createHmac, timingSafeEqual } from 'node:crypto'

function signatureValide(corps: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const attendue = createHmac('sha1', secret).update(corps).digest('hex')
  const a = Buffer.from(attendue)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

type EvenementVercel = { type?: string; payload?: { target?: string | null } }

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.NOTIFY_SECRET
  if (!secret) return Response.json({ erreur: 'NOTIFY_SECRET manquant' }, { status: 501 })

  const corps = await request.text()
  if (!signatureValide(corps, request.headers.get('x-vercel-signature'), secret)) {
    return Response.json({ erreur: 'signature invalide' }, { status: 401 })
  }

  let evenement: EvenementVercel
  try {
    evenement = JSON.parse(corps) as EvenementVercel
  } catch {
    return Response.json({ erreur: 'JSON invalide' }, { status: 400 })
  }
  // Seuls les déploiements de production réussis déclenchent des notifications
  if (evenement.type !== 'deployment.succeeded' || evenement.payload?.target !== 'production') {
    return Response.json({ ignore: true })
  }

  // TODO étape notifications : étapes 1 à 4 ci-dessus
  return Response.json({ envoyees: 0, raison: 'envoi pas encore branché' })
}
