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
      // Auto-apply new deploys (skipWaiting + clientsClaim below) so users don't get
      // stuck on a cached old version — a plain refresh wasn't enough with 'prompt'.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'manifest.webmanifest'],
      manifest: false, // use the existing public/manifest.webmanifest
      workbox: {
        // Precache only the small app shell; images & audio cache lazily at runtime.
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: 'index.html',
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // StaleWhileRevalidate (not CacheFirst): clips/images still load instantly
        // from cache, but a fresh copy is fetched in the background, so when we
        // re-record a clip at the SAME url the cache self-heals on the next play.
        // The -v2 cache names force a one-time purge of the old (leaked) clips that
        // CacheFirst had pinned. Bumping the suffix again is the lever if ever needed.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/images/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tv-images-v2',
              expiration: { maxEntries: 240, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/sounds/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tv-sounds-v3', // bumped to force-purge the old (leaked) clips for everyone
              expiration: { maxEntries: 900, maxAgeSeconds: 60 * 60 * 24 * 90 },
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
