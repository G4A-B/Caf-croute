import logo from '../assets/logo.svg'
import { IconeFleche, IconeSandwich, IconeTasse } from '../components/Icones.tsx'
import CarteMachine from '../features/machine/CarteMachine.tsx'
import { MINUTES_MAX, nombreDeLieux, type Mode } from '../features/plan/plan.ts'

function surtitreDuJour(maintenant = new Date()): string {
  const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(maintenant)
  const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(maintenant)
  return `${jour} · ${heure.replace(':', ' h ')}`
}

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? 's' : ''}`
}

export default function Accueil({ choisir }: { choisir: (mode: Mode) => void }) {
  return (
    <main className="ecran accueil">
      <header className="entete">
        <img src={logo} alt="Caf’croûte" className="entete__logo" width={74} height={56} />
        <p className="pastille">
          <span className="pastille__point" aria-hidden="true" />
          LISAA · Rennes
        </p>
      </header>

      <div>
        <p className="surtitre">{surtitreDuJour()}</p>
        <h1 className="grand-titre">Tu as envie de quoi ?</h1>
      </div>

      <div className="choix">
        <button type="button" className="carte-choix carte-choix--cafe" onClick={() => choisir('cafe')}>
          <span className="carte-choix__haut">
            <IconeTasse />
            <span className="rond-fleche">
              <IconeFleche />
            </span>
          </span>
          <span className="carte-choix__titre">Café</span>
          <span className="carte-choix__detail">
            {pluriel(nombreDeLieux('cafe'), 'café')} à {MINUTES_MAX} min
          </span>
        </button>

        <button type="button" className="carte-choix carte-choix--manger" onClick={() => choisir('manger')}>
          <span className="carte-choix__haut">
            <IconeSandwich />
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
          <span className="carte-choix__detail">Café + à manger · {pluriel(nombreDeLieux('les_deux'), 'idée')}</span>
          <span className="carte-choix__icones">
            <IconeSandwich taille={36} />
            <IconeTasse taille={36} />
            <span className="rond-fleche rond-fleche--clair">
              <IconeFleche />
            </span>
          </span>
        </button>
      </div>

      <CarteMachine />
    </main>
  )
}
