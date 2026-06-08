/*
 * Pre-render every piece of DYNAMIC spoken text in our default voice (Aoede) so
 * the app never needs the device voice: ladder/expand phrases, game + twin
 * prompts, the "Yes!/Try again" lines, twin names, and the finish line.
 *
 * Output: public/sounds/phrases/<slug>.mp3   (slug MUST match src/lib/audio.js).
 * Resumable: skips existing, retries transient empties. Quota-limited per day —
 * just re-run after the daily reset (optionally with a different TTS_MODEL).
 *
 *   node scripts/gen-phrases.mjs
 *   GEMINI_API_KEY=… PACE_MS=6500 TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/gen-phrases.mjs
 */
import { GoogleGenAI } from '@google/genai'
import lamejs from '@breezystack/lamejs'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS } from '../src/data/content.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'sounds', 'phrases')
mkdirSync(OUT, { recursive: true })

const VOICE = 'Aoede' // our default voice
const MODEL = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts'
const PACE_MS = Number(process.env.PACE_MS || 6500)
const KEY = process.env.GEMINI_API_KEY || process.env.NANOBANANA_GEMINI_API_KEY
if (!KEY) { console.error('No GEMINI_API_KEY'); process.exit(1) }

// MUST match src/lib/audio.js slugify.
const slugify = (t) =>
  String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const STYLE =
  'Read this warmly, slowly and cheerfully, like a kind teacher reading to a happy ' +
  'toddler. Gentle, clear and playful:\n'

// Game prompt templates — kept identical to SoundGameScreen/TwinModeScreen/ChoiceGame.
const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']
function gamePrompts(item) {
  const w = item.word.toLowerCase()
  const out = []
  out.push(item.soundLabel ? `Listen… ${item.soundLabel}! Where is the ${w}?` : `Can you find the ${w}?`)
  out.push(item.soundLabel ? `find the ${w} — listen, ${item.soundLabel}!` : `find the ${w}!`)
  out.push(`Yes! ${item.word}!`)
  out.push(`Try again. Find the ${w}.`)
  return out
}

// Collect unique texts, keyed by slug.
const bySlug = new Map()
const add = (t) => { const s = slugify(t); if (s && !bySlug.has(s)) bySlug.set(s, t) }
for (const world of WORLDS) for (const item of world.items) (item.expand || []).forEach(add)
for (const world of WORLDS) {
  if (!POOL_IDS.includes(world.id)) continue
  for (const item of world.items) if (!item.portrait) gamePrompts(item).forEach(add)
}
;['Audrey,', 'Adriel,', 'All done! Wonderful listening!'].forEach(add)

const ai = new GoogleGenAI({ apiKey: KEY })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function pcmToMp3(pcm, rate, kbps = 64) {
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2))
  const enc = new lamejs.Mp3Encoder(1, rate, kbps)
  const chunks = []
  for (let i = 0; i < samples.length; i += 1152) {
    const b = enc.encodeBuffer(samples.subarray(i, i + 1152))
    if (b.length) chunks.push(Buffer.from(b))
  }
  const end = enc.flush()
  if (end.length) chunks.push(Buffer.from(end))
  return Buffer.concat(chunks)
}

async function tts(text) {
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: STYLE + text }] }],
    config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
  })
  const part = resp?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
  if (!part) return null
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType || '')?.[1] || 24000)
  return { pcm: Buffer.from(part.inlineData.data, 'base64'), rate }
}

const entries = [...bySlug.entries()]
console.log(`voice=${VOICE} model=${MODEL} phrases=${entries.length}`)
const res = { ok: 0, skipped: 0, failed: [] }
let capHits = 0 // consecutive daily-quota errors -> stop instead of burning ~45 min of 429s
for (let i = 0; i < entries.length; i++) {
  const [slug, text] = entries[i]
  const out = path.join(OUT, `${slug}.mp3`)
  if (existsSync(out)) { res.skipped++; continue }
  try {
    let a = await tts(text)
    if (!a) { await sleep(1500); a = await tts(text) }
    if (!a) throw new Error('no audio data (after retry)')
    writeFileSync(out, pcmToMp3(a.pcm, a.rate))
    res.ok++
    capHits = 0
    console.log(`(${i + 1}/${entries.length}) ✓ ${slug}.mp3 — "${text.slice(0, 42)}"`)
  } catch (e) {
    const msg = String(e.message || e)
    res.failed.push({ slug, err: msg.slice(0, 90) })
    console.log(`(${i + 1}/${entries.length}) ✗ ${slug} — ${msg.slice(0, 90)}`)
    if (/429|RESOURCE_EXHAUSTED|exceeded your current quota|per_model_per_day/i.test(msg)) {
      if (++capHits >= 4) {
        console.log('\nDaily quota reached — stopping. Re-run after reset, or set TTS_MODEL to another model.')
        break
      }
    } else {
      capHits = 0
    }
  }
  await sleep(PACE_MS)
}
console.log(`\n=== SUMMARY ===\nok: ${res.ok}  skipped: ${res.skipped}  failed: ${res.failed.length}`)
if (res.failed.length) console.log('failed:', JSON.stringify(res.failed.slice(0, 20), null, 2))
