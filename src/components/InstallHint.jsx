import { useEffect, useState } from 'react'
import './InstallHint.css'

const DISMISS_KEY = 'tv_install_dismissed'
const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent || '')

/* A gentle, dismissible "add to home screen" nudge. Uses the native install
   prompt on Android/desktop; shows the Share-sheet tip on iOS (which has none). */
export default function InstallHint() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) || isStandalone()) return
    } catch {
      return
    }
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    let t
    if (isIOS()) t = setTimeout(() => setShow(true), 1800)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      clearTimeout(t)
    }
  }, [])

  if (!show) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setShow(false)
  }
  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice.catch(() => {})
    dismiss()
  }

  return (
    <div className="install-hint">
      {deferred ? (
        <>
          <span className="install-text">Add TinyVoice to the home screen?</span>
          <button className="install-btn" onClick={install}>
            Install
          </button>
        </>
      ) : (
        <span className="install-text">
          Tip: tap <b>Share</b> → <b>Add to Home Screen</b> for the full app.
        </span>
      )}
      <button className="install-x" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
