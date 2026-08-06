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
              cacheName: 'tv-images-v3', // bumped: force-purge stale art after the premium re-render
              // ~450 bundled WebP today; headroom so a fully-explored install stays cached.
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/sounds/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tv-sounds-v3', // bumped to force-purge the old (leaked) clips for everyone
              // We ship ~3,000 clips (3 voices × phrases + words + abc + fx) + 13 songs. This
              // caps the cache so a single child's working set (their voice's UI + the songs
              // they play) stays fully offline within a session; least-recently-used entries
              // beyond it evict and re-fetch on next play (graceful → soft chime if offline).
              // Songs dominate the BYTES (~29 MB / 13 files) — a dedicated song cache with its
              // own small cap is a future option if storage pressure shows up on cheap tablets.
              expiration: { maxEntries: 1600, maxAgeSeconds: 60 * 60 * 24 * 90 },
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
