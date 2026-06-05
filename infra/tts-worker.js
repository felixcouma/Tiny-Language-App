/*
 * TinyVoice premium-voice proxy (Cloudflare Worker).
 *
 * Keeps your ElevenLabs API key SECRET (never shipped to the public app).
 * The app POSTs { "text": "..." } here and gets back audio/mpeg.
 *
 * Setup: see docs/PREMIUM_VOICE_SETUP.md. Set these as Worker variables:
 *   ELEVENLABS_API_KEY   (secret)   — your ElevenLabs key
 *   ELEVENLABS_VOICE     (optional) — a voice id; defaults to a warm voice
 *   ALLOW_ORIGIN         (optional) — e.g. https://felixcouma.github.io  (default "*")
 */
export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || '*'
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (request.method !== 'POST') {
      return new Response('POST JSON { text }', { status: 405, headers: cors })
    }

    let text = ''
    try {
      ;({ text } = await request.json())
    } catch {
      /* ignore */
    }
    text = (text || '').toString().slice(0, 300).trim()
    if (!text) return new Response('missing text', { status: 400, headers: cors })

    const voice = env.ELEVENLABS_VOICE || 'EXAVITQu4vr4xnSDxMaL'
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3 },
      }),
    })
    if (!r.ok) return new Response('tts upstream error', { status: 502, headers: cors })

    return new Response(r.body, {
      headers: {
        ...cors,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  },
}
