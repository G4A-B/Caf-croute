// Décide quelles notifications envoyer après un déploiement.
// Fonction pure : pas de réseau, pas de stockage. api/notify.ts l'appellera.
import { formaterPrix } from '../../lib/format.ts'
import { DUREE_VALIDITE_MACHINE_MS, type Lieu, type RelevePrix, type SignalementMachine } from '../../data/types.ts'
import { DELAI_MIN_MACHINE_MS, type Abonnement, type Envoi, type EtatNotifications } from './types.ts'

type Entree = {
  lieux: Lieu[]
  releves: RelevePrix[]
  signalements: SignalementMachine[]
  abonnements: Abonnement[]
  etat: EtatNotifications
  maintenant: number
}

const parDate = <T extends { date: string }>(a: T, b: T) => Date.parse(a.date) - Date.parse(b.date)

export function calculerEnvois({ lieux, releves, signalements, abonnements, etat, maintenant }: Entree): {
  envois: Envoi[]
  nouvelEtat: EtatNotifications
} {
  const envois: Envoi[] = []
  const nouvelEtat: EtatNotifications = { ...etat, relevesConnus: releves.map((r) => r.id) }

  // 1. La machine remarche : dernier signalement « marche » juste après un « en_panne »
  const tries = [...signalements].sort(parDate)
  const dernier = tries.at(-1)
  const precedent = tries.at(-2)
  if (dernier && dernier.id !== etat.dernierSignalementMachine) {
    nouvelEtat.dernierSignalementMachine = dernier.id
    const recent = maintenant - Date.parse(dernier.date) <= DUREE_VALIDITE_MACHINE_MS
    const pasDeRebond = etat.dernierEnvoiMachine === null || maintenant - etat.dernierEnvoiMachine >= DELAI_MIN_MACHINE_MS
    if (dernier.etat === 'marche' && precedent?.etat === 'en_panne' && recent && pasDeRebond) {
      nouvelEtat.dernierEnvoiMachine = maintenant
      for (const a of abonnements.filter((a) => a.sujets.includes('machine'))) {
        envois.push({
          endpoint: a.endpoint,
          charge: { title: 'La machine remarche', body: "La machine à café de l'école fonctionne de nouveau.", url: '/' },
        })
      }
    }
  }

  // 2. Nouveaux bons plans sous le seuil de chaque abonné·e (premier passage : rien)
  if (etat.relevesConnus !== null) {
    const connus = new Set(etat.relevesConnus)
    const nouveaux = releves.filter((r) => !connus.has(r.id) && r.categorie !== 'autre' && !r.a_verifier)
    for (const a of abonnements) {
      if (!a.sujets.includes('bons_plans') || a.seuil_centimes === null) continue
      const seuil = a.seuil_centimes
      const sousSeuil = nouveaux.filter((r) => r.prix_centimes <= seuil).sort((x, y) => x.prix_centimes - y.prix_centimes)
      const meilleur = sousSeuil[0]
      if (!meilleur) continue
      const lieu = lieux.find((l) => l.id === meilleur.lieu_id)
      const autres = sousSeuil.length - 1
      envois.push({
        endpoint: a.endpoint,
        charge: {
          title: `Bon plan à ${formaterPrix(meilleur.prix_centimes)}`,
          body: `${meilleur.article}${lieu ? `, ${lieu.nom}` : ''}${autres > 0 ? ` (et ${autres} autre${autres > 1 ? 's' : ''})` : ''}`,
          url: '/',
        },
      })
    }
  }

  return { envois, nouvelEtat }
}
