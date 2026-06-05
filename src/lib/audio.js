/*
 * Audio for TinyVoice Twins.
 *
 * This is a speech-development app, so children must HEAR the language. With no
 * recorded asset files yet, we speak words and phrases with the browser's
 * SpeechSynthesis engine (offline, on-device, no assets). Priority per item:
 *
 *   1. A real recording at  <base>/sounds/<key>.mp3   (drop in real animal moos etc.)
 *   2. Spoken audio of the word / teaching phrase via SpeechSynthesis
 *   3. A soft chime (only for pure tap feedback)
 *
 * Everything is unlocked by the first tap (mobile autoplay policy).
 */

const BASE = import.meta.env.BASE_URL || '/'

/* ---------------- Web Audio (chimes / celebration) ---------------- */
let ctx = null
function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function playChime(seed = '') {
  const c = audioCtx()
  if (!c) return
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000
  const base = 523.25 * Math.pow(2, (h % 8) / 12)
  const now = c.currentTime
  ;[base, base * 1.25].forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.1
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.28)
  })
}

export function playCelebration() {
  const c = audioCtx()
  if (!c) return
  const now = c.currentTime
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.09
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.42)
  })
}

/* ---------------- Speech (the spoken words) ---------------- */
let preferredVoice = null
function pickVoice() {
  if (!('speechSynthesis' in window)) return null
  if (preferredVoice) return preferredVoice
  const voices = window.speechSynthesis.getVoices() || []
  // Prefer a warm English voice; fall back to any English, then any voice.
  const byName = (re) => voices.find((v) => re.test(v.name))
  preferredVoice =
    byName(/Samantha|Karen|Moira|Tessa|Google US English|Female/i) ||
    voices.find((v) => /^en[-_]/i.test(v.lang)) ||
    voices[0] ||
    null
  return preferredVoice
}
if ('speechSynthesis' in window) {
  // Voices load asynchronously on some browsers.
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = null
    pickVoice()
  }
}

export function speak(text, { rate = 0.92, pitch = 1.08 } = {}) {
  if (!text || !('speechSynthesis' in window)) return false
  try {
    window.speechSynthesis.cancel() // stop anything already talking
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = (v && v.lang) || 'en-US'
    u.rate = rate
    u.pitch = pitch
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

/* ---------------- Combined item playback ---------------- */
const realFile = new Map() // sound key -> boolean (has a real recording)
let currentEl = null

/**
 * Play an item's audio: real recording if available, otherwise speak `say`/word.
 * @param {{sound?:string, say?:string, word?:string}} item
 */
export async function playItem(item) {
  if (!item) return
  audioCtx() // unlock on this gesture
  const key = item.sound
  const phrase = item.say || item.word || ''

  if (key && realFile.get(key) !== false) {
    if (currentEl) {
      currentEl.pause()
      currentEl = null
    }
    const el = new Audio(`${BASE}sounds/${key}.mp3`)
    currentEl = el
    try {
      await el.play()
      realFile.set(key, true)
      return
    } catch {
      realFile.set(key, false)
      currentEl = null
      // fall through to speech
    }
  }
  if (!speak(phrase)) playChime(key || phrase)
}
