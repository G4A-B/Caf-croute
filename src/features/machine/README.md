# src/features/machine

Affichage de l'état de la machine à café de l'école.

- Source : `src/data/machine.json` (un signalement daté par ligne, on n'efface jamais).
- `etatMachineActuel()` (dans `src/data/index.ts`) renvoie le dernier signalement, ou « inconnu » s'il a plus de 2 h.
- Afficher toujours l'heure du signalement (« en panne, signalé à 12 h 10 »).

Pas de saisie dans l'app : un changement d'état passe par un commit (voir `CONTENU.md`).
