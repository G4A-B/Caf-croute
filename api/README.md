# api

Fonctions serveur Vercel. Chaque fichier devient une route : `api/notify.ts` répond sur `/api/notify`.

- `subscribe.ts` : enregistre un abonnement aux notifications dans Upstash.
- `_lib/` : code partagé (Upstash, web-push). Le préfixe « _ » empêche Vercel d'en faire des routes.
- `notify.ts` : appelé par le webhook Vercel après un déploiement de production (squelette, envoi à brancher).
- `machine.ts` : état partagé de la machine à café (GET / POST), stocké dans Upstash, et notification « la machine remarche ».

Les secrets sont lus dans `process.env` (variables Vercel, jamais de préfixe `VITE_`). Le flux complet est décrit dans `src/features/notifications/README.md`.
