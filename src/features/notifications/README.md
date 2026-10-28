# src/features/notifications

Notifications push. « La machine remarche » est branchée de bout en bout. « Bon plan » est prêt côté calcul, l'envoi reste à brancher.

## Deux sujets

1. **La machine remarche** : quelqu'un touche « Elle marche » sur la carte de l'accueil juste après un « En panne ». Décidé dans `api/machine.ts`, au moment du signalement.
2. **Bon plan** : un nouveau relevé (à manger ou café) coûte moins que le seuil choisi par l'abonné·e.

## Flux prévu

```
Navigateur                         Vercel                              Upstash Redis
──────────                         ──────                              ─────────────
clic « Activer les notifications »
Notification.requestPermission()
pushManager.subscribe(clé VAPID)
POST /api/subscribe  ───────────►  api/subscribe.ts  ───────────────►  abonnement:<endpoint>

clic « Elle marche » (carte machine)
POST /api/machine  ─────────────►  api/machine.ts  ─────────────────►  machine:signalements
                                   remarche après panne ? anti-rebond 30 min
                                   web-push ───► abonné·es « machine »

Équipe contenu : commit sur main
                                   déploiement de production
                                   webhook deployment.succeeded
                                   POST /api/notify (signé)
                                   api/notify.ts  ◄─── lit ──────────  abonnements + état
                                   calculerEnvois() (calcul.ts)
                                   web-push ───► service push du navigateur
                                                 └─► src/sw.ts : événement push
                                                     showNotification({ title, body, url })
                                   api/notify.ts  ─── écrit ────────►  nouvel état
```

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `BoutonNotifications.tsx` | formulaire : sujets, seuil en euros, bouton. Pas encore placé dans un écran. Masqué si `VITE_VAPID_PUBLIC_KEY` est vide. |
| `abonnement.ts` | demande la permission (après un clic, jamais au chargement), crée l'abonnement, l'envoie à `/api/subscribe` |
| `calcul.ts` | `calculerEnvois()` : décide qui prévenir, fonction pure |
| `types.ts` | types partagés, délai anti-rebond |
| `../../sw.ts` | reçoit le push, affiche la notification, ouvre `url` au clic |
| `../../../api/subscribe.ts` | valide la demande, enregistre l'abonnement dans Upstash |
| `../../../api/notify.ts` | squelette : vérifie la signature du webhook (bons plans) |
| `../../../api/machine.ts` | état partagé de la machine, envoie « la machine remarche » |
| `../../../api/_lib/push.ts` | abonnements (`abonnement:<id>`, `abonnes:<sujet>`) et envoi `web-push` |
| `../../../api/_lib/redis.ts` | appel à Upstash par son API REST |

## Règles

- Anti-rebond : au plus une notification machine toutes les 30 min.
- Pas de notification machine si le signalement « marche » a plus de 2 h.
- Premier passage de `notify` : on mémorise les relevés existants sans rien envoyer.
- Bons plans : une seule notification par abonné·e et par déploiement (le moins cher, « et N autres »).
- Abonnement qui répond 404 ou 410 à l'envoi : supprimé.
- iPhone : les notifications ne marchent que si l'app est installée sur l'écran d'accueil (iOS 16.4 ou plus).

## Mise en service

1. Clés VAPID : générées dans `.env` (jamais commité). Pour en refaire : `npx web-push generate-vapid-keys`.
2. Vercel > Settings > Environment Variables, pour Production et Preview :
   - `VITE_VAPID_PUBLIC_KEY` : la clé publique (lue au build par l'app, et par le serveur)
   - `VAPID_PRIVATE_KEY` : la clé privée, en « Sensitive »
3. Redéployer : la clé publique est intégrée au moment du build.
4. La cloche apparaît alors en haut à droite de la carte machine.

## Reste à faire : bons plans

- `api/notify.ts` : lire l'état dans Upstash, appeler `calculerEnvois()`, envoyer avec `envoyer()` de `api/_lib/push.ts`.
- Déclencheur : webhook Vercel `deployment.succeeded` vers `/api/notify` (secret dans `NOTIFY_SECRET`).
- Placer `<BoutonNotifications />` (choix du seuil) dans un écran.
