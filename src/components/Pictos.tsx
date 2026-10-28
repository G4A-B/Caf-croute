import sandwichClair from '../assets/illus/picto-sandwich-clair.svg'
import sandwich from '../assets/illus/picto-sandwich.svg'
import tasseClair from '../assets/illus/picto-tasse-clair.svg'
import tasse from '../assets/illus/picto-tasse.svg'

// Pictos de l'équipe DA. « clair » : brun et crème échangés, pour les fonds bruns.
type Props = { hauteur?: number; clair?: boolean }

export function PictoTasse({ hauteur = 44, clair = false }: Props) {
  return <img src={clair ? tasseClair : tasse} alt="" className="picto" style={{ height: hauteur }} />
}

export function PictoSandwich({ hauteur = 44, clair = false }: Props) {
  return <img src={clair ? sandwichClair : sandwich} alt="" className="picto" style={{ height: hauteur }} />
}
