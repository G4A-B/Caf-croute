# src/features/machine

Affichage de l'état de la machine à café de l'école.

- `CarteMachine.tsx` : carte de l'accueil. Hors verrou : l'état, l'heure du signalement et deux boutons « Elle marche » / « En panne ». Pendant le verrou : seulement l'état et « Modifiable à partir de … ». Une petite cloche en haut à droite abonne à « la machine remarche » (si les notifications sont activées).
- `machine.ts` : lit et signale l'état via `/api/machine` (état partagé, Upstash). Sans serveur (dev local, Upstash pas encore branché), lecture de `src/data/machine.json` et signalement gardé sur le téléphone seulement.
- `etatMachineActuel()` (dans `src/data/index.ts`) renvoie le dernier signalement, ou « inconnu » s'il a plus de 2 h.
- `api/machine.ts` : on ajoute chaque signalement (jamais d'écrasement). Après un signalement, l'état est verrouillé 5 min pour tout le monde : verrou atomique `SET machine:verrou NX PX` dans Upstash, réponse 409 si quelqu'un essaie pendant ce temps.
- La carte relit l'état toutes les 20 s et au retour sur l'app. « Elle marche » juste après « En panne » déclenche la notification (anti-rebond 30 min).
