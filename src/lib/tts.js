/*
 * Premium natural voice (ElevenLabs) with caching.
 *
 * Two ways to enable (see docs/PREMIUM_VOICE_SETUP.md):
 *   • VITE_TTS_PROXY_URL  → a Cloudflare Worker that holds the API key SECRET
 *     (recommended — the app is public, so the key must NOT ship in the bundle)
 *   • VITE_ELEVENLABS_KEY → call ElevenLabs directly (local/dev only; exposes key)
 *
 * Synthesized clips are cached in the Cache Storage API, so each phrase is
 * generated once per device and is instant (and cheap) thereafter. If premium
 * isn't configured or a request fails, callers fall back to the device voice.
 */

const PROXY = import.meta.env.VITE_TTS_PROXY_URL || ''
const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_KEY || ''
const ELEVEN_VOICE = import.meta.env.VITE_ELEVENLABS_VOICE || 'EXAVITQu4vr4xnSDxMaL' // warm default
const CACHE = 'tv-tts-v1'

export const premiumEnabled = () => Boolean(PROXY || ELEVEN_KEY)

async function synth(text) {
  if (PROXY) {
    return fetch(PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  }
  if (ELEVEN_KEY) {
    return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 },
      }),
    })
  }
  return null
}

let current = null
export function stopPremium() {
  if (current) {
    current.pause()
    current = null
  }
}

/**
 * Speak `text` with the premium voice. Returns true if it played.
 */
export async function premiumSpeak(text) {
  if (!text || !premiumEnabled()) return false
  try {
    const cacheKey = `https://tts.tinyvoice/${encodeURIComponent(ELEVEN_VOICE)}/${encodeURIComponent(text)}`
    let res
    if ('caches' in window) {
      const cache = await caches.open(CACHE)
      res = await cache.match(cacheKey)
      if (!res) {
        const fresh = await synth(text)
        if (!fresh || !fresh.ok) return false
        await cache.put(cacheKey, fresh.clone())
        res = fresh
      }
    } else {
      res = await synth(text)
      if (!res || !res.ok) return false
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    stopPremium()
    const a = new Audio(url)
    current = a
    a.onended = () => URL.revokeObjectURL(url)
    await a.play()
    return true
  } catch {
    return false
  }
}
