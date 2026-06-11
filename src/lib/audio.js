/*
 * Audio for TinyVoice Twins.
 *
 * Speech-first: children hear every word & phrase. Priority per item:
 *   1. A real recording at <base>/sounds/<key>.mp3  (warmest — drop files in anytime)
 *   2. Spoken via SpeechSynthesis, using the DEVICE'S BEST natural voice with a
 *      playful, child-friendly cadence (parent can pick the voice in settings).
 *   3. A soft chime (pure tap feedback only).
 *
 * A global mute (the speaker button) silences everything. Everything unlocks on
 * the first tap (mobile autoplay policy).
 */

import { premiumEnabled, premiumSpeak, stopPremium } from './tts'

const BASE = import.meta.env.BASE_URL || '/'

// Stable, filesystem-safe key for a piece of spoken text. MUST match
// scripts/gen-phrases.mjs so pre-rendered clips line up.
export const slugify = (t) =>
  String(t || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
const phraseUrl = (text) => `${BASE}sounds/phrases/${slugify(text)}.mp3`

/* ---------------- mute ---------------- */
let muted = (() => {
  try {
    return localStorage.getItem('tv_muted') === '1'
  } catch {
    return false
  }
})()
export const isMuted = () => muted
export function setMuted(v) {
  muted = !!v
  try {
    localStorage.setItem('tv_muted', muted ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (muted) stopAll()
}

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
  if (muted) return
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
  if (muted) return
  const c = audioCtx()
  if (!c) return
  const now = c.currentTime
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'triangle'
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
const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window

// Rank voices so the warmest, most natural one wins by default.
function scoreVoice(v) {
  const n = `${v.name} ${v.voiceURI}`.toLowerCase()
  let s = 0
  if (!/^en\b|^en[-_]/i.test(v.lang)) s -= 40 // strongly prefer English
  if (/en[-_]us/i.test(v.lang)) s += 6
  if (/en[-_]gb/i.test(v.lang)) s += 4
  // High-quality / neural voices across platforms
  if (/google/.test(n)) s += 14
  if (/natural|neural|enhanced|premium|siri/.test(n)) s += 16
  if (/samantha|ava|allison|aria|jenny|sonia|libby|nova|karen|moira|tessa|serena/.test(n)) s += 12
  if (/female/.test(n)) s += 4
  if (/compact|espeak|fallback/.test(n)) s -= 10
  return s
}

let chosenURI = (() => {
  try {
    return localStorage.getItem('tv_voice') || ''
  } catch {
    return ''
  }
})()
let cachedBest = null

function allVoices() {
  return hasSpeech ? window.speechSynthesis.getVoices() || [] : []
}
export function listVoices() {
  return allVoices()
    .filter((v) => /^en\b|^en[-_]/i.test(v.lang))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))
}
export function getVoiceURI() {
  return chosenURI
}
export function setVoice(uri) {
  chosenURI = uri || ''
  cachedBest = null
  try {
    localStorage.setItem('tv_voice', chosenURI)
  } catch {
    /* ignore */
  }
}
function pickVoice() {
  if (!hasSpeech) return null
  const voices = allVoices()
  if (!voices.length) return null
  if (chosenURI) {
    const found = voices.find((v) => v.voiceURI === chosenURI)
    if (found) return found
  }
  if (cachedBest && voices.includes(cachedBest)) return cachedBest
  cachedBest = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null
  return cachedBest
}
if (hasSpeech) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedBest = null
    pickVoice()
  }
}

// Playful, warm delivery (a touch higher & lively, clearly articulated).
export function speak(text, { rate = 0.9, pitch = 1.18 } = {}) {
  if (muted || !text || !hasSpeech) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = (v && v.lang) || 'en-US'
    u.rate = rate
    u.pitch = pitch
    u.volume = 1
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}
export function stopSpeaking() {
  if (hasSpeech) window.speechSynthesis.cancel()
  stopPremium()
}
function stopAll() {
  stopSpeaking()
  if (currentEl) {
    currentEl.pause()
    currentEl = null
  }
}

/**
 * Speak text using the best available voice: premium cloud voice if configured,
 * otherwise the device's speech engine. Fire-and-forget (async).
 */
export async function voice(text) {
  if (muted || !text) return
  audioCtx()
  // Chosen storybook voice's phrase clip (`sounds/<voice>/phrases/`) → Aoede default
  // (`sounds/phrases/`) → soft chime. Never the robotic device voice.
  if (storyVoice !== DEFAULT_STORYBOOK_VOICE &&
      (await playClip(`${BASE}sounds/${storyVoice}/phrases/${slugify(text)}.mp3`))) return
  if (await playClip(phraseUrl(text))) return
  if (premiumEnabled() && (await premiumSpeak(text))) return
  playChime(text) // a soft chime if a clip is missing
}

// Speak several parts in sequence in our voice (e.g. a twin name then the
// prompt: "Audrey," → "find the dog!"). Each part plays its own clip.
export async function voiceSeq(parts) {
  for (const p of parts) {
    if (muted) return
    if (p) await voice(p)
  }
}

