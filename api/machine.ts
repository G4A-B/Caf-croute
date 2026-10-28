// /api/machine : état partagé de la machine à café de l'école.
//   GET  : dernier signalement { dernier: { id, etat, date } | null }
//   POST : { etat: "en_panne" | "marche" } ajoute un signalement (on n'écrase jamais)
// Stockage : Upstash Redis via son API REST (pas de dépendance). Sans Upstash : 501.
// Notification « la machine remarche » : décidée ici, envoi à brancher (voir src/features/notifications/README.md).

const CLE_SIGNALEMENTS = 'machine:signalements'
const CLE_DERNIER_ENVOI = 'machine:dernier_envoi'
const GARDER = 200
// Même état signalé deux fois de suite en moins de 2 min : on ne l'enregistre qu'une fois
const DOUBLON_MS = 2 * 60 * 1000
// Anti-rebond : au plus une notification machine toutes les 30 min
const DELAI_MIN_NOTIF_MS = 30 * 60 * 1000
const ETATS = ['en_panne', 'marche']

type Signalement = { id: string; etat: string; date: string }

// L'intégration Vercel nomme les variables KV_REST_API_* ; Upstash en direct, UPSTASH_REDIS_REST_*
const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const JETON_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

async function redis(commande: string[]): Promise<unknown> {
  const reponse = await fetch(URL_REDIS!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${JETON_REDIS}` },
    body: JSON.stringify(commande),
  })
  if (!reponse.ok) throw new Error(`Upstash ${reponse.status}`)
  return ((await reponse.json()) as { result: unknown }).result
}

async function derniers(n: number): Promise<Signalement[]> {
  const brut = (await redis(['LRANGE', CLE_SIGNALEMENTS, '0', String(n - 1)])) as string[]
  return brut.map((s) => JSON.parse(s) as Signalement)
}

function stockagePret(): boolean {
  return Boolean(URL_REDIS && JETON_REDIS)
}

const PAS_DE_CACHE = { 'Cache-Control': 'no-store' }

export async function GET(): Promise<Response> {
  if (!stockagePret()) return Response.json({ erreur: 'stockage pas encore branché' }, { status: 501 })
  const [dernier] = await derniers(1)
  return Response.json({ dernier: dernier ?? null }, { headers: PAS_DE_CACHE })
}

export async function POST(request: Request): Promise<Response> {
  if (!stockagePret()) return Response.json({ erreur: 'stockage pas encore branché' }, { status: 501 })

  const texte = await request.text()
  if (texte.length > 200) return Response.json({ erreur: 'demande trop grande' }, { status: 413 })
  let etat: unknown
  try {
    etat = (JSON.parse(texte) as { etat?: unknown }).etat
  } catch {
    return Response.json({ erreur: 'JSON invalide' }, { status: 400 })
  }
  if (typeof etat !== 'string' || !ETATS.includes(etat)) {
    return Response.json({ erreur: 'etat doit valoir en_panne ou marche' }, { status: 400 })
  }

  const maintenant = Date.now()
  const [precedent] = await derniers(1)
  if (precedent && precedent.etat === etat && maintenant - Date.parse(precedent.date) < DOUBLON_MS) {
    return Response.json({ dernier: precedent, doublon: true }, { headers: PAS_DE_CACHE })
  }

  const dernier: Signalement = { id: `m-${maintenant}`, etat, date: new Date(maintenant).toISOString() }
  await redis(['LPUSH', CLE_SIGNALEMENTS, JSON.stringify(dernier)])
  await redis(['LTRIM', CLE_SIGNALEMENTS, '0', String(GARDER - 1)])

  // La machine remarche après une panne : prévenir les abonné·es (anti-rebond 30 min)
  let notification: 'aucune' | 'a_envoyer' = 'aucune'
  if (etat === 'marche' && precedent?.etat === 'en_panne') {
    const dernierEnvoi = Number((await redis(['GET', CLE_DERNIER_ENVOI])) ?? 0)
    if (maintenant - dernierEnvoi >= DELAI_MIN_NOTIF_MS) {
      await redis(['SET', CLE_DERNIER_ENVOI, String(maintenant)])
      notification = 'a_envoyer'
      // TODO étape notifications : web-push vers les abonnements « machine »
    }
  }

  return Response.json({ dernier, notification }, { status: 201, headers: PAS_DE_CACHE })
}
