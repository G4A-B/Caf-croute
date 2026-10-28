# Caf'croûte

App pour la pause déj et café des étudiant·es autour de l'école, avec un petit budget.

> Quand la pause commence et que j'ai 5 € en poche, je veux qu'on me dise quoi manger et où prendre un café, pour ne pas passer ma pause à comparer.

L'app répond par **un seul plan** (à manger + café) selon le budget et le temps de pause, avec un bouton « autre idée ». Pas de carte, pas de liste à filtrer. Les distances sont en minutes à pied depuis l'entrée de l'école.

Projet de l'atelier « une app en une journée », octobre 2026.

**Site en ligne :** https://caf-croute.vercel.app

## Commandes

```bash
npm install            # installer les dépendances
npm run dev            # serveur de développement (http://localhost:5173)
npm run build          # vérifier les données puis construire dans dist/
npm run preview        # servir dist/ en local (http://localhost:4173), service worker compris
npm run verifier-donnees   # vérifier seulement src/data/*.json
```

Node 24 requis.

## Workflow

- **Push sur `main`** : déploiement de production sur Vercel.
- **Pull request** : déploiement de preview avec sa propre URL, à vérifier avant de fusionner.
- Commits courts, messages en français (`feat:`, `fix:`, `docs:`, `chore:`).

## Les données

Pas de base de données. Les lieux, les prix et l'état de la machine à café sont des fichiers JSON dans `src/data/`. Les équipes contenu les relèvent sur le terrain puis les ajoutent par commit ou pull request : chaque push sur `main` publie les nouvelles données.

Avant chaque build, `scripts/verifier-donnees.ts` contrôle ces fichiers. Une erreur (prix impossible, lieu inconnu, faute de frappe dans un champ) bloque le déploiement et indique la ligne à corriger.

Guide pour les équipes contenu : [CONTENU.md](CONTENU.md).

## Arborescence

```
api/                      fonctions serveur Vercel (notifications)
scripts/                  vérification des données au build
src/
  components/             composants d'interface
  data/                   données JSON, types, lecture
  features/plan/          calcul du plan selon budget et temps
  features/machine/       état de la machine à café de l'école
  features/notifications/ abonnement et calcul des notifications push
  lib/                    utilitaires (format des prix...)
  pages/                  écrans
  styles/                 tokens.css (DA du logo), base.css, ecrans.css
  sw.ts                   service worker (cache, notifications push)
public/                   icônes et favicon
```

Chaque dossier a son README.

## Machine à café

La carte de l'accueil montre l'état de la machine de l'école. N'importe qui peut le changer (« Elle marche » / « En panne ») et tout le monde voit le changement. Il faut Upstash Redis : sur Vercel, Storage > Marketplace > Upstash Redis, relié au projet (crée `KV_REST_API_URL` et `KV_REST_API_TOKEN`, ou `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` : les deux noms marchent), puis redéployer. Sans Upstash, le signalement reste sur le téléphone.

## PWA et notifications

L'app s'installe sur l'écran d'accueil (manifest + service worker). Les notifications push sont prêtes côté app mais pas encore envoyées : voir [src/features/notifications/README.md](src/features/notifications/README.md).

**Sur iPhone, les notifications ne marchent que si l'app est installée sur l'écran d'accueil** (Safari > Partager > Sur l'écran d'accueil, iOS 16.4 ou plus).

Vérifier l'installabilité : `npm run build && npm run preview`, puis Chrome DevTools > Application > Manifest (pas d'erreur, icônes visibles) et Service workers (`sw.js` actif).

## Variables d'environnement

Voir `.env.example`. Aucune n'est nécessaire à l'étape 0. Les clés secrètes ne portent jamais le préfixe `VITE_` et ne sont jamais commitées.

## Suite

[ROADMAP.md](ROADMAP.md)
