// Calcule les propositions de pause : une carte par lieu, à faire glisser.
// Fonctions pures : pas d'interface, pas de réseau.
import { lieux as tousLesLieux, prixFiables } from '../../data/index.ts'
import type { Lieu, RelevePrix } from '../../data/types.ts'

export type Mode = 'cafe' | 'manger' | 'les_deux' | 'biere'

// On ne propose que ce qui est à 10 min à pied ou moins
export const MINUTES_MAX = 10

export type Choix = { releve: RelevePrix; lieu: Lieu }

export type Proposition = {
  cafe?: Choix
  manger?: Choix
  biere?: Choix
  total_centimes: number
  // Temps pour rejoindre le lieu le plus loin
  minutes_a_pied: number
  // Les autres articles du même lieu qui rentrent dans le budget
  autres: Choix[]
}

// Nombre maximum d'articles en plus affichés sur une carte
export const AUTRES_MAX = 4

export type Budget = { centimes: number; libelle: string }

export const BUDGETS: Record<Mode, { min: number; max: number; suggestions: Budget[] }> = {
  cafe: {
    min: 100,
    max: 600,
    suggestions: [
      { centimes: 200, libelle: 'Un expresso au comptoir' },
      { centimes: 300, libelle: 'Un bon café' },
      { centimes: 400, libelle: 'Café de spécialité' },
    ],
  },
  manger: {
    min: 300,
    max: 1000,
    suggestions: [
      { centimes: 500, libelle: 'Un petit creux' },
      { centimes: 750, libelle: 'Un vrai repas' },
      { centimes: 1000, libelle: 'Grosse faim' },
    ],
  },
  les_deux: {
    min: 400,
    max: 1200,
    suggestions: [
      { centimes: 600, libelle: 'Le minimum' },
      { centimes: 800, libelle: 'Le classique' },
      { centimes: 1000, libelle: 'Je me fais plaisir' },
    ],
  },
  biere: {
    min: 200,
    max: 1000,
    suggestions: [
      { centimes: 300, libelle: 'Un demi' },
      { centimes: 500, libelle: 'Une pinte' },
      { centimes: 700, libelle: 'Une spéciale' },
    ],
  },
}

const CLE: Record<RelevePrix['categorie'], 'cafe' | 'manger' | 'biere'> = {
  cafe: 'cafe',
  a_manger: 'manger',
  biere: 'biere',
  autre: 'manger',
}

type Donnees = { releves: RelevePrix[]; lieux: Lieu[] }

function choixProches(categorie: RelevePrix['categorie'], { releves, lieux }: Donnees): Choix[] {
  const parId = new Map(lieux.map((l) => [l.id, l]))
  return releves
    .filter((r) => r.categorie === categorie)
    .map((releve) => ({ releve, lieu: parId.get(releve.lieu_id) }))
    .filter((c): c is Choix => c.lieu !== undefined && c.lieu.minutes_a_pied <= MINUTES_MAX)
}

// Le plus proche d'abord, puis le plus copieux dans le budget
function ordre(a: Proposition, b: Proposition): number {
  return a.minutes_a_pied - b.minutes_a_pied || b.total_centimes - a.total_centimes
}

// Une proposition par lieu : son article le plus copieux dans le budget, puis les autres
function parLieu(choix: Choix[], budget: number): Proposition[] {
  const groupes = new Map<string, Choix[]>()
  for (const c of choix) {
    if (c.releve.prix_centimes > budget) continue
    groupes.set(c.lieu.id, [...(groupes.get(c.lieu.id) ?? []), c])
  }
  return [...groupes.values()].map((liste) => {
    const [principal, ...autres] = liste.sort((a, b) => b.releve.prix_centimes - a.releve.prix_centimes)
    return {
      [CLE[principal.releve.categorie]]: principal,
      total_centimes: principal.releve.prix_centimes,
      minutes_a_pied: principal.lieu.minutes_a_pied,
      autres: autres.slice(0, AUTRES_MAX),
    }
  })
}

function minutesDuo(manger: Choix, cafe: Choix): number {
  const memeLieu = manger.lieu.id === cafe.lieu.id
  return Math.max(manger.lieu.minutes_a_pied, cafe.lieu.minutes_a_pied) + (memeLieu ? 0 : 1)
}

// Une proposition par lieu où manger : le plat le plus copieux qui laisse de quoi payer un café,
// et le café le plus simple à attraper (même lieu, puis le plus proche, puis le moins cher)
function duos(cafes: Choix[], plats: Choix[], budget: number): Proposition[] {
  const parLieu = new Map<string, Proposition>()
  for (const manger of plats) {
    const cafe = cafes
      .filter((c) => manger.releve.prix_centimes + c.releve.prix_centimes <= budget)
      .sort(
        (a, b) =>
          Number(b.lieu.id === manger.lieu.id) - Number(a.lieu.id === manger.lieu.id) ||
          minutesDuo(manger, a) - minutesDuo(manger, b) ||
          a.releve.prix_centimes - b.releve.prix_centimes,
      )[0]
    if (!cafe) continue
    const proposition = {
      manger,
      cafe,
      total_centimes: manger.releve.prix_centimes + cafe.releve.prix_centimes,
      minutes_a_pied: minutesDuo(manger, cafe),
      autres: [],
    }
    const actuelle = parLieu.get(manger.lieu.id)
    if (!actuelle || manger.releve.prix_centimes > actuelle.manger!.releve.prix_centimes) {
      parLieu.set(manger.lieu.id, proposition)
    }
  }
  return [...parLieu.values()]
}

export function propositions(
  mode: Mode,
  budget: number,
  donnees: Donnees = { releves: prixFiables(), lieux: tousLesLieux },
): Proposition[] {
  const cafes = choixProches('cafe', donnees)
  const plats = choixProches('a_manger', donnees)
  const liste =
    mode === 'cafe'
      ? parLieu(cafes, budget)
      : mode === 'manger'
        ? parLieu(plats, budget)
        : mode === 'biere'
          ? parLieu(choixProches('biere', donnees), budget)
          : duos(cafes, plats, budget)
  return liste.sort(ordre)
}

// Nombre de lieux proposables pour un mode, au budget le plus haut (affiché sur l'accueil)
export function nombreDeLieux(mode: Mode, donnees?: Donnees): number {
  return propositions(mode, BUDGETS[mode].max, donnees).length
}
