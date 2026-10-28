// /api/machine : état partagé de la machine à café de l'école.
//   GET  : { dernier: { id, etat, date } | null, verrou_jusqua: ISO | null }
//   POST : { etat: "en_panne" | "marche" } ajoute un signalement (on n'écrase jamais).
//          Refusé (409) pendant 5 min après le signalement précédent : tout le monde voit le même état.
// Stockage : Upstash Redis (voir _lib/redis.ts). Sans Upstash : 501.
// « Elle marche » juste après « En panne » : notification aux abonné·es « machine ».
import { abonnesA, envoyer, pushPret } from './_lib/push.js'
import { redis, stockagePret } from './_lib/redis.js'

const CLE_SIGNALEMENTS = 'machine:signalements'
const CLE_DERNIER_ENVOI = 'machine:dernier_envoi'
const CLE_VERROU = 'machine:verrou'
const GARDER = 200
// Après un signalement, personne ne peut changer l'état pendant 5 min
const VERROU_MS = 5 * 60 * 1000
// Anti-rebond : au plus une notification machine toutes les 30 min
const DELAI_MIN_NOTIF_MS = 30 * 60 * 1000
const ETATS = ['en_panne', 'marche']

type Signalement = { id: string; etat: string; date: string }

async function derniers(n: number): Promise<Signalement[]> {
  const brut = await redis<string[]>(['LRANGE', CLE_SIGNALEMENTS, '0', String(n - 1)])
  return brut.map((s) => JSON.parse(s) as Signalement)
}

const PAS_DE_CACHE = { 'Cache-Control': 'no-store' }

function verrouJusqua(dernier: Signalement | undefined, maintenant: number): string | null {
  if (!dernier) return null
  const fin = Date.parse(dernier.date) + VERROU_MS
  return fin > maintenant ? new Date(fin).toISOString() : null
}

export async function GET(): Promise<Response> {
  if (!stockagePret()) return Response.json({ erreur: 'stockage pas encore branché' }, { status: 501 })
  const [dernier] = await derniers(1)
  return Response.json(
    { dernier: dernier ?? null, verrou_jusqua: verrouJusqua(dernier, Date.now()) },
    { headers: PAS_DE_CACHE },
  )
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
  // Verrou atomique : si deux personnes signalent à la même seconde, une seule passe
  const pose = await redis<string | null>(['SET', CLE_VERROU, String(maintenant), 'NX', 'PX', String(VERROU_MS)])
  if (pose !== 'OK') {
    return Response.json(
      {
        erreur: 'état verrouillé',
        dernier: precedent ?? null,
        verrou_jusqua: verrouJusqua(precedent, maintenant) ?? new Date(maintenant + VERROU_MS).toISOString(),
      },
      { status: 409, headers: PAS_DE_CACHE },
    )
  }

  const dernier: Signalement = { id: `m-${maintenant}`, etat, date: new Date(maintenant).toISOString() }
  await redis(['LPUSH', CLE_SIGNALEMENTS, JSON.stringify(dernier)])
  await redis(['LTRIM', CLE_SIGNALEMENTS, '0', String(GARDER - 1)])

  // La machine remarche après une panne : prévenir les abonné·es (anti-rebond 30 min)
  let notification: { envoyees: number; supprimees: number } | null = null
  if (etat === 'marche' && precedent?.etat === 'en_panne' && pushPret()) {
    const dernierEnvoi = Number((await redis<string | null>(['GET', CLE_DERNIER_ENVOI])) ?? 0)
    if (maintenant - dernierEnvoi >= DELAI_MIN_NOTIF_MS) {
      await redis(['SET', CLE_DERNIER_ENVOI, String(maintenant)])
      notification = await envoyer(await abonnesA('machine'), {
        title: 'La machine remarche',
        body: 'La machine à café de l’école fonctionne de nouveau.',
        url: '/',
      })
    }
  }

  return Response.json(
    { dernier, verrou_jusqua: verrouJusqua(dernier, maintenant), notification },
    { status: 201, headers: PAS_DE_CACHE },
  )
}
