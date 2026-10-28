import lieuxJson from './lieux.json'
import machineJson from './machine.json'
import relevesJson from './releves.json'
import {
  DUREE_VALIDITE_MACHINE_MS,
  type EtatMachineActuel,
  type Lieu,
  type RelevePrix,
  type SignalementMachine,
} from './types.ts'

// Le format est vérifié au build par scripts/verifier-donnees.ts
export const lieux = lieuxJson as Lieu[]
export const releves = relevesJson as RelevePrix[]
export const signalementsMachine = machineJson as SignalementMachine[]

function plusRecentDabord<T extends { date: string }>(a: T, b: T): number {
  return Date.parse(b.date) - Date.parse(a.date)
}

function cleArticle(r: RelevePrix): string {
  return `${r.lieu_id}::${r.article.trim().toLowerCase()}::${r.consommation ?? ''}`
}

// Dernier relevé pour chaque (lieu, article, comptoir/salle/emporter)
export function prixActuels(liste: RelevePrix[] = releves): RelevePrix[] {
  const parArticle = new Map<string, RelevePrix>()
  for (const r of [...liste].sort(plusRecentDabord)) {
    const cle = cleArticle(r)
    if (!parArticle.has(cle)) parArticle.set(cle, r)
  }
  return [...parArticle.values()]
}

// Prix actuels que l'app peut proposer : sans ceux marqués « à vérifier »
export function prixFiables(liste: RelevePrix[] = releves): RelevePrix[] {
  return prixActuels(liste).filter((r) => !r.a_verifier)
}

// Dernier signalement, « inconnu » s'il a plus de 2 h
export function etatMachineActuel(
  maintenant: Date = new Date(),
  liste: SignalementMachine[] = signalementsMachine,
): EtatMachineActuel {
  const dernier = [...liste].sort(plusRecentDabord)[0]
  if (!dernier) return { etat: 'inconnu', depuis: null }
  const age = maintenant.getTime() - Date.parse(dernier.date)
  if (age > DUREE_VALIDITE_MACHINE_MS) return { etat: 'inconnu', depuis: dernier.date }
  return { etat: dernier.etat, depuis: dernier.date }
}

export function lieuParId(id: string): Lieu | undefined {
  return lieux.find((l) => l.id === id)
}
