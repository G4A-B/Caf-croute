// Upstash Redis via son API REST : pas de dépendance, juste fetch.
// Dossier préfixé par « _ » : Vercel n'en fait pas une route.

// L'intégration Vercel nomme les variables KV_REST_API_* ; Upstash en direct, UPSTASH_REDIS_REST_*
const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const JETON_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

export function stockagePret(): boolean {
  return Boolean(URL_REDIS && JETON_REDIS)
}

export async function redis<T = unknown>(commande: string[]): Promise<T> {
  const reponse = await fetch(URL_REDIS!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${JETON_REDIS}` },
    body: JSON.stringify(commande),
  })
  if (!reponse.ok) throw new Error(`Upstash ${reponse.status}`)
  return ((await reponse.json()) as { result: T }).result
}
