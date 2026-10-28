const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

// 450 -> « 4,50 € »
export function formaterPrix(centimes: number): string {
  return euros.format(centimes / 100)
}

// 4 -> « 4 min à pied »
export function formaterMinutes(minutes: number): string {
  return minutes === 0 ? 'sur place' : `${minutes} min à pied`
}
