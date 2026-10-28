// POST /api/subscribe : enregistre un abonnement push.
// SQUELETTE : valide la demande mais ne stocke rien tant qu'Upstash n'est pas branché.
// Étape suivante (voir src/features/notifications/README.md) :
//   1. ajouter Upstash Redis depuis le Marketplace Vercel (crée UPSTASH_REDIS_REST_URL et _TOKEN)
//   2. npm install @upstash/redis
//   3. stocker l'abonnement sous la clé `abonnement:<endpoint>`

const SUJETS = ['machine', 'bons_plans']
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
  if (!Array.isArray(corps.sujets) || corps.sujets.length === 0 || !corps.sujets.every((x) => SUJETS.includes(x)))
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

  if (!(process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)) {
    return Response.json({ erreur: 'notifications pas encore activées' }, { status: 501 })
  }

  // TODO étape notifications : enregistrer dans Upstash avec created_at
  return Response.json({ erreur: 'stockage pas encore branché' }, { status: 501 })
}
