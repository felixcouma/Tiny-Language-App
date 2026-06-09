import { useRegisterSW } from 'virtual:pwa-register/react'
import './UpdatePrompt.css'

// Re-check for a fresh deploy periodically, so a long-open session updates too.
const CHECK_EVERY_MS = 30 * 60 * 1000

/* The service worker is registered here. With registerType:'autoUpdate' a new
   deploy activates automatically (skipWaiting + clientsClaim), so users no longer
   get stuck on a cached old version. This toast is a gentle fallback. */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => registration.update().catch(() => {}), CHECK_EVERY_MS)
    },
  })

  if (!needRefresh) return null
  return (
    <div className="update-toast">
      <span className="update-text">A new version of TinyVoice is ready.</span>
      <button className="update-btn" onClick={() => updateServiceWorker(true)}>
        Refresh
      </button>
      <button className="update-x" onClick={() => setNeedRefresh(false)} aria-label="Later">
        ×
      </button>
    </div>
  )
}
