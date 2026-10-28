// État partagé de la machine à café de l'école, via /api/machine.
// Sans serveur (dev local, Upstash pas encore branché), on retombe sur src/data/machine.json.
import { etatMachineActuel } from '../../data/index.ts'
import type { EtatMachine, EtatMachineActuel, SignalementMachine } from '../../data/types.ts'

// Après un signalement, personne ne peut changer l'état pendant 5 min (vérifié aussi par le serveur)
export const VERROU_MS = 5 * 60 * 1000

export type EtatPartage = { etat: EtatMachineActuel; verrouJusqua: number | null }

type ReponseMachine = { dernier: SignalementMachine | null; verrou_jusqua?: string | null }

function lire(reponse: ReponseMachine, maintenant: Date): EtatPartage {
  return {
    etat: etatMachineActuel(maintenant, reponse.dernier ? [reponse.dernier] : []),
    verrouJusqua: reponse.verrou_jusqua ? Date.parse(reponse.verrou_jusqua) : null,
  }
}

export async function lireEtatMachine(maintenant = new Date()): Promise<EtatPartage> {
  try {
    const reponse = await fetch('/api/machine', { headers: { Accept: 'application/json' } })
    if (reponse.ok) return lire((await reponse.json()) as ReponseMachine, maintenant)
  } catch {
    // hors ligne : on garde les données embarquées
  }
  return { etat: etatMachineActuel(maintenant), verrouJusqua: null }
}

export type ResultatSignalement =
  | { ok: true; partage: EtatPartage }
  | { ok: false; raison: 'verrouille'; partage: EtatPartage }
  | { ok: false; raison: 'pas_encore_partage' | 'erreur' }

export async function signalerMachine(etat: EtatMachine, maintenant = new Date()): Promise<ResultatSignalement> {
  try {
    const reponse = await fetch('/api/machine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etat }),
    })
    if (reponse.ok) return { ok: true, partage: lire((await reponse.json()) as ReponseMachine, maintenant) }
    if (reponse.status === 409) {
      return { ok: false, raison: 'verrouille', partage: lire((await reponse.json()) as ReponseMachine, maintenant) }
    }
    return { ok: false, raison: reponse.status === 501 || reponse.status === 404 ? 'pas_encore_partage' : 'erreur' }
  } catch {
    return { ok: false, raison: 'erreur' }
  }
}
