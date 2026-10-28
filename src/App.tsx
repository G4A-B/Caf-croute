import { useCallback, useEffect, useRef, useState } from 'react'
import { Splash } from './components/Illustrations.tsx'
import Accueil from './pages/Accueil.tsx'
import Budget from './pages/Budget.tsx'
import Plan from './pages/Plan.tsx'
import { animationsReduites, momentDe, type Moment } from './features/moment/moment.ts'
import type { Mode } from './features/plan/plan.ts'

// Pas de routeur : l'écran courant vit dans l'état, et dans l'historique pour le bouton retour du téléphone
type Ecran = { nom: 'accueil' } | { nom: 'budget'; mode: Mode } | { nom: 'plan'; mode: Mode; budget: number }

// Retournement de carte : demi-tour jusqu'à la tranche, changement de mode, puis l'autre moitié
type Retournement = '' | 'retournement-aller' | 'retournement-retour'
const DEMI_TOUR_MS = 320

const COULEUR_BARRE: Record<Moment, string> = { jour: '#fffae5', nuit: '#442d29' }

export default function App() {
  const [ecran, setEcran] = useState<Ecran>(() => (history.state as Ecran | null) ?? { nom: 'accueil' })
  // Splash une fois par session : un rechargement ne le rejoue pas
  const [splash, setSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('splash-vu')
    } catch {
      return true
    }
  })
  const finSplash = useCallback(() => {
    try {
      sessionStorage.setItem('splash-vu', '1')
    } catch {
      // stockage indisponible (navigation privée) : le splash reviendra, ce n'est pas grave
    }
    setSplash(false)
  }, [])
  const [moment, setMoment] = useState<Moment>(() => momentDe())
  const [retournement, setRetournement] = useState<Retournement>('')

  useEffect(() => {
    if (!history.state) history.replaceState(ecran, '')
    const auRetour = (e: PopStateEvent) => setEcran((e.state as Ecran | null) ?? { nom: 'accueil' })
    window.addEventListener('popstate', auRetour)
    return () => window.removeEventListener('popstate', auRetour)
  }, [ecran])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  // Couleurs du mode sur toute la page, barre du navigateur comprise
  useEffect(() => {
    document.documentElement.dataset.moment = moment
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COULEUR_BARRE[moment])
  }, [moment])

  const changerDeMoment = useCallback((suivant: Moment) => {
    const appliquer = () => {
      setMoment(suivant)
      history.replaceState({ nom: 'accueil' }, '')
      setEcran({ nom: 'accueil' })
    }
    if (animationsReduites()) return appliquer()
    setRetournement('retournement-aller')
    setTimeout(() => {
      appliquer()
      setRetournement('retournement-retour')
      setTimeout(() => setRetournement(''), DEMI_TOUR_MS)
    }, DEMI_TOUR_MS)
  }, [])

  // Passage automatique au début et à la fin de la nuit (voir moment.ts).
  // On ne bascule qu'au changement d'heure : un choix fait à la main avec la pastille reste.
  const dernierAuto = useRef(momentDe())
  useEffect(() => {
    const minute = setInterval(() => {
      const attendu = momentDe()
      if (attendu !== dernierAuto.current) {
        dernierAuto.current = attendu
        changerDeMoment(attendu)
      }
    }, 60_000)
    return () => clearInterval(minute)
  }, [changerDeMoment])

  function aller(suivant: Ecran) {
    history.pushState(suivant, '')
    setEcran(suivant)
  }

  return (
    <div className="scene">
      <div className={`face ${retournement}`}>{ecranCourant()}</div>
      {splash && <Splash fini={finSplash} />}
    </div>
  )

  function ecranCourant() {
    switch (ecran.nom) {
      case 'accueil':
        return (
          <Accueil
            moment={moment}
            basculer={() => changerDeMoment(moment === 'jour' ? 'nuit' : 'jour')}
            choisir={(mode) => aller({ nom: 'budget', mode })}
          />
        )
      case 'budget':
        return (
          <Budget
            mode={ecran.mode}
            retour={() => history.back()}
            valider={(budget) => aller({ nom: 'plan', mode: ecran.mode, budget })}
          />
        )
      case 'plan':
        return <Plan mode={ecran.mode} budget={ecran.budget} retour={() => history.back()} />
    }
  }
}
