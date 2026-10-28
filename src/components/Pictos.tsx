import sandwichClair from '../assets/illus/picto-sandwich-clair.svg'
import sandwich from '../assets/illus/picto-sandwich.svg'
import tasseClair from '../assets/illus/picto-tasse-clair.svg'
import tasse from '../assets/illus/picto-tasse.svg'

// Pictos de l'équipe DA. Version claire (brun et crème échangés) pour les fonds foncés.
// clair = 'auto' : les deux versions, le CSS montre celle qui va avec le fond (voir .illu-jour / .illu-nuit).
type Props = { hauteur?: number; clair?: boolean | 'auto' }

function Picto({ fonce, claire, hauteur = 44, clair = false }: Props & { fonce: string; claire: string }) {
  const style = { height: hauteur }
  if (clair === 'auto') {
    return (
      <>
        <img src={fonce} alt="" className="picto illu-jour" style={style} />
        <img src={claire} alt="" className="picto illu-nuit" style={style} />
      </>
    )
  }
  return <img src={clair ? claire : fonce} alt="" className="picto" style={style} />
}

export function PictoTasse(props: Props) {
  return <Picto {...props} fonce={tasse} claire={tasseClair} />
}

export function PictoSandwich(props: Props) {
  return <Picto {...props} fonce={sandwich} claire={sandwichClair} />
}
