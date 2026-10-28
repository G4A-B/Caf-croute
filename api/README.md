# api

Fonctions serveur Vercel. Chaque fichier devient une route : `api/notify.ts` répond sur `/api/notify`.

- `subscribe.ts` : reçoit un abonnement aux notifications (squelette, stockage à brancher).
- `notify.ts` : appelé par le webhook Vercel après un déploiement de production (squelette, envoi à brancher).

Les secrets sont lus dans `process.env` (variables Vercel, jamais de préfixe `VITE_`). Le flux complet est décrit dans `src/features/notifications/README.md`.
