// Valeurs autorisées : partagées par l'app et par scripts/verifier-donnees.ts
export const TYPES_LIEU = [
  'boulangerie',
  'coffee_shop',
  'bar',
  'restauration_rapide',
  'supermarche',
  'epicerie',
  'machine_ecole',
  'autre',
] as const
export const CATEGORIES = ['a_manger', 'cafe', 'autre'] as const
// Pour comparer les cafés entre eux (catégorie « cafe » seulement)
export const TYPES_CAFE = ['expresso', 'double', 'allonge', 'creme', 'au_lait', 'specialite', 'glace'] as const
// Le même café coûte parfois plus cher en salle qu'au comptoir
export const CONSOMMATIONS = ['comptoir', 'salle', 'emporter'] as const
export const ETATS_MACHINE = ['en_panne', 'marche'] as const

export const PRIX_MIN_CENTIMES = 20
export const PRIX_MAX_CENTIMES = 2000
export const NOM_MAX = 60
export const ARTICLE_MAX = 80
export const RELEVE_PAR_MAX = 40
export const ADRESSE_MAX = 120
export const SOURCE_MAX = 120
export const REMARQUE_MAX = 160
// Au-delà, l'état de la machine s'affiche « inconnu »
export const DUREE_VALIDITE_MACHINE_MS = 2 * 60 * 60 * 1000

export type TypeLieu = (typeof TYPES_LIEU)[number]
export type Categorie = (typeof CATEGORIES)[number]
export type TypeCafe = (typeof TYPES_CAFE)[number]
export type Consommation = (typeof CONSOMMATIONS)[number]
export type EtatMachine = (typeof ETATS_MACHINE)[number]

// src/data/lieux.json
export type Lieu = {
  id: string
  nom: string
  type: TypeLieu
  // Depuis l'entrée de l'école, 13 rue Poulain Duparc
  minutes_a_pied: number
  adresse?: string
}

// src/data/releves.json : on ajoute, on n'écrase jamais
export type RelevePrix = {
  id: string
  lieu_id: string
  article: string
  categorie: Categorie
  prix_centimes: number
  date: string
  // D'où vient le prix : « photo:<fichier> », « note:<auteur> », « benchmark:<origine> », « terrain »
  source: string
  type_cafe?: TypeCafe
  consommation?: Consommation
  // true : prix à confirmer sur place, l'app ne le propose pas encore
  a_verifier?: boolean
  remarque?: string
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
