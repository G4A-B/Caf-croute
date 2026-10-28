import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chargement, Illustration, ILLUSTRATIONS } from '../components/Illustrations.tsx'
import {
  IconeBiere,
  IconeCroix,
  IconeMarche,
  IconeRepere,
  IconeRetour,
  IconeSandwich,
  IconeTasse,
} from '../components/Icones.tsx'
import { lienGoogleMaps } from '../lib/itineraire.ts'
import { formaterMinutes, formaterPrix } from '../lib/format.ts'
import { propositions, type Choix, type Mode, type Proposition } from '../features/plan/plan.ts'

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
        <span className="plan__nom-article">
          {choix.releve.article}
          {choix.releve.contenance_cl && ` · ${choix.releve.contenance_cl} cl`}
        </span>
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

type PropsCarte = { proposition: Proposition; numero: number; total: number; partir: () => void }

function CartePlan({ proposition, numero, total, partir }: PropsCarte) {
  const lieuPrincipal = (proposition.manger ?? proposition.cafe ?? proposition.biere)!.lieu
  const deuxLieux = !!proposition.cafe && !!proposition.manger && proposition.cafe.lieu.id !== proposition.manger.lieu.id

  return (
    <article className="carte-plan" aria-roledescription="carte" aria-label={`Idée ${numero} sur ${total}`}>
      <p className="carte-plan__type">{deuxLieux ? 'Deux adresses' : TYPES_LIEU[lieuPrincipal.type]}</p>
      <h2 className="carte-plan__lieu">
        {deuxLieux ? `${proposition.manger!.lieu.nom} + ${proposition.cafe!.lieu.nom}` : lieuPrincipal.nom}
      </h2>
      <ul className="plan__lignes">
        {proposition.manger && (
          <Ligne choix={proposition.manger} icone={<IconeSandwich taille={28} />} avecLieu={deuxLieux} />
        )}
        {proposition.cafe && <Ligne choix={proposition.cafe} icone={<IconeTasse taille={28} />} avecLieu={deuxLieux} />}
        {proposition.biere && <Ligne choix={proposition.biere} icone={<IconeBiere taille={28} />} avecLieu={false} />}
      </ul>

      {proposition.autres.length > 0 && (
        <div className="carte-plan__autres">
          <p className="carte-plan__sous-titre">Aussi dans ton budget</p>
          <ul>
            {proposition.autres.map((c) => (
              <li key={c.releve.id}>
                <span>{c.releve.article}</span>
                <span className="plan__prix">{formaterPrix(c.releve.prix_centimes)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="carte-plan__bas">
        <p className="carte-plan__pied">
          <span>
            <IconeMarche /> {proposition.minutes_a_pied} min à pied
          </span>
          <span className="carte-plan__total">{formaterPrix(proposition.total_centimes)}</span>
        </p>
        <button type="button" className="bouton-principal" onClick={partir}>
          C’est parti
        </button>
      </div>
    </article>
  )
}

// Tiroir « C'est parti » : monte du bas, les idées restent visibles derrière.
// Se ferme avec la croix, un tap sur le voile ou la touche Échap.
const DUREE_TIROIR_MS = 260

function TiroirDepart({ proposition, fermer }: { proposition: Proposition; fermer: () => void }) {
  const tiroir = useRef<HTMLDivElement>(null)
  const lieux = [proposition.manger, proposition.cafe, proposition.biere]
    .filter((c): c is Choix => !!c)
    .map((c) => c.lieu)
    .filter((l, i, liste) => liste.findIndex((x) => x.id === l.id) === i)

  useEffect(() => {
    tiroir.current?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    document.addEventListener('keydown', echap)
    return () => document.removeEventListener('keydown', echap)
  }, [fermer])

  return (
    <div
      ref={tiroir}
      className="tiroir"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-depart"
      tabIndex={-1}
    >
      <button type="button" className="bouton-fermer" onClick={fermer} aria-label="Fermer, revenir aux idées">
        <IconeCroix />
      </button>
      <span className="tiroir__poignee" aria-hidden="true" />
      <Illustration paire={ILLUSTRATIONS.baguette} className="plan__illu anim-marche" />
      <p className="surtitre">C’est parti</p>
      <h2 className="tiroir__titre" id="titre-depart">
        Vite, t’as {proposition.minutes_a_pied} min pour y aller
      </h2>
      <div className="plan__adresses">
        {lieux.map((l) => (
          <p key={l.id} className="plan__adresse">
            <IconeMarche />
            <span>
              <strong>{l.nom}</strong>, {l.adresse}
            </span>
          </p>
        ))}
      </div>
      <p className="plan__total-final">Total : {formaterPrix(proposition.total_centimes)}</p>
      <a className="bouton-principal bouton-lien" href={lienGoogleMaps(lieux)} target="_blank" rel="noopener noreferrer">
        <IconeRepere /> Ouvrir dans Google Maps
      </a>
    </div>
  )
}

type Props = { mode: Mode; budget: number; retour: () => void }

export default function Plan({ mode, budget, retour }: Props) {
  const liste = useMemo(() => propositions(mode, budget), [mode, budget])
  const [index, setIndex] = useState(0)
  const [parti, setParti] = useState(false)
  const [fermeture, setFermeture] = useState(false)
  const [charge, setCharge] = useState(false)
  const pile = useRef<HTMLDivElement>(null)

  // Micro-chargement : laisse le temps de voir l'illustration avant les idées
  useEffect(() => {
    const t = setTimeout(() => setCharge(true), 900)
    return () => clearTimeout(t)
  }, [])
  const proposition = liste[index]

  // La carte visible est celle qui occupe la pile après le glissement
  function suivreGlissement() {
    const el = pile.current
    if (!el) return
    const largeur = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth
    setIndex(Math.min(liste.length - 1, Math.round(el.scrollLeft / (largeur + 12))))
  }

  function allerA(i: number) {
    const carte = pile.current?.children[i] as HTMLElement | undefined
    carte?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    setIndex(i)
  }

  // Joue l'animation de sortie avant de retirer le tiroir
  const fermerTiroir = useCallback(() => {
    setFermeture(true)
    setTimeout(() => {
      setParti(false)
      setFermeture(false)
    }, DUREE_TIROIR_MS)
  }, [])

  if (!charge) return <Chargement mode={mode} />

  if (!proposition) {
    return (
      <main className="ecran plan">
        <button type="button" className="bouton-retour" onClick={retour}>
          <IconeRetour /> Retour
        </button>
        <h1 className="grand-titre">Rien à {formaterPrix(budget)} autour de l’école</h1>
        <p className="plan__vide">
          {mode === 'biere'
            ? 'Les prix des bières arrivent bientôt. Monte un peu le budget en attendant.'
            : 'Monte un peu le budget : on trouvera bien quelque chose.'}
        </p>
        <button type="button" className="bouton-principal" onClick={retour}>
          Changer de budget
        </button>
      </main>
    )
  }

  return (
    <main className="ecran plan plan--idees">
      <button type="button" className="bouton-retour" onClick={retour}>
        <IconeRetour /> Retour
      </button>

      <div>
        <p className="surtitre" aria-live="polite">
          Idée {index + 1} sur {liste.length} · budget {formaterPrix(budget)}
        </p>
        <h1 className="grand-titre">Tes idées</h1>
        {liste.length > 1 && <p className="plan__astuce">Fais glisser les cartes pour comparer.</p>}
      </div>

      <div className="pile" ref={pile} onScroll={suivreGlissement} aria-label="Idées de pause">
        {liste.map((p, i) => (
          <CartePlan
            key={i}
            proposition={p}
            numero={i + 1}
            total={liste.length}
            partir={() => {
              setIndex(i)
              setParti(true)
            }}
          />
        ))}
      </div>

      {liste.length > 1 && (
        <div className="points" role="group" aria-label="Choisir une idée">
          {liste.map((_, i) => (
            <button
              key={i}
              type="button"
              className="point"
              aria-label={`Idée ${i + 1}`}
              aria-current={i === index}
              onClick={() => allerA(i)}
            />
          ))}
        </div>
      )}

      <div className="plan__actions">
        <button type="button" className="bouton-secondaire" onClick={retour}>
          Modifier mon budget
        </button>
      </div>

      {parti && (
        <div className={`tiroir-scene${fermeture ? ' tiroir-scene--fermeture' : ''}`}>
          <div className="tiroir-voile" onClick={fermerTiroir} aria-hidden="true" />
          <TiroirDepart proposition={proposition} fermer={fermerTiroir} />
        </div>
      )}
    </main>
  )
}
