interface ImportMetaEnv {
  // Clé publique VAPID (notifications). Les clés secrètes ne portent jamais le préfixe VITE_.
  readonly VITE_VAPID_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
