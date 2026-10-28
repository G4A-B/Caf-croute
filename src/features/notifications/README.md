# src/features/notifications

Notifications push. Tout est prêt côté app, rien n'est envoyé pour l'instant.

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
                                   web-push (à brancher) ───► abonné·es « machine »

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
| `../../../api/subscribe.ts` | squelette : valide la demande |
| `../../../api/notify.ts` | squelette : vérifie la signature du webhook (bons plans) |
| `../../../api/machine.ts` | état partagé de la machine, décide la notification « remarche » |

## Règles

- Anti-rebond : au plus une notification machine toutes les 30 min.
- Pas de notification machine si le signalement « marche » a plus de 2 h.
- Premier passage de `notify` : on mémorise les relevés existants sans rien envoyer.
- Bons plans : une seule notification par abonné·e et par déploiement (le moins cher, « et N autres »).
- Abonnement qui répond 404 ou 410 à l'envoi : supprimé.
- iPhone : les notifications ne marchent que si l'app est installée sur l'écran d'accueil (iOS 16.4 ou plus).

## Pour brancher l'envoi (étape notifications)

1. Générer les clés VAPID : `npx web-push generate-vapid-keys`. Publique dans `VITE_VAPID_PUBLIC_KEY`, privée dans `VAPID_PRIVATE_KEY` (Vercel uniquement).
2. Vercel > Storage > Marketplace > Upstash Redis : crée `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`.
3. `npm install web-push @upstash/redis` puis compléter les `TODO` de `api/subscribe.ts` et `api/notify.ts`.
4. Vercel > Settings > Webhooks : événement `deployment.succeeded`, URL `https://<site>/api/notify`. Copier le secret du webhook dans `NOTIFY_SECRET`.
5. Placer `<BoutonNotifications />` dans l'écran voulu.