/* ---------------- Storybook voice (bundled premium recordings) ---------------- */
// Warm, kid-friendly voices pre-rendered with Gemini TTS, shipped under
// public/sounds/<voice>/<key>.mp3. The parent picks one in the dashboard.
export const STORYBOOK_VOICES = [
  { id: 'aoede', label: 'Aoede — warm & breezy' },
  { id: 'leda', label: 'Leda — bright & youthful' },
  { id: 'sulafat', label: 'Sulafat — gentle storyteller' },
]
const DEFAULT_STORYBOOK_VOICE = 'aoede'
let storyVoice = (() => {
  try {
    return localStorage.getItem('tv_story_voice') || DEFAULT_STORYBOOK_VOICE
  } catch {
    return DEFAULT_STORYBOOK_VOICE
  }
})()
export const getStorybookVoice = () => storyVoice
export function setStorybookVoice(id) {
  storyVoice = id || DEFAULT_STORYBOOK_VOICE
  try {
    localStorage.setItem('tv_story_voice', storyVoice)
  } catch {
    /* ignore */
  }
}

/* ---------------- Real animal sound effects (voice-independent) ---------------- */
// Items with a real recorded sound at public/sounds/fx/<key>.mp3 (the file already
// bakes a coherent 3–4x repeat). The flow is: say the word, THEN play the sound.
const FX_KEYS = new Set([
  'dog', 'cat', 'cow', 'sheep', 'bird', 'frog', 'monkey', 'lion', 'bear', 'duck',
  'zebra', 'horse', 'pig', 'chicken', 'elephant', 'bee',
  'snake', 'owl', 'wolf', 'goose', 'crow',
])
const missingFile = new Set() // urls known to be absent (avoid retrying)

/* ---------------- Combined item playback ---------------- */
let currentEl = null

// Play an audio file; resolve(true) when it finishes, resolve(false) if it can't
// load/decode (e.g. a missing file served as the SPA index.html, or 404).
function playClip(url) {
  return new Promise((resolve) => {
    if (missingFile.has(url)) return resolve(false)
    if (currentEl) {
      currentEl.pause()
      currentEl = null
    }
    const el = new Audio(url)
    currentEl = el
    let settled = false
    const ok = () => {
      if (!settled) {
        settled = true
        resolve(true)
      }
    }
    const bad = () => {
      if (!settled) {
        settled = true
        missingFile.add(url)
        if (currentEl === el) currentEl = null
        resolve(false)
      }
    }
    el.addEventListener('ended', ok, { once: true })
    el.addEventListener('error', bad, { once: true })
    el.play().catch(bad)
  })
}

// Speak text via the device engine, resolving when it finishes. Polling
// speechSynthesis.speaking is the most cross-browser-reliable "ended" signal.
function speakAwait(text, opts) {
  return new Promise((resolve) => {
    if (!speak(text, opts)) return resolve(false)
    const sp = window.speechSynthesis
    const start = Date.now()
    const t = setInterval(() => {
      const ended = Date.now() - start > 400 && !sp.speaking
      if (ended || muted || Date.now() - start > 12000) {
        clearInterval(t)
        resolve(true)
      }
    }, 120)
  })
}

// Say the item's word/phrase in our voice, resolving when done. Order:
// chosen storybook voice → default (Aoede) voice → phrase clip → premium → chime.
// Never the robotic device voice.
async function sayWord(key, phrase) {
  if (key) {
    if (await playClip(`${BASE}sounds/${storyVoice}/${key}.mp3`)) return
    if (storyVoice !== DEFAULT_STORYBOOK_VOICE && (await playClip(`${BASE}sounds/${DEFAULT_STORYBOOK_VOICE}/${key}.mp3`))) return
  }
  if (phrase && (await playClip(phraseUrl(phrase)))) return
  if (premiumEnabled() && (await premiumSpeak(phrase))) return
  playChime(key || phrase) // a soft chime if no warm clip exists — no device voice
}

export async function playItem(item) {
  if (!item || muted) return
  audioCtx()
  const key = item.sound
  const phrase = item.say || item.word || ''

  // 1) Say the word/phrase (warm bundled voice → premium → chime; never device voice).
  await sayWord(key, phrase)

  // 2) For animals, follow with the real recorded sound (baked 3–4x repeat).
  if (!muted && key && FX_KEYS.has(key)) {
    await playClip(`${BASE}sounds/fx/${key}.mp3`)
  }
}

/** Play an ABC-song clip (public/sounds/abc-songs/<letter>.mp3); resolves when done.
 *  Falls back to a soft chime until the clip is generated — never the device voice. */
export async function playAbcSong(letter) {
  if (muted || !letter) return
  audioCtx()
  if (await playClip(`${BASE}sounds/abc-songs/${String(letter).toLowerCase()}.mp3`)) return
  playChime(letter)
}

/** Play a short sample in a given storybook voice (for the parent picker). */
export async function playStorybookSample(voiceId = storyVoice) {
  if (muted) return false
  audioCtx()
  const ok = await playClip(`${BASE}sounds/${voiceId}/body-head.mp3`)
  if (!ok) speak('My head! This is my head. Pat your head!')
  return ok
}
