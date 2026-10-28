# CLAUDE.md

Projet « Caf'croûte » (dépôt Caf-croute, nom provisoire de départ : La Pause) : atelier « une app en une journée », octobre 2026. Démonstration pédagogique en direct : avancer étape par étape, commits courts et lisibles, messages en français (`feat:`, `fix:`, `docs:`, `chore:`). Le design (DA, parcours, contenu) avance en parallèle.

## Principes du produit

- L'app répond par des cartes d'idées à faire glisser (une carte par lieu, le plus proche d'abord), avec « Autre idée » pour passer à la suivante. Chaque carte montre l'article principal et les autres articles du lieu dans le budget. Pas de plan de quartier, pas de liste à filtrer. Les distances s'expriment en minutes à pied depuis l'entrée de l'école.
- Accueil : trois entrées (Café, À manger, Les deux), puis le budget, puis les cartes d'idées. Une carte sur l'accueil montre l'état de la machine à café de l'école.
- Pas de compte. Les lieux et les prix vivent dans des fichiers JSON du dépôt (`src/data/`) : les équipes contenu les ajoutent par commit ou pull request, chaque push sur `main` les publie. Un prix `a_verifier` n'est pas proposé.
- Seule saisie dans l'app : n'importe qui signale l'état de la machine (« Elle marche » / « En panne ») depuis la carte de l'accueil. L'état est partagé en direct via `api/machine.ts` (Upstash).
- Chaque relevé ou signalement est daté : on ajoute, on n'écrase jamais, et l'app utilise le plus récent. Un état de la machine vieux de plus de 2 h s'affiche « inconnu ».
- Notifications push prévues : (1) la machine remarche, (2) un nouveau bon plan sous un prix choisi par l'abonné·e. La notification machine part quand quelqu'un signale « Elle marche » après « En panne » (anti-rebond 30 min) ; celle des bons plans part au déploiement de production qui les contient.

## Contraintes techniques

- Vite + React + TypeScript, CSS natif avec les variables de `src/styles/tokens.css`. DA : couleurs du logo (brun #442d29, crème #fffae5, rose #f4b6c5), police Montserrat hébergée dans `public/fonts`. Le logo (`src/assets/logo.svg`) utilise aussi Memimas Pro, déjà vectorisée. Pas de framework CSS.
- Pas de base de données pour le contenu. Seul stockage serveur : Upstash Redis (API REST appelée avec `fetch`), pour l'état de la machine, les abonnements push et l'état des envois.
- Pas de carte, pas de géolocalisation, pas de bibliothèque de cartographie.
- Pas d'authentification, pas de routeur. Aucune dépendance nouvelle sans raison claire (prévues : `web-push`, `@upstash/redis` à l'étape notifications).
- PWA : vite-plugin-pwa en `injectManifest`, service worker écrit à la main dans `src/sw.ts`. La permission de notification se demande après un geste, jamais au chargement.
- Aucun secret dans le code ni dans le dépôt. Les clés secrètes ne portent jamais le préfixe `VITE_`.
- Jamais de tiret cadratin dans les textes de l'interface ni dans la doc.
- Interface en français, mobile d'abord, zone tactile de 44 px minimum, marges safe-area, contraste AA.
- Palette : aucune couleur orange, corail ou terracotta.

## Repères

- Données : `src/data/*.json`, types et valeurs autorisées dans `src/data/types.ts`, lecture dans `src/data/index.ts`. École : 13 rue Poullain Duparc (LISAA Rennes), minutes à pied comptées depuis l'entrée. Bilan des relevés : `docs/`.
- Écrans : `src/App.tsx` (état + historique, pas de routeur), `src/pages/` (Accueil, Budget, Plan), calcul dans `src/features/plan/plan.ts`.
- `npm run build` lance d'abord `scripts/verifier-donnees.ts` : une donnée invalide bloque le déploiement. Garder ce script aligné avec `types.ts`.
- Notifications : `src/features/notifications/README.md` décrit le flux complet.
- Vercel : site statique (`dist`) + fonctions dans `api/`. Push sur `main` = production, pull request = preview.
- Avant de pousser : `npm run build` sans erreur, `npm run preview` fonctionnel.
