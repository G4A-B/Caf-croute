// Vérifie src/data/*.json avant chaque build (npm run build lance d'abord ce script).
// Une donnée invalide fait échouer le build, donc le déploiement Vercel.
// Lancer à la main : npm run verifier-donnees
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  ARTICLE_MAX,
  CATEGORIES,
  ETATS_MACHINE,
  NOM_MAX,
  PRIX_MAX_CENTIMES,
  PRIX_MIN_CENTIMES,
  RELEVE_PAR_MAX,
  TYPES_LIEU,
} from '../src/data/types.ts'

type Objet = Record<string, unknown>
type Fichier = { chemin: string; texte: string; entrees: Objet[] }

const DOSSIER = new URL('../src/data/', import.meta.url)
const UN_JOUR_MS = 24 * 60 * 60 * 1000
const erreurs: string[] = []

function charger(nom: string): Fichier {
  const chemin = `src/data/${nom}`
  const texte = readFileSync(fileURLToPath(new URL(nom, DOSSIER)), 'utf8')
  let json: unknown
  try {
    json = JSON.parse(texte)
  } catch (e) {
    erreurs.push(`${chemin} : JSON invalide (${(e as Error).message}). Vérifie les virgules et les guillemets.`)
    return { chemin, texte, entrees: [] }
  }
  if (!Array.isArray(json)) {
    erreurs.push(`${chemin} : le fichier doit contenir une liste [ ... ].`)
    return { chemin, texte, entrees: [] }
  }
  return { chemin, texte, entrees: json as Objet[] }
}

// Numéro de ligne de l'entrée, retrouvé grâce à son id
function ligne(f: Fichier, e: Objet, index: number): string {
  if (typeof e?.id === 'string') {
    const pos = f.texte.indexOf(`"id": "${e.id}"`)
    if (pos >= 0) return `ligne ${f.texte.slice(0, pos).split('\n').length} (${e.id})`
  }
  return `entrée n°${index + 1}`
}

function verifier(f: Fichier, champs: Record<string, (v: unknown) => string | null>, optionnels: string[] = []) {
  const ids = new Set<string>()
  f.entrees.forEach((e, i) => {
    const ou = `${f.chemin}, ${ligne(f, e, i)}`
    if (typeof e !== 'object' || e === null || Array.isArray(e)) {
      erreurs.push(`${ou} : chaque entrée doit être un objet { ... }.`)
      return
    }
    for (const cle of Object.keys(e)) {
      if (!(cle in champs)) erreurs.push(`${ou} : champ inconnu « ${cle} » (faute de frappe ?).`)
    }
    for (const [cle, test] of Object.entries(champs)) {
      if (!(cle in e)) {
        if (!optionnels.includes(cle)) erreurs.push(`${ou} : champ « ${cle} » manquant.`)
        continue
      }
      const probleme = test(e[cle])
      if (probleme) erreurs.push(`${ou} : ${cle} ${probleme} (reçu ${JSON.stringify(e[cle])}).`)
    }
    if (typeof e.id === 'string') {
      if (ids.has(e.id)) erreurs.push(`${ou} : l'id « ${e.id} » existe déjà, choisis un id nouveau.`)
      ids.add(e.id)
    }
  })
  return ids
}

const texte = (max: number) => (v: unknown) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max ? null : `doit être un texte de 1 à ${max} caractères`
const parmi = (valeurs: readonly string[]) => (v: unknown) =>
  typeof v === 'string' && valeurs.includes(v) ? null : `doit valoir ${valeurs.join(', ')}`
const identifiant = (v: unknown) =>
  typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v) ? null : 'doit contenir seulement a-z, 0-9 et des tirets'
const entier = (min: number, max: number) => (v: unknown) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? null : `doit être un entier entre ${min} et ${max}`
const date = (v: unknown) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) || Number.isNaN(Date.parse(v)))
    return 'doit être une date comme "2026-10-28T12:15:00+01:00"'
  if (Date.parse(v) > Date.now() + UN_JOUR_MS) return 'est dans le futur'
  return null
}

const lieux = charger('lieux.json')
const releves = charger('releves.json')
const machine = charger('machine.json')

const idsLieux = verifier(lieux, {
  id: identifiant,
  nom: texte(NOM_MAX),
  type: parmi(TYPES_LIEU),
  minutes_a_pied: entier(0, 60),
})

verifier(
  releves,
  {
    id: identifiant,
    lieu_id: (v) => (typeof v === 'string' && idsLieux.has(v) ? null : "doit être l'id d'un lieu de lieux.json"),
    article: texte(ARTICLE_MAX),
    categorie: parmi(CATEGORIES),
    prix_centimes: entier(PRIX_MIN_CENTIMES, PRIX_MAX_CENTIMES),
    date,
    releve_par: texte(RELEVE_PAR_MAX),
  },
  ['releve_par'],
)

verifier(machine, { id: identifiant, etat: parmi(ETATS_MACHINE), date })

if (erreurs.length > 0) {
  console.error(`\n✗ Données invalides (${erreurs.length} erreur${erreurs.length > 1 ? 's' : ''}) :\n`)
  for (const e of erreurs) console.error(`  - ${e}`)
  console.error('\nCorrige ces lignes puis relance npm run build. Aide : CONTENU.md\n')
  process.exit(1)
}

console.log(
  `✓ Données valides : ${lieux.entrees.length} lieux, ${releves.entrees.length} relevés, ${machine.entrees.length} signalements machine.`,
)
