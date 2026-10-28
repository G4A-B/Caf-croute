const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

// 450 -> « 4,50 € »
export function formaterPrix(centimes: number): string {
  return euros.format(centimes / 100)
}

// 4 -> « 4 min à pied »
export function formaterMinutes(minutes: number): string {
  return minutes === 0 ? 'sur place' : `${minutes} min à pied`
}

// Lie les deux derniers mots par une espace insécable : jamais un mot tout seul sur la dernière ligne.
// Pour les textes des données (noms, articles) ; le CSS (text-wrap: pretty) couvre le reste.
export function sansMotSeul(texte: string): string {
  return texte.replace(/ (\S+)$/, '\u00a0$1')
}
