# scripts

Scripts lancés par Node (TypeScript exécuté directement, Node 24).

- `verifier-donnees.ts` : vérifie `src/data/*.json`. Lancé automatiquement avant `npm run build` (script `prebuild`), donc avant chaque déploiement Vercel. À la main : `npm run verifier-donnees`.

Ce qui est vérifié : ids uniques, champs connus et obligatoires, `lieu_id` existant, valeurs autorisées, prix entre 20 et 2000 centimes, longueurs de texte, dates valides et pas dans le futur.
