import { useEffect, useState } from 'react'
import logo from '../assets/logo.svg'
import baguette from '../assets/illus/baguette.svg'
import duo from '../assets/illus/duo.svg'
import sandwich from '../assets/illus/sandwich.svg'
import tasseBrune from '../assets/illus/tasse-brune.svg'
import tasseRose from '../assets/illus/tasse-rose.svg'
import type { Mode } from '../features/plan/plan.ts'

// Illustrations de l'équipe DA, animées en CSS (voir ecrans.css, coupé si « réduire les animations »)
export const ILLUSTRATIONS = { baguette, duo, sandwich, tasseBrune, tasseRose }

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

const CHARGEMENTS: Record<Mode, { illus: string[]; texte: string }> = {
  cafe: { illus: [tasseRose], texte: 'On cherche ton café…' },
  manger: { illus: [sandwich], texte: 'On cherche de quoi manger…' },
  les_deux: { illus: [tasseBrune, baguette], texte: 'On assemble ta pause…' },
}

// Micro-chargement avant les idées
export function Chargement({ mode }: { mode: Mode }) {
  const { illus, texte } = CHARGEMENTS[mode]
  return (
    <main className="ecran chargement" role="status">
      <div className="chargement__illus">
        {illus.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="chargement__illu anim-balance"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
      <p className="chargement__texte">{texte}</p>
    </main>
  )
}
