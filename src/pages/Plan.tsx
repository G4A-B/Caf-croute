import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Chargement, Illustration, ILLUSTRATIONS, ILLUSTRATIONS_FIXES } from '../components/Illustrations.tsx'
import { IconeBiere, IconeMarche, IconeRepere, IconeRetour } from '../components/Icones.tsx'
import { DUREE_TIROIR_MS, Tiroir } from '../components/Tiroir.tsx'
import { PictoSandwich, PictoTasse } from '../components/Pictos.tsx'
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

type PropsCarte = {
  proposition: Proposition
  numero: number
  total: number
  partir: () => void
  voirPlus: () => void
}

// Nombre d'articles de la liste qui tiennent entièrement dans la carte
function useArticlesVisibles(total: number) {
  const zone = useRef<HTMLDivElement>(null)
  const [visibles, setVisibles] = useState(total)

  useLayoutEffect(() => {
    const el = zone.current
    if (!el) return
    const mesurer = () => {
      const bas = el.getBoundingClientRect().bottom
      const lignes = [...el.querySelectorAll('li')]
      setVisibles(lignes.filter((li) => li.getBoundingClientRect().bottom <= bas + 1).length)
    }
    mesurer()
    const observateur = new ResizeObserver(mesurer)
    observateur.observe(el)
    return () => observateur.disconnect()
  }, [total])

  return { zone, visibles }
}

function CartePlan({ proposition, numero, total, partir, voirPlus }: PropsCarte) {
  const lieuPrincipal = (proposition.manger ?? proposition.cafe ?? proposition.biere)!.lieu
  const deuxLieux = !!proposition.cafe && !!proposition.manger && proposition.cafe.lieu.id !== proposition.manger.lieu.id
  const { zone, visibles } = useArticlesVisibles(proposition.autres.length)
  const caches = proposition.autres.length - visibles

  return (
    <article className="carte-plan" aria-roledescription="carte" aria-label={`Idée ${numero} sur ${total}`}>
      <p className="carte-plan__type">{deuxLieux ? 'Deux adresses' : TYPES_LIEU[lieuPrincipal.type]}</p>
      <h2 className="carte-plan__lieu">
        {deuxLieux ? `${proposition.manger!.lieu.nom} + ${proposition.cafe!.lieu.nom}` : lieuPrincipal.nom}
      </h2>
      <ul className="plan__lignes">
        {proposition.manger && (
          <Ligne choix={proposition.manger} icone={<PictoSandwich hauteur={20} />} avecLieu={deuxLieux} />
        )}
        {proposition.cafe && <Ligne choix={proposition.cafe} icone={<PictoTasse hauteur={24} />} avecLieu={deuxLieux} />}
        {proposition.biere && <Ligne choix={proposition.biere} icone={<IconeBiere taille={28} />} avecLieu={false} />}
      </ul>

      {proposition.autres.length > 0 && (
        <div className="carte-plan__autres" ref={zone}>
          <p className="carte-plan__sous-titre">Aussi dans ton budget</p>
          <ul>
            {proposition.autres.map((c, i) => (
              <li key={c.releve.id} className={i >= visibles ? 'plan__cache' : undefined} aria-hidden={i >= visibles}>
                <span>{c.releve.article}</span>
                <span className="plan__prix">{formaterPrix(c.releve.prix_centimes)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="carte-plan__bas">
        {caches > 0 && (
          <button type="button" className="bouton-voir-plus" onClick={voirPlus}>
            Voir plus ({caches})
          </button>
        )}
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

// Illustration du tiroir selon le parcours (bière : « trinque ! », version claire pour le fond crème)
const ILLUSTRATION_TIROIR: Record<Exclude<Mode, 'biere'>, keyof typeof ILLUSTRATIONS> = {
  cafe: 'tasseRose',
  manger: 'sandwich',
  les_deux: 'baguette',
}

function ContenuDepart({ mode, proposition }: { mode: Mode; proposition: Proposition }) {
  const lieux = [proposition.manger, proposition.cafe, proposition.biere]
    .filter((c): c is Choix => !!c)
    .map((c) => c.lieu)
    .filter((l, i, liste) => liste.findIndex((x) => x.id === l.id) === i)

  return (
    <>
      <div className="tiroir__illu">
        {mode === 'biere' ? (
          <img src={ILLUSTRATIONS_FIXES.trinqueClair} alt="" className="plan__illu anim-balance" />
        ) : (
          <Illustration paire={ILLUSTRATIONS[ILLUSTRATION_TIROIR[mode]]} className="plan__illu anim-marche" />
        )}
      </div>
      <h2 className="tiroir__titre" id="titre-tiroir">
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
      <div className="tiroir__action">
        <a className="bouton-principal bouton-lien" href={lienGoogleMaps(lieux)} target="_blank" rel="noopener noreferrer">
          <IconeRepere /> Ouvrir dans Google Maps
        </a>
      </div>
    </>
  )
}

// Tiroir « Voir plus » : tout ce que le lieu propose dans le budget
function ContenuListe({ proposition, partir }: { proposition: Proposition; partir: () => void }) {
  const principal = (proposition.manger ?? proposition.cafe ?? proposition.biere)!
  const articles = [principal, ...proposition.autres]
  return (
    <>
      <h2 className="tiroir__titre" id="titre-tiroir">
        {principal.lieu.nom}
      </h2>
      <ul className="tiroir__liste">
        {articles.map((c) => (
          <li key={c.releve.id}>
            <span>
              {c.releve.article}
              {c.releve.contenance_cl && ` · ${c.releve.contenance_cl} cl`}
            </span>
            <span className="plan__prix">{formaterPrix(c.releve.prix_centimes)}</span>
          </li>
        ))}
      </ul>
      <div className="tiroir__action">
        <button type="button" className="bouton-principal" onClick={partir}>
          C’est parti
        </button>
      </div>
    </>
  )
}

type Props = { mode: Mode; budget: number; retour: () => void }

export default function Plan({ mode, budget, retour }: Props) {
  const liste = useMemo(() => propositions(mode, budget), [mode, budget])
  const [index, setIndex] = useState(0)
  const [tiroir, setTiroir] = useState<'depart' | 'liste' | null>(null)
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
      setTiroir(null)
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
        {/* Masqué à l'écran, annoncé par les lecteurs d'écran quand on change de carte */}
        <p className="visuellement-cache" aria-live="polite">
          Idée {index + 1} sur {liste.length} · budget {formaterPrix(budget)}
        </p>
        <h1 className="grand-titre">Tes idées</h1>
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
              setTiroir('depart')
            }}
            voirPlus={() => {
              setIndex(i)
              setTiroir('liste')
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

      {tiroir && (
        <Tiroir titreId="titre-tiroir" fermeture={fermeture} fermer={fermerTiroir}>
          {tiroir === 'depart' ? (
            <ContenuDepart mode={mode} proposition={proposition} />
          ) : (
            <ContenuListe proposition={proposition} partir={() => setTiroir('depart')} />
          )}
        </Tiroir>
      )}
    </main>
  )
}
