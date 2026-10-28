// Machine à café de l'école, dans l'esprit des illus de l'équipe DA (rose, crème, contour brun, petit visage).
// Dessinée en SVG ici plutôt qu'en fichier : son visage change avec l'état et les coups du mini-jeu.

const BRUN = '#442d29'
const CREME = '#fffae5'
const ROSE = '#f4b6c5'

export type Expression = 'contente' | 'dort' | 'panne' | 'aie' | 'eveillee' | 'fachee'

type Props = { expression: Expression; taille?: number; className?: string }

const trait = { fill: 'none', stroke: BRUN, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Visage({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'contente':
      return (
        <>
          <path d="M42 59 Q48 51 54 59" {...trait} />
          <path d="M69 58 Q75 50 81 58" {...trait} />
          <path d="M54 65 Q61 72 68 65" {...trait} />
          <circle cx="39" cy="66" r="3.5" fill={ROSE} />
          <circle cx="85" cy="65" r="3.5" fill={ROSE} />
        </>
      )
    case 'dort':
      return (
        <>
          <path d="M42 57 Q48 61 54 57" {...trait} />
          <path d="M69 56 Q75 60 81 56" {...trait} />
          <path d="M57 67 L65 67" {...trait} />
        </>
      )
    case 'panne':
      return (
        <>
          <path d="M43 52 L53 61 M53 52 L43 61" {...trait} />
          <path d="M70 51 L80 60 M80 51 L70 60" {...trait} />
          <path d="M50 68 Q54 64 58 68 Q62 72 66 68 Q70 64 73 68" {...trait} strokeWidth={3.5} />
        </>
      )
    case 'aie':
      return (
        <>
          <path d="M43 52 L53 57 L43 62" {...trait} />
          <path d="M80 51 L70 56 L80 61" {...trait} />
          <ellipse cx="61" cy="67" rx="5" ry="4.5" fill={BRUN} />
        </>
      )
    case 'eveillee':
      return (
        <>
          <circle cx="48" cy="56" r="5" fill={BRUN} />
          <circle cx="75" cy="55" r="5" fill={BRUN} />
          <circle cx="49.5" cy="54.5" r="1.6" fill={CREME} />
          <circle cx="76.5" cy="53.5" r="1.6" fill={CREME} />
          <ellipse cx="61" cy="67" rx="3" ry="3.5" {...trait} strokeWidth={3} />
        </>
      )
    case 'fachee':
      return (
        <>
          <path d="M41 49 L54 53" {...trait} />
          <path d="M82 48 L69 52" {...trait} />
          <circle cx="48" cy="58" r="3.5" fill={BRUN} />
          <circle cx="75" cy="57" r="3.5" fill={BRUN} />
          <path d="M54 69 Q61 63 68 69" {...trait} />
        </>
      )
  }
}

export function IlluMachine({ expression, taille = 56, className }: Props) {
  const enForme = expression === 'contente' || expression === 'eveillee'
  return (
    <svg
      viewBox="0 -18 122 156"
      width={taille}
      height={(taille * 156) / 122}
      aria-hidden="true"
      className={className}
      overflow="visible"
    >
      {/* Vapeur quand elle marche, fumée quand elle est en panne */}
      {expression === 'contente' && (
        <g {...trait} strokeWidth={3.5}>
          <path d="M42 6 Q37 0 42 -6 Q47 -12 42 -16" />
          <path d="M58 5 Q53 -1 58 -7 Q63 -13 58 -17" />
        </g>
      )}
      {expression === 'panne' && (
        <g {...trait} strokeWidth={3}>
          <circle cx="94" cy="1" r="6" />
          <circle cx="104" cy="-9" r="4" />
          <circle cx="110" cy="-16" r="2.5" />
        </g>
      )}

      {/* Bras : l'un salue quand elle va bien, les deux tombent sinon */}
      <path d="M20 84 Q9 88 8 99" {...trait} strokeWidth={5} />
      <circle cx="8" cy="101" r="4.5" fill={BRUN} />
      {enForme ? (
        <>
          <path d="M102 80 Q113 74 113 61" {...trait} strokeWidth={5} />
          <circle cx="113" cy="58" r="4.5" fill={BRUN} />
        </>
      ) : (
        <>
          <path d="M102 84 Q112 90 113 101" {...trait} strokeWidth={5} />
          <circle cx="113" cy="103" r="4.5" fill={BRUN} />
        </>
      )}

      {/* Corps rose un peu de travers, chapeau brun */}
      <path
        d="M22 34 Q20 29 26 29 L96 26 Q102 26 102 32 L104 118 Q104 124 98 124 L24 126 Q18 126 18 120 Z"
        fill={ROSE}
        stroke={BRUN}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M13 33 L15 18 Q16 12 23 12 L96 9 Q104 9 105 16 L109 31 Q60 37 13 33 Z" fill={BRUN} />
      <circle cx="90" cy="21" r="4" fill={CREME} />
      <circle cx="78" cy="21.5" r="3" fill={ROSE} />

      {/* Écran crème où vit le visage */}
      <path
        d="M33 42 L89 40 Q94 40 94 45 L94 70 Q94 75 89 75 L34 77 Q29 77 29 72 L29 47 Q29 42 33 42 Z"
        fill={CREME}
        stroke={BRUN}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Visage expression={expression} />

      {/* Bec verseur, goutte de café, tasse */}
      <path d="M50 81 L72 80 L71 90 L51 91 Z" fill={BRUN} />
      <path d="M57 91 L57 95 M65 91 L65 95" {...trait} strokeWidth={3.5} />
      {expression === 'contente' && <path d="M61 96 L61 99" {...trait} strokeWidth={3} />}
      <path
        d="M46 101 L76 100 L73 116 Q72 119 68 119 L55 119 Q51 119 50 116 Z"
        fill={CREME}
        stroke={BRUN}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M75 104 Q83 104 81 110 Q79 115 72 114" {...trait} strokeWidth={3.5} />

      {/* Pansement quand elle est en panne */}
      {expression === 'panne' && (
        <g transform="rotate(-28 88 104)">
          <rect x="77" y="99" width="24" height="10" rx="4" fill={CREME} stroke={BRUN} strokeWidth={3} />
          <path d="M86 102 L86 106 M92 102 L92 106" {...trait} strokeWidth={2} />
        </g>
      )}

      {/* Pieds */}
      <path d="M15 124 L107 121 L108 131 Q60 136 14 134 Z" fill={BRUN} />
    </svg>
  )
}
