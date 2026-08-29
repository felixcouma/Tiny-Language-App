/*
 * Lock the app to 1× — no accidental pinch / double-tap zoom on phones & tablets.
 *
 * Toddlers routinely pinch the screen mid-play and then can't see the content (now
 * huge or tiny, scrolled off-screen) — a real source of frustration. The app is a
 * single fixed-width column already sized to the screen, so there is nothing to zoom
 * INTO; zoom only ever breaks the layout.
 *
 * The viewport <meta> (maximum-scale=1, user-scalable=no) handles Android/Chrome, but
 * iOS Safari deliberately IGNORES those for accessibility — so we also block the
 * gestures directly here. This is scoped to zoom only: single-finger scrolling, taps,
 * and drags are untouched. Double-tap-to-zoom is already handled by CSS
 * `touch-action: manipulation` (see styles/global.css); this covers pinch.
 */
export function lockZoom() {
  if (typeof document === 'undefined') return
  const prevent = (e) => e.preventDefault()

  // iOS Safari pinch-zoom fires non-standard gesture* events (which ignore both the
  // viewport meta and touch-action). Cancel them to freeze the scale.
  document.addEventListener('gesturestart', prevent, { passive: false })
  document.addEventListener('gesturechange', prevent, { passive: false })
  document.addEventListener('gestureend', prevent, { passive: false })

  // Any two-finger touchmove is a pinch — block it while leaving one-finger scroll alone.
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault()
    },
    { passive: false },
  )

  // Desktop / trackpad: a Ctrl/⌘ + wheel pinch also zooms the page — cancel that too.
  // Plain scrolling (no modifier) is left alone.
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) e.preventDefault()
    },
    { passive: false },
  )
}
