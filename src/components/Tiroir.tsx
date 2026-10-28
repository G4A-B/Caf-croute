import { useEffect, useRef, type ReactNode } from 'react'
import { IconeCroix } from './Icones.tsx'

// Durée des animations d'entrée et de sortie (voir .tiroir dans ecrans.css)
export const DUREE_TIROIR_MS = 260

type Props = {
  titreId: string
  fermeture: boolean
  fermer: () => void
  libelleFermer?: string
  children: ReactNode
}

// Tiroir qui monte du bas, le contenu reste visible derrière un voile.
// Se ferme avec la croix, un tap sur le voile ou la touche Échap.
export function Tiroir({ titreId, fermeture, fermer, libelleFermer = 'Fermer, revenir aux idées', children }: Props) {
  const tiroir = useRef<HTMLDivElement>(null)

  useEffect(() => {
    tiroir.current?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    document.addEventListener('keydown', echap)
    return () => document.removeEventListener('keydown', echap)
  }, [fermer])

  return (
    <div className={`tiroir-scene${fermeture ? ' tiroir-scene--fermeture' : ''}`}>
      <div className="tiroir-voile" onClick={fermer} aria-hidden="true" />
      <div ref={tiroir} className="tiroir" role="dialog" aria-modal="true" aria-labelledby={titreId} tabIndex={-1}>
        {/* En-tête : poignée au centre, croix à droite (défile avec le contenu) */}
        <div className="tiroir__tete">
          <span className="tiroir__poignee" aria-hidden="true" />
          <button type="button" className="bouton-fermer" onClick={fermer} aria-label={libelleFermer}>
            <IconeCroix />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
