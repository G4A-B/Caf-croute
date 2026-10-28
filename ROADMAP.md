# Roadmap

## Étape 0 : socle (fait)

- Vite + React + TypeScript, écran « La Pause »
- PWA installable, service worker avec écouteurs push
- Données JSON d'exemple et vérification au build
- Squelette des notifications, configuration Vercel

## Fait le 28 octobre

- 78 vrais relevés, 18 lieux (`docs/releves-2026-10-28.md`)
- DA du logo, écrans Accueil, Budget, Plan
- Carte machine partagée (`api/machine.ts`, Upstash à brancher)

## Étape 1 : le plan

- Saisie du budget (5 € par défaut) et du temps de pause
- Calcul d'UN plan (à manger + café) dans `src/features/plan`
- Cartes d'idées à faire glisser
- Distances en minutes à pied, pas de carte ni de liste
- Intégration des tokens et maquettes de l'équipe DA

## Étape 2 : le contenu

- Vrais relevés des équipes contenu, suppression des EXEMPLE
- Relecture des pull requests de données
- Date du relevé visible à côté de chaque prix

## Étape 3 : la machine

- État de la machine à café de l'école dans le plan (proposée seulement si elle marche)
- « Inconnu » après 2 h, heure du signalement affichée

## Étape 4 : les notifications

- Clés VAPID, Upstash Redis via le Marketplace Vercel
- `api/subscribe.ts` : enregistrement des abonnements
- `api/notify.ts` : webhook de déploiement, `calculerEnvois()`, envoi avec `web-push`
- Bouton d'abonnement placé dans l'écran
- Tests sur Android (Chrome) et iPhone (app installée)
