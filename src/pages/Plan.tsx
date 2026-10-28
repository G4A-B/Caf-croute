import { useMemo, useState } from 'react'
import { IconeMarche, IconeRetour, IconeSandwich, IconeTasse } from '../components/Icones.tsx'
import { formaterMinutes, formaterPrix } from '../lib/format.ts'
import { propositions, type Choix, type Mode } from '../features/plan/plan.ts'

const TYPES_LIEU: Record<string, string> = {
  boulangerie: 'Boulangerie',
  coffee_shop: 'Coffee shop',
  bar: 'Bar',
  restauration_rapide: 'Street food',
  supermarche: 'Supérette',
  epicerie: 'Épicerie',
  machine_ecole: 'École',
  autre: 'Adresse',
}

function Ligne({ choix, icone, avecLieu }: { choix: Choix; icone: React.ReactNode; avecLieu: boolean }) {
  return (
    <li className="plan__ligne">
      <span className="plan__icone">{icone}</span>
      <span className="plan__article">
        <span className="plan__nom-article">{choix.releve.article}</span>
        {avecLieu && (
          <span className="plan__lieu">
            {choix.lieu.nom} · {formaterMinutes(choix.lieu.minutes_a_pied)}
          </span>
        )}
        {choix.releve.remarque && <span className="plan__remarque">{choix.releve.remarque}</span>}
      </span>
      <span className="plan__prix">{formaterPrix(choix.releve.prix_centimes)}</span>
    </li>
  )
}

type Props = { mode: Mode; budget: number; retour: () => void; accueil: () => void }

export default function Plan({ mode, budget, retour, accueil }: Props) {
  const liste = useMemo(() => propositions(mode, budget), [mode, budget])
  const [index, setIndex] = useState(0)
  const [parti, setParti] = useState(false)
  const proposition = liste[index % Math.max(liste.length, 1)]

  if (!proposition) {
    return (
      <main className="ecran plan">
        <button type="button" className="bouton-retour" onClick={retour}>
          <IconeRetour /> Retour
        </button>
        <h1 className="grand-titre">Rien à {formaterPrix(budget)} autour de l’école</h1>
        <p className="plan__vide">Monte un peu le budget : on trouvera bien quelque chose.</p>
        <button type="button" className="bouton-principal" onClick={retour}>
          Changer de budget
        </button>
      </main>
    )
  }

  const lieuPrincipal = (proposition.manger ?? proposition.cafe)!.lieu
  const deuxLieux = !!proposition.cafe && !!proposition.manger && proposition.cafe.lieu.id !== proposition.manger.lieu.id

  if (parti) {
    return (
      <main className="ecran plan plan--parti">
        <p className="surtitre">C’est parti</p>
        <h1 className="grand-titre">
          Vite, t’as {proposition.minutes_a_pied} min pour y aller
        </h1>
        <div className="plan__adresses">
          {[proposition.manger, proposition.cafe]
            .filter((c, i, l): c is Choix => !!c && l.findIndex((x) => x?.lieu.id === c.lieu.id) === i)
            .map((c) => (
              <p key={c.lieu.id} className="plan__adresse">
                <IconeMarche /> <strong>{c.lieu.nom}</strong>, {c.lieu.adresse}
              </p>
            ))}
        </div>
        <p className="plan__total-final">Total : {formaterPrix(proposition.total_centimes)}</p>
        <button type="button" className="bouton-secondaire" onClick={accueil}>
          Revenir à l’accueil
        </button>
      </main>
    )
  }

  return (
    <main className="ecran plan">
      <button type="button" className="bouton-retour" onClick={retour}>
        <IconeRetour /> Retour
      </button>

      <div>
        <p className="surtitre">
          Idée {(index % liste.length) + 1} sur {liste.length} · budget {formaterPrix(budget)}
        </p>
        <h1 className="grand-titre">Ton plan</h1>
      </div>

      <article className="carte-plan" aria-live="polite">
        <p className="carte-plan__type">
          {deuxLieux ? 'Deux adresses' : TYPES_LIEU[lieuPrincipal.type]}
        </p>
        <h2 className="carte-plan__lieu">
          {deuxLieux ? `${proposition.manger!.lieu.nom} + ${proposition.cafe!.lieu.nom}` : lieuPrincipal.nom}
        </h2>
        <ul className="plan__lignes">
          {proposition.manger && <Ligne choix={proposition.manger} icone={<IconeSandwich taille={28} />} avecLieu={deuxLieux} />}
          {proposition.cafe && <Ligne choix={proposition.cafe} icone={<IconeTasse taille={28} />} avecLieu={deuxLieux} />}
        </ul>
        <p className="carte-plan__pied">
          <span>
            <IconeMarche /> {proposition.minutes_a_pied} min à pied
          </span>
          <span className="carte-plan__total">{formaterPrix(proposition.total_centimes)}</span>
        </p>
      </article>

      <div className="plan__actions">
        <button type="button" className="bouton-principal" onClick={() => setParti(true)}>
          C’est parti
        </button>
        {liste.length > 1 && (
          <button type="button" className="bouton-secondaire" onClick={() => setIndex((i) => i + 1)}>
            Autre idée
          </button>
        )}
      </div>
    </main>
  )
}
