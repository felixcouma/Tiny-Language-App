import { useEffect } from 'react'

/**
 * Keep the screen awake while the app is open.
 *
 * Toddlers watch & listen without constantly tapping, so the phone/tablet
 * would otherwise dim and lock mid-session. The Screen Wake Lock API holds the
 * display on; the browser auto-releases it whenever the tab is hidden, so we
 * re-acquire on every return to the foreground. Best-effort: unsupported
 * browsers (older iOS Safari) simply no-op.
 */
export function useWakeLock() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let lock = null
    let cancelled = false

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return
      try {
        lock = await navigator.wakeLock.request('screen')
        // If the system drops it (e.g. low battery), forget our handle so the
        // next foreground event can try again.
        lock.addEventListener('release', () => { lock = null }, { once: true })
      } catch {
        /* denied / unsupported — leave the screen on its normal timeout */
      }
    }

    const onVisible = () => { if (document.visibilityState === 'visible') acquire() }

    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      if (lock) lock.release().catch(() => {})
    }
  }, [])
}
