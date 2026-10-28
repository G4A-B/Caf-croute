import { useEffect, useState } from 'react'
import logo from '../assets/logo.svg'
import baguetteNuit from '../assets/illus/baguette-nuit.svg'
import baguette from '../assets/illus/baguette.svg'
import duo from '../assets/illus/duo.svg'
import sandwichNuit from '../assets/illus/sandwich-nuit.svg'
import sandwich from '../assets/illus/sandwich.svg'
import tasseBruneNuit from '../assets/illus/tasse-brune-nuit.svg'
import tasseBrune from '../assets/illus/tasse-brune.svg'
import tasseRoseNuit from '../assets/illus/tasse-rose-nuit.svg'
import tasseRose from '../assets/illus/tasse-rose.svg'
import type { Mode } from '../features/plan/plan.ts'
import { IconeBiere } from './Icones.tsx'

// Illustrations de l'équipe DA, animées en CSS (voir ecrans.css, coupé si « réduire les animations »).
// Version nuit : brun et crème échangés (fichiers *-nuit.svg), le rose ne change pas.
type Paire = { jour: string; nuit: string }
export const ILLUSTRATIONS = {
  baguette: { jour: baguette, nuit: baguetteNuit },
  sandwich: { jour: sandwich, nuit: sandwichNuit },
  tasseBrune: { jour: tasseBrune, nuit: tasseBruneNuit },
  tasseRose: { jour: tasseRose, nuit: tasseRoseNuit },
} satisfies Record<string, Paire>

// Les deux versions sont dans la page, le CSS montre celle du mode courant (pas de saut au retournement)
export function Illustration({ paire, className, delai = 0 }: { paire: Paire; className: string; delai?: number }) {
  const style = { animationDelay: `${delai}s` }
  return (
    <>
      <img src={paire.jour} alt="" className={`${className} illu-jour`} style={style} />
      <img src={paire.nuit} alt="" className={`${className} illu-nuit`} style={style} />
    </>
  )
}

// Écran de lancement : le duo tasse + sandwich, puis l'app
export function Splash({ fini }: { fini: () => void }) {
  const [sortie, setSortie] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setSortie(true), 1300)
    const t2 = setTimeout(fini, 1700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [fini])

  return (
    <div className={`splash${sortie ? ' splash--sortie' : ''}`} role="status" aria-label="Caf’croûte se prépare">
      <img src={duo} alt="" className="splash__illu anim-rebond" width={255} height={193} />
      <img src={logo} alt="Caf’croûte" className="splash__logo" width={160} height={121} />
    </div>
  )
}

const CHARGEMENTS: Record<Mode, { illus: Paire[]; texte: string }> = {
  cafe: { illus: [ILLUSTRATIONS.tasseRose], texte: 'On cherche ton café…' },
  manger: { illus: [ILLUSTRATIONS.sandwich], texte: 'On cherche de quoi manger…' },
  les_deux: { illus: [ILLUSTRATIONS.tasseBrune, ILLUSTRATIONS.baguette], texte: 'On assemble ta pause…' },
  biere: { illus: [], texte: 'On cherche ta bière…' },
}

// Micro-chargement avant les idées
export function Chargement({ mode }: { mode: Mode }) {
  const { illus, texte } = CHARGEMENTS[mode]
  return (
    <main className="ecran chargement" role="status">
      <div className="chargement__illus">
        {/* Provisoire : l'icône bière de l'équipe DA remplacera ce pictogramme */}
        {illus.length === 0 && (
          <span className="chargement__picto anim-balance">
            <IconeBiere taille={140} />
          </span>
        )}
        {illus.map((paire, i) => (
          <Illustration key={paire.jour} paire={paire} className="chargement__illu anim-balance" delai={i * 0.25} />
        ))}
      </div>
      <p className="chargement__texte">{texte}</p>
    </main>
  )
}
