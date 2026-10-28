# src/features/plan

Calcul du plan de la pause : UN plan (à manger + café) selon le budget et le temps de pause.

Entrées prévues :
- budget en centimes (ex. 500 pour 5 €) ;
- durée de la pause en minutes ;
- les prix actuels (`prixActuels()` dans `src/data/index.ts`) et l'état de la machine (`etatMachineActuel()`).

Règles prévues :
- total manger + café inférieur ou égal au budget ;
- aller-retour à pied (2 x `minutes_a_pied`) + temps pour manger inférieur à la durée de la pause ;
- machine de l'école proposée seulement si son état est « marche » ;
- une carte par lieu, à faire glisser ; « Modifier mon budget » ramène au choix du budget.

Pas de liste de résultats, pas de carte. Fonctions pures, testables sans interface.
