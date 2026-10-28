import { useEffect, useState } from 'react'
import Accueil from './pages/Accueil.tsx'
import Budget from './pages/Budget.tsx'
import Plan from './pages/Plan.tsx'
import type { Mode } from './features/plan/plan.ts'

// Pas de routeur : l'écran courant vit dans l'état, et dans l'historique pour le bouton retour du téléphone
type Ecran = { nom: 'accueil' } | { nom: 'budget'; mode: Mode } | { nom: 'plan'; mode: Mode; budget: number }

export default function App() {
  const [ecran, setEcran] = useState<Ecran>(() => (history.state as Ecran | null) ?? { nom: 'accueil' })

  useEffect(() => {
    if (!history.state) history.replaceState(ecran, '')
    const auRetour = (e: PopStateEvent) => setEcran((e.state as Ecran | null) ?? { nom: 'accueil' })
    window.addEventListener('popstate', auRetour)
    return () => window.removeEventListener('popstate', auRetour)
  }, [ecran])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  function aller(suivant: Ecran) {
    history.pushState(suivant, '')
    setEcran(suivant)
  }

  function accueil() {
    history.replaceState({ nom: 'accueil' }, '')
    setEcran({ nom: 'accueil' })
  }

  switch (ecran.nom) {
    case 'accueil':
      return <Accueil choisir={(mode) => aller({ nom: 'budget', mode })} />
    case 'budget':
      return (
        <Budget
          mode={ecran.mode}
          retour={() => history.back()}
          valider={(budget) => aller({ nom: 'plan', mode: ecran.mode, budget })}
        />
      )
    case 'plan':
      return <Plan mode={ecran.mode} budget={ecran.budget} retour={() => history.back()} accueil={accueil} />
  }
}
