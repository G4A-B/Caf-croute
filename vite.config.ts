import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Service worker écrit à la main (src/sw.ts) pour gérer les notifications push
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: {
        // Pas de HTML dans le précache : la page passe par le réseau d'abord (voir sw.ts)
        globPatterns: ['**/*.{js,css,svg,png,ico,webmanifest}'],
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'La Pause',
        short_name: 'Pause',
        description: 'Quoi manger et où prendre un café autour de l\'école, selon ton budget et ton temps de pause.',
        lang: 'fr',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: '#f7f7f5',
        background_color: '#f7f7f5',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
