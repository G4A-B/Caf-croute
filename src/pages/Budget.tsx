import { useId, useState } from 'react'
import { IconeRetour } from '../components/Icones.tsx'
import { formaterPrix } from '../lib/format.ts'
import { BUDGETS, type Mode } from '../features/plan/plan.ts'

const QUESTIONS: Record<Mode, { titre: string; bouton: string }> = {
  cafe: { titre: 'Ton budget pour un café ?', bouton: 'Voir les cafés' },
  manger: { titre: 'Ton budget pour manger ?', bouton: 'Voir les idées' },
  les_deux: { titre: 'Ton budget pour la pause ?', bouton: 'Voir les idées' },
  biere: { titre: 'Ton budget pour une bière ?', bouton: 'Voir les bières' },
}

type Props = { mode: Mode; retour: () => void; valider: (centimes: number) => void }

export default function Budget({ mode, retour, valider }: Props) {
  const { min, max, suggestions } = BUDGETS[mode]
  const [centimes, setCentimes] = useState(suggestions[1].centimes)
  const idRegle = useId()
  // La suggestion reste choisie de son prix jusqu'au prix de la suivante (exclu)
  const active = suggestions.findLast((s) => s.centimes <= centimes)

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
            aria-checked={active === s}
            className="suggestion"
            onClick={() => setCentimes(s.centimes)}
          >
            <span className="suggestion__prix">{formaterPrix(s.centimes).replace(',00', '')}</span>
            <span className="suggestion__libelle">{s.libelle}</span>
          </button>
        ))}
      </div>

      <div className="regle">
        {/* Masqué à l'écran, lu par les lecteurs d'écran */}
        <label className="visuellement-cache" htmlFor={idRegle}>
          Ou règle ton budget au centime près
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
            style={{ '--remplissage': `${((centimes - min) / (max - min)) * 100}%` } as React.CSSProperties}
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
