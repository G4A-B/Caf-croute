import { useCallback, useEffect, useRef, useState } from 'react'
import baguetteNuit from '../assets/illus/baguette-nuit.svg'
import biereBeige from '../assets/illus/biere-beige.svg'
import biereNoire from '../assets/illus/biere-noire.svg'
import biereRose from '../assets/illus/biere-rose.svg'
import trinqueClair from '../assets/illus/trinque-clair.svg'
import baguette from '../assets/illus/baguette.svg'
import sandwichNuit from '../assets/illus/sandwich-nuit.svg'
import sandwich from '../assets/illus/sandwich.svg'
import tasseBruneNuit from '../assets/illus/tasse-brune-nuit.svg'
import tasseBrune from '../assets/illus/tasse-brune.svg'
import tasseRoseNuit from '../assets/illus/tasse-rose-nuit.svg'
import tasseRose from '../assets/illus/tasse-rose.svg'
import type { Mode } from '../features/plan/plan.ts'
import { CafCrout } from '../features/splash/cafcrout-splash.js'

// Illustrations de l'équipe DA, animées en CSS (voir ecrans.css, coupé si « réduire les animations »).
// Version nuit : brun et crème échangés (fichiers *-nuit.svg), le rose ne change pas.
type Paire = { jour: string; nuit: string }
export const ILLUSTRATIONS = {
  baguette: { jour: baguette, nuit: baguetteNuit },
  sandwich: { jour: sandwich, nuit: sandwichNuit },
  tasseBrune: { jour: tasseBrune, nuit: tasseBruneNuit },
  tasseRose: { jour: tasseRose, nuit: tasseRoseNuit },
  // Bière : noire sur fond clair, beige sur fond brun
  biere: { jour: biereNoire, nuit: biereBeige },
} satisfies Record<string, Paire>

// Bière rose (carte Bières de l'accueil, fond brun) et « trinque ! » en version claire (tiroir crème)
export const ILLUSTRATIONS_FIXES = { biereRose, trinqueClair }

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

// Écran de lancement : animation de l'équipe DA (src/features/splash), jouée une fois.
// Un tap la passe. Avec « réduire les animations » : l'image finale pendant 1 s.
const FIN_SPLASH_S = 6.55
const FONDU_MS = 400

export function Splash({ fini }: { fini: () => void }) {
  const scene = useRef<HTMLDivElement>(null)
  const [sortie, setSortie] = useState(false)

  const terminer = useCallback(() => {
    setSortie(true)
    setTimeout(fini, FONDU_MS)
  }, [fini])

  useEffect(() => {
    const el = scene.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerHTML = CafCrout.frame(5.85)
      const t = setTimeout(terminer, 1000)
      return () => clearTimeout(t)
    }
    let image = 0
    let debut = 0
    const jouer = (maintenant: number) => {
      debut ||= maintenant
      const t = (maintenant - debut) / 1000
      el.innerHTML = CafCrout.frame(Math.min(t, FIN_SPLASH_S))
      if (t < FIN_SPLASH_S) image = requestAnimationFrame(jouer)
      else terminer()
    }
    image = requestAnimationFrame(jouer)
    return () => cancelAnimationFrame(image)
  }, [terminer])

  return (
    <div
      className={`splash${sortie ? ' splash--sortie' : ''}`}
      role="img"
      aria-label="Caf’croûte : le sandwich plonge dans le café"
      onClick={terminer}
    >
      <div ref={scene} className="splash__scene" />
      <p className="splash__passer" aria-hidden="true">
        Touche pour passer
      </p>
    </div>
  )
}

const CHARGEMENTS: Record<Mode, { illus: Paire[]; texte: string }> = {
  cafe: { illus: [ILLUSTRATIONS.tasseRose], texte: 'On cherche ton café…' },
  manger: { illus: [ILLUSTRATIONS.sandwich], texte: 'On cherche de quoi manger…' },
  les_deux: { illus: [ILLUSTRATIONS.tasseBrune, ILLUSTRATIONS.baguette], texte: 'On assemble ta pause…' },
  biere: { illus: [ILLUSTRATIONS.biere], texte: 'On cherche ta bière…' },
}

// Micro-chargement avant les idées
export function Chargement({ mode }: { mode: Mode }) {
  const { illus, texte } = CHARGEMENTS[mode]
  return (
    <main className="ecran chargement" role="status">
      <div className="chargement__illus">
        {illus.map((paire, i) => (
          <Illustration key={paire.jour} paire={paire} className="chargement__illu anim-balance" delai={i * 0.25} />
        ))}
      </div>
      <p className="chargement__texte">{texte}</p>
    </main>
  )
}
