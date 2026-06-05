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
  if (premiumEnabled()) {
    const ok = await premiumSpeak(text)
    if (ok) return
  }
  speak(text)
}

/* ---------------- Combined item playback ---------------- */
const realFile = new Map()
let currentEl = null

export async function playItem(item) {
  if (!item || muted) return
  audioCtx()
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
    }
  }
  if (premiumEnabled()) {
    const ok = await premiumSpeak(phrase)
    if (ok) return
  }
  if (!speak(phrase)) playChime(key || phrase)
}
