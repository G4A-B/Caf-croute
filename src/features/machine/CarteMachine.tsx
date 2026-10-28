import { useEffect, useState } from 'react'
import type { EtatMachine, EtatMachineActuel } from '../../data/types.ts'
import { IconeCloche } from '../../components/Icones.tsx'
import { notificationsActivees, notificationsPossibles, sAbonner } from '../notifications/abonnement.ts'
import { lireEtatMachine, signalerMachine } from './machine.ts'

const TEXTES: Record<EtatMachineActuel['etat'], { titre: string; classe: string }> = {
  marche: { titre: 'Elle marche', classe: 'carte-machine--marche' },
  en_panne: { titre: 'En panne', classe: 'carte-machine--panne' },
  inconnu: { titre: 'État inconnu', classe: 'carte-machine--inconnu' },
}

function depuis(date: string | null): string {
  if (!date) return 'Personne ne l’a encore signalée.'
  const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(date))
  return `Signalé à ${heure.replace(':', ' h ')}`
}

export default function CarteMachine() {
  const [etat, setEtat] = useState<EtatMachineActuel | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    let actif = true
    const charger = () => lireEtatMachine().then((e) => actif && setEtat(e))
    void charger()
    // Rafraîchit quand on revient sur l'app
    const auRetour = () => document.visibilityState === 'visible' && void charger()
    document.addEventListener('visibilitychange', auRetour)
    return () => {
      actif = false
      document.removeEventListener('visibilitychange', auRetour)
    }
  }, [])

  async function signaler(nouvel: EtatMachine) {
    setEnCours(true)
    const resultat = await signalerMachine(nouvel)
    if (resultat.ok) {
      setEtat({ etat: resultat.dernier.etat as EtatMachine, depuis: resultat.dernier.date })
      setMessage('Merci, tout le monde est au courant.')
    } else if (resultat.raison === 'pas_encore_partage') {
      setEtat({ etat: nouvel, depuis: new Date().toISOString() })
      setMessage('Noté sur ton téléphone. Le partage avec les autres arrive bientôt.')
    } else {
      setMessage('Le signalement n’est pas passé, réessaie dans un instant.')
    }
    setEnCours(false)
  }

  async function prevenir() {
    const resultat = await sAbonner(['machine'], null)
    setMessage(
      resultat === 'ok'
        ? 'Tu seras prévenu·e quand elle remarche.'
        : resultat === 'refuse'
          ? 'Notifications refusées dans les réglages du navigateur.'
          : 'Les notifications ne sont pas disponibles ici. Sur iPhone, installe d’abord l’app.',
    )
  }

  const texte = TEXTES[etat?.etat ?? 'inconnu']

  return (
    <section className={`carte-machine ${texte.classe}`} aria-labelledby="titre-machine">
      <div className="carte-machine__tete">
        <p className="surtitre" id="titre-machine">
          Machine à café de l’école
        </p>
        <p className="carte-machine__etat" aria-live="polite">
          <span className="carte-machine__voyant" aria-hidden="true" />
          {etat ? texte.titre : 'Chargement…'}
        </p>
        {etat && <p className="carte-machine__depuis">{depuis(etat.depuis)}</p>}
      </div>

      <div className="carte-machine__actions" role="group" aria-label="Signaler l’état de la machine">
        <button
          type="button"
          className="carte-machine__bouton"
          aria-pressed={etat?.etat === 'marche'}
          disabled={enCours}
          onClick={() => void signaler('marche')}
        >
          Elle marche
        </button>
        <button
          type="button"
          className="carte-machine__bouton"
          aria-pressed={etat?.etat === 'en_panne'}
          disabled={enCours}
          onClick={() => void signaler('en_panne')}
        >
          En panne
        </button>
      </div>

      {notificationsPossibles() && notificationsActivees() && etat?.etat !== 'marche' && (
        <button type="button" className="carte-machine__prevenir" onClick={() => void prevenir()}>
          <IconeCloche /> Me prévenir quand elle remarche
        </button>
      )}

      <p className="carte-machine__message" role="status">
        {message}
      </p>
    </section>
  )
}
