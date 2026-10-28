// Valeurs autorisées : partagées par l'app et par scripts/verifier-donnees.ts
export const TYPES_LIEU = ['boulangerie', 'cafe_a_emporter', 'supermarche', 'machine_ecole', 'autre'] as const
export const CATEGORIES = ['a_manger', 'cafe', 'autre'] as const
export const ETATS_MACHINE = ['en_panne', 'marche'] as const

export const PRIX_MIN_CENTIMES = 20
export const PRIX_MAX_CENTIMES = 2000
export const NOM_MAX = 60
export const ARTICLE_MAX = 80
export const RELEVE_PAR_MAX = 40
// Au-delà, l'état de la machine s'affiche « inconnu »
export const DUREE_VALIDITE_MACHINE_MS = 2 * 60 * 60 * 1000

export type TypeLieu = (typeof TYPES_LIEU)[number]
export type Categorie = (typeof CATEGORIES)[number]
export type EtatMachine = (typeof ETATS_MACHINE)[number]

// src/data/lieux.json
export type Lieu = {
  id: string
  nom: string
  type: TypeLieu
  minutes_a_pied: number
}

// src/data/releves.json : on ajoute, on n'écrase jamais
export type RelevePrix = {
  id: string
  lieu_id: string
  article: string
  categorie: Categorie
  prix_centimes: number
  date: string
  releve_par?: string
}

// src/data/machine.json : un signalement par ligne
export type SignalementMachine = {
  id: string
  etat: EtatMachine
  date: string
}

export type EtatMachineActuel =
  | { etat: EtatMachine; depuis: string }
  | { etat: 'inconnu'; depuis: string | null }
