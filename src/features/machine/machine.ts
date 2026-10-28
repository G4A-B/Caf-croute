// État partagé de la machine à café de l'école, via /api/machine.
// Sans serveur (dev local, Upstash pas encore branché), on retombe sur src/data/machine.json.
import { etatMachineActuel } from '../../data/index.ts'
import type { EtatMachine, EtatMachineActuel, SignalementMachine } from '../../data/types.ts'

export async function lireEtatMachine(maintenant = new Date()): Promise<EtatMachineActuel> {
  try {
    const reponse = await fetch('/api/machine', { headers: { Accept: 'application/json' } })
    if (reponse.ok) {
      const { dernier } = (await reponse.json()) as { dernier: SignalementMachine | null }
      return etatMachineActuel(maintenant, dernier ? [dernier] : [])
    }
  } catch {
    // hors ligne : on garde les données embarquées
  }
  return etatMachineActuel(maintenant)
}

export type ResultatSignalement =
  | { ok: true; dernier: SignalementMachine }
  | { ok: false; raison: 'pas_encore_partage' | 'erreur' }

export async function signalerMachine(etat: EtatMachine): Promise<ResultatSignalement> {
  try {
    const reponse = await fetch('/api/machine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etat }),
    })
    if (reponse.ok) {
      const { dernier } = (await reponse.json()) as { dernier: SignalementMachine }
      return { ok: true, dernier }
    }
    return { ok: false, raison: reponse.status === 501 || reponse.status === 404 ? 'pas_encore_partage' : 'erreur' }
  } catch {
    return { ok: false, raison: 'erreur' }
  }
}
