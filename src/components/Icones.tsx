// Icônes au trait, couleur héritée du texte (currentColor)
type Props = { taille?: number }

const trait = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function IconeTasse({ taille = 48 }: Props) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 48 48" aria-hidden="true" {...trait} strokeWidth={3}>
      <path d="M17 6c-2 2 2 4 0 6M23 6c-2 2 2 4 0 6M29 6c-2 2 2 4 0 6" />
      <path d="M9 18h28v8a12 12 0 0 1-12 12h-4A12 12 0 0 1 9 26z" />
      <path d="M37 21h2a5 5 0 0 1 0 10h-3" />
      <path d="M6 43h34" />
    </svg>
  )
}

export function IconeSandwich({ taille = 48 }: Props) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 48 48" aria-hidden="true" {...trait} strokeWidth={3}>
      <path d="M6 20a18 12 0 0 1 36 0z" />
      <path d="M18 13l1 2M25 11v2M31 13l-1 2" />
      <path d="M5 26c3 3 5-3 8 0s5-3 8 0 5-3 8 0 5-3 8 0 4-2 6 0" />
      <path d="M7 32h34v2a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5z" />
    </svg>
  )
}

export function IconeFleche({ taille = 20 }: Props) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" {...trait} strokeWidth={2.5}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconeRetour({ taille = 20 }: Props) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" {...trait} strokeWidth={2.5}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

export function IconeCloche({ taille = 20 }: Props) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" {...trait}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
      <path d="M10 21h4" />
    </svg>
  )
}

export function IconeMarche({ taille = 20 }: Props) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" {...trait}>
      <circle cx="13" cy="4" r="2" />
      <path d="M11 21l2-6 3 3v3M8 12l3-4 4 2 2 4M11 8l-1 6" />
    </svg>
  )
}
