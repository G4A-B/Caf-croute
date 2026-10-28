# Guide des équipes contenu

Vous relevez les prix sur le terrain, puis vous les ajoutez dans les fichiers de `src/data/`. Chaque ajout publié sur `main` part en ligne au déploiement suivant.

## Sur le terrain : quoi noter

Pour chaque article :

| Information | Exemple | Remarque |
| --- | --- | --- |
| Lieu | Boulangerie Martin | nom affiché dans l'app (60 caractères max) |
| Type de lieu | boulangerie | `boulangerie`, `coffee_shop`, `bar`, `restauration_rapide`, `supermarche`, `epicerie`, `machine_ecole`, `autre` |
| Adresse | 13 rue Vasselot | facultatif mais utile |
| Minutes à pied | 4 | depuis l'**entrée de l'école**, à pas normal, aller simple |
| Article | Sandwich jambon beurre | tel qu'affiché sur place (80 caractères max) |
| Catégorie | a_manger | `a_manger`, `cafe`, `biere`, `autre` |
| Prix | 4,50 € | à noter en centimes : 450 |
| Date et heure | 28/10/2026 à 12 h 15 | à noter au format `2026-10-28T12:15:00+01:00` |

Pour un café, notez aussi son type (`type_cafe`) : `expresso`, `double`, `allonge`, `creme`, `au_lait`, `specialite` ou `glace`. Pour une bière, notez la contenance en cl (`contenance_cl` : 25, 33, 50...). Si le prix change entre comptoir et salle, faites deux relevés avec `consommation` : `comptoir`, `salle` ou `emporter`.

Notez aussi d'où vient le prix (`source`) : `photo:<nom du fichier>`, `note:<auteur>`, `benchmark:<site>` ou `terrain`, et le nom de votre équipe (`releve_par`). Un prix pas sûr (lu de loin, trouvé sur le web) prend `"a_verifier": true` : l'app ne le propose pas tant qu'il n'est pas confirmé.

L'état de la machine à café se signale dans l'app (carte sur l'écran d'accueil), pas dans les fichiers.

## Les fichiers

### Un nouveau lieu : `src/data/lieux.json`

```json
{
  "id": "boulangerie-martin",
  "nom": "Boulangerie Martin",
  "type": "boulangerie",
  "minutes_a_pied": 4,
  "adresse": "13 rue Vasselot"
}
```

L'`id` est court, en minuscules, avec des tirets, et ne change plus jamais.

### Un relevé de prix : `src/data/releves.json`

```json
{
  "id": "r-0007",
  "lieu_id": "boulangerie-martin",
  "article": "Sandwich jambon beurre",
  "categorie": "a_manger",
  "prix_centimes": 450,
  "date": "2026-10-28T12:15:00+01:00",
  "source": "terrain",
  "releve_par": "Équipe contenu 1"
}
```

- `id` : le numéro suivant le dernier du fichier (`r-0007`, `r-0008`...).
- `lieu_id` : l'`id` d'un lieu qui existe dans `lieux.json`.
- Le prix a changé ? **N'effacez pas l'ancien relevé** : ajoutez-en un nouveau avec la nouvelle date. L'app prend toujours le plus récent.

### Exemple de café

```json
{
  "id": "r-0080",
  "lieu_id": "gang",
  "article": "Flat white",
  "categorie": "cafe",
  "prix_centimes": 420,
  "date": "2026-10-28T12:55:00+01:00",
  "source": "photo:IMG_1234.jpeg",
  "type_cafe": "au_lait",
  "releve_par": "Équipe contenu 2"
}
```

## Comment ajouter (sans rien installer)

1. Sur GitHub, ouvrez le fichier (`src/data/releves.json` par exemple) et cliquez sur le crayon.
2. Ajoutez votre bloc à la fin de la liste. Attention aux virgules : une virgule entre deux blocs `}`, `{`, pas de virgule après le dernier.
3. En bas, choisissez **Create a new branch** et **Propose changes**, puis ouvrez la pull request.
4. Vercel construit une preview. Si la vérification échoue, le détail est dans les logs du déploiement :
   ```
   src/data/releves.json, ligne 57 (r-0007) : prix_centimes doit être un entier entre 20 et 2000 (reçu 4.5).
   ```
   Corrigez la ligne indiquée dans la même branche.
5. Quand la preview est verte, fusionnez : c'est en ligne.

## Ce qui est vérifié automatiquement

- ids uniques, champs obligatoires présents, pas de champ inconnu (faute de frappe) ;
- `lieu_id` existant, type et catégorie parmi les valeurs autorisées ;
- prix entier entre 20 et 2000 centimes (0,20 € à 20 €) ;
- minutes à pied entre 0 et 60 ;
- dates valides, pas dans le futur ;
- source au bon format, `type_cafe` présent pour chaque café.

## Relevés existants

Le bilan du 28 octobre 2026 (ce qui est intégré, écarté, à identifier) est dans `docs/releves-2026-10-28.md`.
