# Guide des équipes contenu

Vous relevez les prix sur le terrain, puis vous les ajoutez dans les fichiers de `src/data/`. Chaque ajout publié sur `main` part en ligne au déploiement suivant.

## Sur le terrain : quoi noter

Pour chaque article :

| Information | Exemple | Remarque |
| --- | --- | --- |
| Lieu | Boulangerie Martin | nom affiché dans l'app (60 caractères max) |
| Type de lieu | boulangerie | `boulangerie`, `cafe_a_emporter`, `supermarche`, `machine_ecole`, `autre` |
| Minutes à pied | 4 | depuis l'**entrée de l'école**, à pas normal, aller simple |
| Article | Sandwich jambon beurre | tel qu'affiché sur place (80 caractères max) |
| Catégorie | a_manger | `a_manger`, `cafe`, `autre` |
| Prix | 4,50 € | à noter en centimes : 450 |
| Date et heure | 28/10/2026 à 12 h 15 | à noter au format `2026-10-28T12:15:00+01:00` |

Notez aussi le nom de votre équipe (`releve_par`).

Pour la machine à café de l'école : l'état (`en_panne` ou `marche`) et l'heure.

## Les fichiers

### Un nouveau lieu : `src/data/lieux.json`

```json
{
  "id": "boulangerie-martin",
  "nom": "Boulangerie Martin",
  "type": "boulangerie",
  "minutes_a_pied": 4
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
  "releve_par": "Équipe contenu 1"
}
```

- `id` : le numéro suivant le dernier du fichier (`r-0007`, `r-0008`...).
- `lieu_id` : l'`id` d'un lieu qui existe dans `lieux.json`.
- Le prix a changé ? **N'effacez pas l'ancien relevé** : ajoutez-en un nouveau avec la nouvelle date. L'app prend toujours le plus récent.

### La machine à café : `src/data/machine.json`

```json
{
  "id": "m-0003",
  "etat": "en_panne",
  "date": "2026-10-28T12:10:00+01:00"
}
```

Ajoutez une ligne à chaque constat. Un état de plus de 2 h s'affiche « inconnu ».

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
- dates valides, pas dans le futur.

## Données d'exemple

Tout ce qui contient « EXEMPLE » est fictif. Remplacez-le par de vrais relevés, puis supprimez les exemples (c'est le seul cas où l'on efface).
