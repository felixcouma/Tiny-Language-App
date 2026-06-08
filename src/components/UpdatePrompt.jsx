import { useRegisterSW } from 'virtual:pwa-register/react'
import './UpdatePrompt.css'

/* Shows a gentle "new version ready" toast when a fresh deploy is cached, so
   updates apply on tap instead of lagging behind the service-worker cache. */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

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
