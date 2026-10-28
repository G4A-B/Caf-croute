# src/features/machine

Affichage de l'état de la machine à café de l'école.

- `CarteMachine.tsx` : carte de l'accueil. Affiche l'état et l'heure du signalement, deux boutons « Elle marche » / « En panne », et « Me prévenir quand elle remarche » si les notifications sont activées.
- `machine.ts` : lit et signale l'état via `/api/machine` (état partagé, Upstash). Sans serveur (dev local, Upstash pas encore branché), lecture de `src/data/machine.json` et signalement gardé sur le téléphone seulement.
- `etatMachineActuel()` (dans `src/data/index.ts`) renvoie le dernier signalement, ou « inconnu » s'il a plus de 2 h.
- `api/machine.ts` : on ajoute chaque signalement (jamais d'écrasement), doublon ignoré s'il répète le même état en moins de 2 min. « Elle marche » juste après « En panne » déclenche la notification (anti-rebond 30 min).
