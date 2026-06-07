import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Mobile-first app. `base: './'` keeps asset paths relative so the build
// works on any static host (GitHub Pages, Netlify, a subfolder, etc.).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'manifest.webmanifest'],
      manifest: false, // use the existing public/manifest.webmanifest
      workbox: {
        // Precache only the small app shell; images & audio cache lazily at runtime.
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tv-images',
              expiration: { maxEntries: 220, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/sounds/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tv-sounds',
              expiration: { maxEntries: 700, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // expose on LAN so you can open it on a phone/tablet
    port: 5173,
  },
})
