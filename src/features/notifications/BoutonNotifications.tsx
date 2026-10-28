import { useState } from 'react'
import { notificationsActivees, notificationsPossibles, sAbonner, type ResultatAbonnement } from './abonnement.ts'
import type { Sujet } from './types.ts'

const MESSAGES: Record<ResultatAbonnement, string> = {
  ok: "C'est noté, tu seras prévenu·e.",
  non_supporte: "Ton navigateur ne gère pas les notifications. Sur iPhone, installe d'abord l'app sur l'écran d'accueil.",
  pas_encore_active: 'Les notifications arrivent bientôt.',
  refuse: 'Notifications refusées. Tu peux changer ça dans les réglages du navigateur.',
  erreur: "L'abonnement n'a pas marché, réessaie plus tard.",
}

// Prêt mais pas encore affiché : sera placé dans l'écran par l'équipe parcours
export default function BoutonNotifications() {
  const [machine, setMachine] = useState(true)
  const [bonsPlans, setBonsPlans] = useState(false)
  const [seuilEuros, setSeuilEuros] = useState('3')
  const [message, setMessage] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  if (!notificationsPossibles() || !notificationsActivees()) return null

  async function valider() {
    const sujets: Sujet[] = [...(machine ? ['machine' as const] : []), ...(bonsPlans ? ['bons_plans' as const] : [])]
    if (sujets.length === 0) return setMessage('Choisis au moins un sujet.')
    const seuil = bonsPlans ? Math.round(Number(seuilEuros.replace(',', '.')) * 100) : null
    if (seuil !== null && !(seuil >= 20 && seuil <= 2000)) return setMessage('Choisis un prix entre 0,20 € et 20 €.')
    setEnCours(true)
    setMessage(MESSAGES[await sAbonner(sujets, seuil)])
    setEnCours(false)
  }

  return (
    <form
      className="notifications"
      onSubmit={(e) => {
        e.preventDefault()
        void valider()
      }}
    >
      <fieldset>
        <legend>Me prévenir quand</legend>
        <label>
          <input type="checkbox" checked={machine} onChange={(e) => setMachine(e.target.checked)} />
          la machine à café remarche
        </label>
        <label>
          <input type="checkbox" checked={bonsPlans} onChange={(e) => setBonsPlans(e.target.checked)} />
          un bon plan coûte moins de
          <input
            type="text"
            inputMode="decimal"
            value={seuilEuros}
            onChange={(e) => setSeuilEuros(e.target.value)}
            disabled={!bonsPlans}
            aria-label="Prix maximum en euros"
            size={4}
          />
          €
        </label>
      </fieldset>
      <button type="submit" disabled={enCours}>
        Activer les notifications
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
