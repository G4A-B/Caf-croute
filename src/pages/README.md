# src/pages

Les écrans de l'app. Pas de routeur : `src/App.tsx` garde l'écran courant dans son état et dans l'historique (le bouton retour du téléphone marche).

- `Accueil.tsx` : choix Café / À manger / Les deux, carte machine à café.
- `Budget.tsx` : budget proposé (3 suggestions) ou réglé à la règle.
- `Plan.tsx` : cartes d'idées à faire glisser (une par lieu), « C'est parti », « Modifier mon budget ».

Un écran assemble des composants (`src/components`) et des fonctions métier (`src/features`). Il ne contient pas de calcul.
