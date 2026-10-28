import { useCallback, useEffect, useState } from 'react'
import type { EtatMachine, EtatMachineActuel } from '../../data/types.ts'
import { IconeCloche } from '../../components/Icones.tsx'
import { notificationsActivees, notificationsPossibles, sAbonner } from '../notifications/abonnement.ts'
import { lireEtatMachine, signalerMachine, VERROU_MS, type EtatPartage } from './machine.ts'

// L'état est relu régulièrement : un signalement fait sur un téléphone apparaît sur les autres
const RAFRAICHISSEMENT_MS = 20_000

const TEXTES: Record<EtatMachineActuel['etat'], { titre: string; classe: string }> = {
  marche: { titre: 'Elle marche', classe: 'carte-machine--marche' },
  en_panne: { titre: 'En panne', classe: 'carte-machine--panne' },
  inconnu: { titre: 'État inconnu', classe: 'carte-machine--inconnu' },
}

function heure(date: string | number): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(date)).replace(':', ' h ')
}

function depuis(date: string | null): string {
  return date ? `Signalé à ${heure(date)}` : 'Personne ne l’a encore signalée.'
}

export default function CarteMachine() {
  const [partage, setPartage] = useState<EtatPartage | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  const charger = useCallback(() => lireEtatMachine().then(setPartage), [])

  useEffect(() => {
    void charger()
    const minuterie = setInterval(() => {
      setMaintenant(Date.now())
      if (document.visibilityState === 'visible') void charger()
    }, RAFRAICHISSEMENT_MS)
    // Rafraîchit aussi dès qu'on revient sur l'app
    const auRetour = () => {
      if (document.visibilityState !== 'visible') return
      setMaintenant(Date.now())
      void charger()
    }
    document.addEventListener('visibilitychange', auRetour)
    return () => {
      clearInterval(minuterie)
      document.removeEventListener('visibilitychange', auRetour)
    }
  }, [charger])

  // Débloque les boutons pile à la fin du verrou, sans attendre le prochain rafraîchissement
  const verrouJusqua = partage?.verrouJusqua ?? null
  useEffect(() => {
    if (!verrouJusqua || verrouJusqua <= Date.now()) return
    const t = setTimeout(() => {
      setMaintenant(Date.now())
      void charger()
    }, verrouJusqua - Date.now() + 500)
    return () => clearTimeout(t)
  }, [verrouJusqua, charger])

  const verrouille = verrouJusqua !== null && verrouJusqua > maintenant

  async function signaler(nouvel: EtatMachine) {
    setEnCours(true)
    const resultat = await signalerMachine(nouvel)
    if (resultat.ok) {
      setPartage(resultat.partage)
      setMessage(null)
    } else if (resultat.raison === 'verrouille') {
      setPartage(resultat.partage)
      setMessage(null)
    } else if (resultat.raison === 'pas_encore_partage') {
      setPartage({ etat: { etat: nouvel, depuis: new Date().toISOString() }, verrouJusqua: Date.now() + VERROU_MS })
      setMessage(null)
    } else {
      setMessage('Le signalement n’est pas passé, réessaie dans un instant.')
    }
    setMaintenant(Date.now())
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

  const etat = partage?.etat
  const texte = TEXTES[etat?.etat ?? 'inconnu']

  const cloche = notificationsPossibles() && notificationsActivees()

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
        {/* Pendant le verrou : l'état et l'heure où il redevient modifiable, rien d'autre */}
        {verrouille ? (
          <p className="carte-machine__depuis">Modifiable à partir de {heure(verrouJusqua)}</p>
        ) : (
          etat && <p className="carte-machine__depuis">{depuis(etat.depuis)}</p>
        )}
      </div>

      {cloche && (
        <button
          type="button"
          className="carte-machine__cloche"
          onClick={() => void prevenir()}
          aria-label="Me prévenir quand elle remarche"
          title="Me prévenir quand elle remarche"
        >
          <IconeCloche />
        </button>
      )}

      {!verrouille && (
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
      )}

      {!verrouille && (
        <p className="carte-machine__message" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
