/*
 * Audio manager for TinyVoice Twins.
 *
 * Priority for every item:
 *   1. Play a real recording at  <base>/sounds/<key>.mp3  (drop-in per RealAssetsGuide)
 *   2. If that file isn't there yet, play a short, pleasant Web Audio tone so a
 *      tap is ALWAYS acknowledged. This is a neutral UI chime — it deliberately
 *      does not imitate an animal, honouring the "no synthetic animal sounds" rule.
 *
 * Audio is unlocked by the first user tap (satisfies mobile autoplay policies).
 */

const BASE = import.meta.env.BASE_URL || '/'

let ctx = null
function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Remember which keys have a real file so we don't retry a known-missing 404.
const realFile = new Map() // key -> boolean

let currentEl = null
function stopCurrent() {
  if (currentEl) {
    currentEl.pause()
    currentEl.currentTime = 0
    currentEl = null
  }
}

// A gentle two-note chime; frequency is derived from the key so different
// items feel distinct. Pure sine waves — soft on toddler ears.
function playChime(key = '') {
  const c = audioCtx()
  if (!c) return
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 1000
  // Map into a friendly pentatonic-ish range (C5..C6)
  const base = 523.25 * Math.pow(2, (h % 8) / 12)
  const now = c.currentTime
  ;[base, base * 1.25].forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.12
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.3)
  })
}

/**
 * Play the sound for an item.
 * @param {string} key - matches a file at public/sounds/<key>.mp3
 * @returns {Promise<'file'|'chime'>} which source actually played
 */
export async function playSound(key) {
  stopCurrent()
  if (!key) {
    playChime('')
    return 'chime'
  }
  // Warm up the AudioContext on this user gesture even if we end up using a file.
  audioCtx()

  if (realFile.get(key) === false) {
    playChime(key)
    return 'chime'
  }

  const el = new Audio(`${BASE}sounds/${key}.mp3`)
  el.preload = 'auto'
  currentEl = el
  try {
    await el.play()
    realFile.set(key, true)
    return 'file'
  } catch {
    // No real recording yet (404 / unsupported) — fall back to the chime.
    realFile.set(key, false)
    if (currentEl === el) currentEl = null
    playChime(key)
    return 'chime'
  }
}

// A short celebratory C–E–G arpeggio (blueprint's celebration chime spec).
export function playCelebration() {
  const c = audioCtx()
  if (!c) return
  const now = c.currentTime
  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.1
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.4)
  })
}
