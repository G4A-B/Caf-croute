import { useEffect, useRef, useState } from 'react'
import type { EtatMachine, EtatMachineActuel } from '../../data/types.ts'
import { IlluMachine, type Expression } from './IlluMachine.tsx'

// Mini-jeu de la carte machine : on voit son état et on peut lui taper dessus.
// Les coups ne changent jamais l'état partagé : seuls les boutons « Elle marche » / « En panne » le font
// (c'est le seul endroit où l'on signale l'état).

// Nombre de coups avant que la machine réagisse vraiment
const SEUIL = 8
// Durée de la grimace après un coup
const GRIMACE_MS = 280

const BRUITS = ['Bonk !', 'Clang !', 'Pof !', 'Aïe !', 'Tchac !', 'Boing !']

type Props = {
  etat: EtatMachineActuel['etat']
  verrouille: boolean
  finVerrou: string | null
  enCours: boolean
  signaler: (etat: EtatMachine) => void
}

function textes(etat: Props['etat'], reussi: boolean): { titre: string; message: string } {
  if (etat === 'en_panne') {
    return reussi
      ? { titre: 'Elle repart ?', message: 'On dirait que ça a marché. Vérifie avec un vrai café avant de le dire à tout le monde.' }
      : { titre: 'En panne', message: 'Paraît qu’un bon coup suffit parfois. Tape-lui dessus.' }
  }
  if (etat === 'marche') {
    return reussi
      ? { titre: 'Elle boude', message: 'Elle marchait très bien. Laisse-la souffler un peu.' }
      : { titre: 'Elle marche', message: 'Pas besoin de la taper. Mais bon, si ça te détend…' }
  }
  return reussi
    ? { titre: 'Elle est réveillée', message: 'Alors, elle marche ?' }
    : { titre: 'État inconnu', message: 'Personne ne sait. Elle dort peut-être : réveille-la.' }
}

function expression(etat: Props['etat'], reussi: boolean): Expression {
  if (etat === 'en_panne') return reussi ? 'contente' : 'panne'
  if (etat === 'marche') return reussi ? 'fachee' : 'contente'
  return reussi ? 'eveillee' : 'dort'
}

export function JeuMachine({ etat, verrouille, finVerrou, enCours, signaler }: Props) {
  const [coups, setCoups] = useState(0)
  const [grimace, setGrimace] = useState(false)
  const minuterie = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Nouvel état signalé : la partie recommence
  useEffect(() => setCoups(0), [etat])
  useEffect(() => () => clearTimeout(minuterie.current), [])

  const reussi = coups >= SEUIL
  const { titre, message } = textes(etat, reussi)

  function taper() {
    setCoups((n) => n + 1)
    setGrimace(true)
    clearTimeout(minuterie.current)
    minuterie.current = setTimeout(() => setGrimace(false), GRIMACE_MS)
    navigator.vibrate?.(25)
  }

  return (
    <div className="jeu-machine">
      <h2 className="tiroir__titre" id="titre-jeu-machine">
        {titre}
      </h2>

      <button type="button" className="jeu-machine__machine" onClick={taper} aria-label="Taper sur la machine">
        {/* key : relance la secousse à chaque coup */}
        <span key={coups} className={coups > 0 ? 'jeu-machine__secousse' : undefined}>
          <IlluMachine expression={grimace ? 'aie' : expression(etat, reussi)} taille={170} />
        </span>
        {coups > 0 && (
          <span key={`bruit-${coups}`} className="jeu-machine__bruit" aria-hidden="true" style={{ left: `${20 + ((coups * 37) % 60)}%` }}>
            {BRUITS[coups % BRUITS.length]}
          </span>
        )}
      </button>

      <p className="jeu-machine__compteur" aria-live="polite">
        {coups === 0 ? 'Tape sur la machine' : `${coups} coup${coups > 1 ? 's' : ''}`}
      </p>
      <p className="jeu-machine__message">{message}</p>

      {verrouille ? (
        <p className="jeu-machine__message">Déjà signalée, modifiable à partir de {finVerrou}.</p>
      ) : (
        <div className="carte-machine__actions" role="group" aria-label="Signaler l’état de la machine">
          {(['marche', 'en_panne'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className="carte-machine__bouton"
              aria-pressed={etat === p}
              disabled={enCours}
              onClick={() => signaler(p)}
            >
              {p === 'marche' ? 'Elle marche' : 'En panne'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
