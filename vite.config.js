import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mobile-first app. `base: './'` keeps asset paths relative so the build
// works on any static host (GitHub Pages, Netlify, a subfolder, etc.).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // expose on LAN so you can open it on a phone/tablet
    port: 5173,
  },
})
