# src/data

Toutes les données de l'app, versionnées dans le dépôt. Pas de base de données.

| Fichier | Contenu |
| --- | --- |
| `lieux.json` | les lieux autour de l'école (id, nom, type, minutes à pied) |
| `releves.json` | les relevés de prix datés (un relevé par ligne, on n'écrase jamais) |
| `machine.json` | les signalements de la machine à café de l'école |
| `types.ts` | types TypeScript et valeurs autorisées |
| `index.ts` | lecture des données : `prixActuels()`, `etatMachineActuel()`, `lieuParId()` |

Les fichiers JSON sont vérifiés avant chaque build par `scripts/verifier-donnees.ts`. Comment les remplir : `CONTENU.md` à la racine.

Les données marquées EXEMPLE sont à remplacer par de vrais relevés.
