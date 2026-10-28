// POST /api/subscribe : enregistre (ou met à jour) un abonnement push dans Upstash.
import { enregistrer, SUJETS, type Abonnement, type Sujet } from './_lib/push.js'
import { stockagePret } from './_lib/redis.js'

const MAX_CORPS = 4096

type Corps = {
  subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
  sujets?: unknown
  seuil_centimes?: unknown
}

function texteCourt(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= max
}

function valider(corps: Corps): string | null {
  const s = corps.subscription
  if (!s || !texteCourt(s.endpoint, 1000) || !s.endpoint.startsWith('https://')) return 'endpoint invalide'
  if (!texteCourt(s.keys?.p256dh, 200) || !texteCourt(s.keys?.auth, 100)) return 'clés invalides'
  if (
    !Array.isArray(corps.sujets) ||
    corps.sujets.length === 0 ||
    !corps.sujets.every((x) => (SUJETS as readonly unknown[]).includes(x))
  )
    return 'sujets invalides'
  const seuil = corps.seuil_centimes
  if (seuil !== null && !(Number.isInteger(seuil) && (seuil as number) >= 20 && (seuil as number) <= 2000))
    return 'seuil invalide'
  return null
}

export async function POST(request: Request): Promise<Response> {
  const texte = await request.text()
  if (texte.length > MAX_CORPS) return Response.json({ erreur: 'demande trop grande' }, { status: 413 })

  let corps: Corps
  try {
    corps = JSON.parse(texte) as Corps
  } catch {
    return Response.json({ erreur: 'JSON invalide' }, { status: 400 })
  }
  const probleme = valider(corps)
  if (probleme) return Response.json({ erreur: probleme }, { status: 400 })

  if (!stockagePret()) return Response.json({ erreur: 'notifications pas encore activées' }, { status: 501 })

  const abonnement: Abonnement = {
    endpoint: corps.subscription!.endpoint as string,
    p256dh: corps.subscription!.keys!.p256dh as string,
    auth: corps.subscription!.keys!.auth as string,
    sujets: corps.sujets as Sujet[],
    seuil_centimes: (corps.seuil_centimes as number | null) ?? null,
    created_at: new Date().toISOString(),
  }
  await enregistrer(abonnement)
  return Response.json({ ok: true }, { status: 201 })
}
