import { useEffect, useRef, type ReactNode } from 'react'
import { IconeCroix } from './Icones.tsx'

// Durée des animations d'entrée et de sortie (voir .tiroir dans ecrans.css)
export const DUREE_TIROIR_MS = 260

type Props = {
  titreId: string
  fermeture: boolean
  fermer: () => void
  children: ReactNode
}

// Tiroir qui monte du bas, le contenu reste visible derrière un voile.
// Se ferme avec la croix, un tap sur le voile ou la touche Échap.
export function Tiroir({ titreId, fermeture, fermer, children }: Props) {
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
        <button type="button" className="bouton-fermer" onClick={fermer} aria-label="Fermer, revenir aux idées">
          <IconeCroix />
        </button>
        <span className="tiroir__poignee" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
