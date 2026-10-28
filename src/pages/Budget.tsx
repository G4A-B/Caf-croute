import { useId, useState } from 'react'
import { IconeRetour } from '../components/Icones.tsx'
import { formaterPrix } from '../lib/format.ts'
import { BUDGETS, type Mode } from '../features/plan/plan.ts'

const QUESTIONS: Record<Mode, { titre: string; bouton: string }> = {
  cafe: { titre: 'Ton budget pour un café ?', bouton: 'Voir les cafés' },
  manger: { titre: 'Ton budget pour manger ?', bouton: 'Voir les idées' },
  les_deux: { titre: 'Ton budget pour la pause ?', bouton: 'Voir les idées' },
}

type Props = { mode: Mode; retour: () => void; valider: (centimes: number) => void }

export default function Budget({ mode, retour, valider }: Props) {
  const { min, max, suggestions } = BUDGETS[mode]
  const [centimes, setCentimes] = useState(suggestions[1].centimes)
  const idRegle = useId()

  return (
    <main className="ecran budget">
      <button type="button" className="bouton-retour" onClick={retour}>
        <IconeRetour /> Retour
      </button>

      <h1 className="grand-titre budget__titre">{QUESTIONS[mode].titre}</h1>

      <div className="budget__suggestions" role="radiogroup" aria-label="Budgets proposés">
        {suggestions.map((s) => (
          <button
            key={s.centimes}
            type="button"
            role="radio"
            aria-checked={centimes === s.centimes}
            className="suggestion"
            onClick={() => setCentimes(s.centimes)}
          >
            <span className="suggestion__prix">{formaterPrix(s.centimes).replace(',00', '')}</span>
            <span className="suggestion__libelle">{s.libelle}</span>
          </button>
        ))}
      </div>

      <div className="regle">
        <label className="surtitre" htmlFor={idRegle}>
          Ou fais glisser la règle
        </label>
        <div className="regle__ligne">
          <input
            id={idRegle}
            type="range"
            min={min}
            max={max}
            step={10}
            value={centimes}
            onChange={(e) => setCentimes(Number(e.target.value))}
            aria-valuetext={formaterPrix(centimes)}
          />
          <output htmlFor={idRegle} className="regle__valeur">
            {formaterPrix(centimes)}
          </output>
        </div>
      </div>

      <button type="button" className="bouton-principal" onClick={() => valider(centimes)}>
        {QUESTIONS[mode].bouton}
      </button>
    </main>
  )
}
