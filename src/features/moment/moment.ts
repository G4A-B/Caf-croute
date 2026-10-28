// Mode jour (cafés, repas) ou mode nuit (bières), selon l'heure.
export type Moment = 'jour' | 'nuit'

// La nuit commence à 17 h et finit à 6 h
export const DEBUT_NUIT = 17
export const FIN_NUIT = 6

export function momentDe(date = new Date()): Moment {
  const heure = date.getHours()
  return heure >= DEBUT_NUIT || heure < FIN_NUIT ? 'nuit' : 'jour'
}

export function animationsReduites(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
