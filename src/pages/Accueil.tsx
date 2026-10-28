import logo from '../assets/logo.svg'
import { ILLUSTRATIONS_FIXES } from '../components/Illustrations.tsx'
import { IconeFleche, IconeLune, IconeSoleil } from '../components/Icones.tsx'
import { PictoSandwich, PictoTasse } from '../components/Pictos.tsx'
import CarteMachine from '../features/machine/CarteMachine.tsx'
import type { Moment } from '../features/moment/moment.ts'
import { MINUTES_MAX, nombreDeLieux, type Mode } from '../features/plan/plan.ts'

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? 's' : ''}`
}

type Props = { moment: Moment; basculer: () => void; choisir: (mode: Mode) => void }

export default function Accueil({ moment, basculer, choisir }: Props) {
  const nuit = moment === 'nuit'

  return (
    <main className="ecran accueil">
      <header className="entete">
        <img src={logo} alt="Caf’croûte" className="entete__logo" width={74} height={56} />
        <button
          type="button"
          className="pastille"
          onClick={basculer}
          aria-label={nuit ? 'Mode nuit, passer en mode jour' : 'Mode jour, passer en mode nuit'}
        >
          {nuit ? <IconeLune /> : <IconeSoleil />}
          {nuit ? 'Mode nuit' : 'Mode jour'}
        </button>
      </header>

      <h1 className="grand-titre">{nuit ? 'Tu bois quoi ce soir ?' : 'Tu as envie de quoi ?'}</h1>

      {nuit ? (
        <div className="choix">
          <button type="button" className="carte-choix carte-choix--biere" onClick={() => choisir('biere')}>
            <span className="carte-choix__haut">
              <img src={ILLUSTRATIONS_FIXES.biereRose} alt="" className="carte-choix__illu" />
              <span className="rond-fleche">
                <IconeFleche />
              </span>
            </span>
            <span className="carte-choix__titre">Bières</span>
            <span className="carte-choix__detail">
              {nombreDeLieux('biere') > 0
                ? `${pluriel(nombreDeLieux('biere'), 'bar')} à ${MINUTES_MAX} min`
                : 'Les prix arrivent bientôt'}
            </span>
          </button>
        </div>
      ) : (
        <div className="choix">
          <button type="button" className="carte-choix carte-choix--cafe" onClick={() => choisir('cafe')}>
            <span className="carte-choix__haut">
              <PictoTasse hauteur={40} clair />
              <span className="rond-fleche rond-fleche--clair">
                <IconeFleche />
              </span>
            </span>
            <span className="carte-choix__titre">Café</span>
            <span className="carte-choix__detail">
              {pluriel(nombreDeLieux('cafe'), 'adresse')} à {MINUTES_MAX} min
            </span>
          </button>

          <button type="button" className="carte-choix carte-choix--manger" onClick={() => choisir('manger')}>
            <span className="carte-choix__haut">
              <PictoSandwich hauteur={30} />
              <span className="rond-fleche">
                <IconeFleche />
              </span>
            </span>
            <span className="carte-choix__titre">À manger</span>
            <span className="carte-choix__detail">
              {pluriel(nombreDeLieux('manger'), 'adresse')} à {MINUTES_MAX} min
            </span>
          </button>

          <button type="button" className="carte-choix carte-choix--deux" onClick={() => choisir('les_deux')}>
            <span className="carte-choix__etiquette">Le plus choisi</span>
            <span className="carte-choix__titre">Les deux</span>
            <span className="carte-choix__detail">
              Café + à manger · {pluriel(nombreDeLieux('les_deux'), 'idée')}
            </span>
            <span className="carte-choix__icones">
              <PictoSandwich hauteur={18} />
              <PictoTasse hauteur={24} />
              <span className="rond-fleche">
                <IconeFleche />
              </span>
            </span>
          </button>
        </div>
      )}

      {!nuit && <CarteMachine />}
    </main>
  )
}
