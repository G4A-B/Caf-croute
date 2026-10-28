export const SUJETS = ['machine', 'bons_plans'] as const
export type Sujet = (typeof SUJETS)[number]

// Anti-rebond : au plus une notification machine toutes les 30 min
export const DELAI_MIN_MACHINE_MS = 30 * 60 * 1000

// Ce que le navigateur envoie à /api/subscribe
export type DemandeAbonnement = {
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
  sujets: Sujet[]
  seuil_centimes: number | null
}

// Ce que le serveur gardera (Upstash, clé = endpoint)
export type Abonnement = {
  endpoint: string
  p256dh: string
  auth: string
  sujets: Sujet[]
  seuil_centimes: number | null
  created_at: string
}

// Charge utile lue par src/sw.ts
export type ChargePush = { title: string; body: string; url: string }

// Mémoire du serveur entre deux déploiements
export type EtatNotifications = {
  // null au tout premier passage : on mémorise sans rien envoyer
  relevesConnus: string[] | null
  dernierSignalementMachine: string | null
  dernierEnvoiMachine: number | null
}

export type Envoi = { endpoint: string; charge: ChargePush }
