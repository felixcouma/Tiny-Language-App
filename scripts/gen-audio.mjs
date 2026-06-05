/*
 * Batch-generate warm, kid-friendly spoken audio for every item with Gemini TTS
 * (gemini-2.5-flash-preview-tts), in multiple voices the parent can choose from.
 *
 * One clip per item's spoken text (`say || word`), encoded to MP3 and saved as
 *   public/sounds/<voice>/<sound>.mp3
 * The app prefers these over the device voice and picks the folder by the parent's
 * chosen voice (default: aoede). Conservative: one attempt, skip existing, resume.
 *
 *   node scripts/gen-audio.mjs                       # all voices, all missing clips
 *   node scripts/gen-audio.mjs --voices aoede        # one voice only
 *   node scripts/gen-audio.mjs --only body-head      # one item (all voices)
 *   node scripts/gen-audio.mjs --force               # regenerate existing
 *
 * Env: GEMINI_API_KEY, optional TTS_MODEL.
 */
import { GoogleGenAI } from '@google/genai'
import lamejs from '@breezystack/lamejs'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS } from '../src/data/content.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOUNDS = path.join(__dirname, '..', 'public', 'sounds')

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const VOICES = (args.includes('--voices') ? args[args.indexOf('--voices') + 1] : 'aoede,leda,sulafat')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean)
const MODEL = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts'
const PACE_MS = Number(process.env.PACE_MS || 6500) // ≥6s keeps us under the 10 req/min TTS cap
const KEY = process.env.GEMINI_API_KEY || process.env.NANOBANANA_GEMINI_API_KEY
if (!KEY) { console.error('No GEMINI_API_KEY'); process.exit(1) }

// Capitalised voice name for the API (folders stay lower-case).
const apiVoice = (v) => v.charAt(0).toUpperCase() + v.slice(1)

const STYLE =
  'Read this warmly, slowly and cheerfully, like a kind teacher reading to a happy ' +
  'toddler. Gentle, clear and playful:\n'

// Unique spoken items keyed by `sound`.
const rows = new Map()
for (const world of WORLDS) {
  for (const item of world.items) {
    const key = item.sound
    const text = item.say || item.word
    if (!key || !text || rows.has(key)) continue
    rows.set(key, { key, text, word: item.word })
  }
}
let items = [...rows.values()]
if (ONLY) items = items.filter((r) => r.key === ONLY)

const ai = new GoogleGenAI({ apiKey: KEY })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function pcmToMp3(pcm, rate, kbps = 64) {
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2))
  const enc = new lamejs.Mp3Encoder(1, rate, kbps)
  const chunks = []
  const block = 1152
  for (let i = 0; i < samples.length; i += block) {
    const buf = enc.encodeBuffer(samples.subarray(i, i + block))
    if (buf.length) chunks.push(Buffer.from(buf))
  }
  const end = enc.flush()
  if (end.length) chunks.push(Buffer.from(end))
  return Buffer.concat(chunks)
}

async function tts(voiceName, text) {
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: STYLE + text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  })
  const part = resp?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
  if (!part) return null
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType || '')?.[1] || 24000)
  return { pcm: Buffer.from(part.inlineData.data, 'base64'), rate }
}

const results = { ok: 0, skipped: 0, failed: [] }
console.log(`voices=[${VOICES.join(', ')}] model=${MODEL} items=${items.length}`)

for (const voice of VOICES) {
  const dir = path.join(SOUNDS, voice)
  mkdirSync(dir, { recursive: true })
  console.log(`\n--- voice: ${voice} ---`)
  for (let i = 0; i < items.length; i++) {
    const { key, text, word } = items[i]
    const out = path.join(dir, `${key}.mp3`)
    if (!FORCE && existsSync(out)) { results.skipped++; continue }
    try {
      const a = await tts(apiVoice(voice), text)
      if (!a) throw new Error('no audio data')
      const mp3 = pcmToMp3(a.pcm, a.rate)
      writeFileSync(out, mp3)
      results.ok++
      console.log(`  (${i + 1}/${items.length}) ✓ ${voice}/${key}.mp3 — "${word}" (${Math.round(mp3.length / 1024)} KB)`)
    } catch (e) {
      results.failed.push({ voice, key, err: String(e.message || e).slice(0, 140) })
      console.log(`  (${i + 1}/${items.length}) ✗ ${voice}/${key} — ${String(e.message || e).slice(0, 140)}`)
    }
    await sleep(500)
  }
}

console.log('\n=== SUMMARY ===')
console.log(`ok: ${results.ok}  skipped: ${results.skipped}  failed: ${results.failed.length}`)
if (results.failed.length) console.log('failed:', JSON.stringify(results.failed, null, 2))
