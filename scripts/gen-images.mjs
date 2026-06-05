/*
 * Batch-generate the toddler-app illustrations with the Gemini image model
 * ("nano-banana"). Same model + prompts the nanobanana extension uses, driven
 * directly for reliability (exact filenames, a fixed seed, resume-on-rerun).
 *
 * Usage:
 *   node scripts/gen-images.mjs            # generate all missing images
 *   node scripts/gen-images.mjs --only dog # generate a single key (test)
 *   node scripts/gen-images.mjs --force    # regenerate even if file exists
 *
 * Requires GEMINI_API_KEY (or NANOBANANA_GEMINI_API_KEY) in the environment.
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS } from '../src/data/content.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'images')
mkdirSync(OUT_DIR, { recursive: true })

const SEED = Number(process.env.SEED || 7)
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null // comma-separated keys
const MATCH = args.includes('--match') ? args[args.indexOf('--match') + 1] : null // key substring

const KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NANOBANANA_GEMINI_API_KEY ||
  process.env.NANOBANANA_API_KEY
if (!KEY) {
  console.error('No API key. Set GEMINI_API_KEY.')
  process.exit(1)
}

// Candidate image models, tried in order until one works for the first image.
const MODEL_CANDIDATES = process.env.NANOBANANA_MODEL
  ? [process.env.NANOBANANA_MODEL]
  : ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-2.0-flash-preview-image-generation']

const STYLE =
  'Flat vector cartoon illustration for a toddler learning app. Soft rounded shapes, ' +
  'thick clean dark outlines, bright cheerful pastel colours, simple solid off-white ' +
  'background, single centered subject, no text or letters, friendly, cute, wholesome, ' +
  'consistent children’s-book style, high quality.'

// My Body: clear, per-part framing so each part is unmistakably the subject,
// using one consistent recurring toddler character across the whole set.
const BODY_FRAMING = {
  head: 'a head-and-shoulders portrait; the whole round head is the clear focus',
  hair: 'a head-and-shoulders portrait, one hand patting the soft hair on top of the head; the hair is the clear focus',
  eyes: 'a face close-up with two big sparkly eyes wide open; the eyes are the clear focus',
  ears: 'a head view with both hands cupping the ears; the ears are the clear focus',
  nose: 'a face close-up with one finger gently touching the nose; the nose is the clear focus',
  mouth: 'a face close-up with a wide-open happy mouth; the mouth is the clear focus',
  teeth: 'a face close-up with a big smile showing clean white teeth; the teeth are the clear focus',
  hands: 'both hands held up open, palms facing forward; the hands are the clear focus',
  fingers: 'both hands held up with fingers spread and wiggling; the fingers are the clear focus',
  tummy: 'a full-body view with both hands resting on a round happy tummy; the tummy is the clear focus',
  knees: 'a full-body view, slightly crouched with both hands on the knees; the knees are the clear focus',
  feet: 'a full-body view looking down at two bare feet; the feet are the clear focus',
  toes: 'a full-body view sitting with bare feet up, wiggling the toes; the toes are the clear focus',
}

function subjectFor(world, item) {
  const w = item.word.toLowerCase()
  switch (world.id) {
    case 'safari-island':
    case 'music-forest':
      return `a cute friendly ${w}, full body, big happy eyes, gentle smile`
    case 'my-body': {
      const framing = BODY_FRAMING[w] || `the ${w} clearly shown as the focus`
      return (
        `the same recurring cute cartoon toddler (one consistent character across the set: ` +
        `round friendly face, warm medium skin tone, small dark hair tuft, simple soft outfit), ` +
        `${framing}, with a soft pastel halo gently highlighting the ${w}`
      )
    }
    case 'things-i-do':
      return `a happy cartoon toddler ${w}, clear simple action`
    case 'home-village':
      if (w === 'bath') return 'a cute cartoon bathtub full of bubbles'
      return `a single cute cartoon ${w}, centered`
    default:
      return `a cute cartoon ${w}`
  }
}

// Build the dedup'd photo-item list (same rule as gen-image-prompts.mjs).
const rows = new Map()
for (const world of WORLDS) {
  for (const item of world.items) {
    const isPhoto = item.numeral == null && !item.swatch && !item.portrait
    if (!isPhoto) continue
    const key = item.sound
    if (!key || rows.has(key)) continue
    rows.set(key, { key, word: item.word, prompt: `${STYLE} Subject: ${subjectFor(world, item)}.` })
  }
}

let items = [...rows.values()]
if (ONLY) {
  const set = new Set(ONLY.split(',').map((s) => s.trim()))
  items = items.filter((r) => set.has(r.key))
}
if (MATCH) items = items.filter((r) => r.key.includes(MATCH))

const ai = new GoogleGenAI({ apiKey: KEY })

function extractImage(resp) {
  const parts = resp?.candidates?.[0]?.content?.parts || []
  for (const p of parts) {
    if (p.inlineData?.data) return p.inlineData.data
  }
  return null
}

async function generate(model, prompt) {
  // Pass seed via config for cross-image consistency; image models accept generationConfig.
  const resp = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { seed: SEED, responseModalities: ['IMAGE'] },
  })
  return extractImage(resp)
}

let MODEL = null
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pickModel(prompt) {
  for (const m of MODEL_CANDIDATES) {
    try {
      const data = await generate(m, prompt)
      if (data) {
        console.log(`✓ model "${m}" works.`)
        return { model: m, data }
      }
      console.log(`· model "${m}" returned no image, trying next…`)
    } catch (e) {
      console.log(`· model "${m}" failed: ${String(e.message || e).slice(0, 140)}`)
    }
  }
  return null
}

const results = { ok: [], skipped: [], failed: [] }

for (let i = 0; i < items.length; i++) {
  const { key, word, prompt } = items[i]
  const outPath = path.join(OUT_DIR, `${key}.png`)
  if (!FORCE && existsSync(outPath)) {
    results.skipped.push(key)
    console.log(`(${i + 1}/${items.length}) skip ${key}.png (exists)`)
    continue
  }
  try {
    let data
    if (!MODEL) {
      const picked = await pickModel(prompt)
      if (!picked) throw new Error('no candidate model produced an image')
      MODEL = picked.model
      data = picked.data
    } else {
      data = await generate(MODEL, prompt)
    }
    if (!data) throw new Error('no image data in response')
    writeFileSync(outPath, Buffer.from(data, 'base64'))
    const kb = Math.round(Buffer.from(data, 'base64').length / 1024)
    results.ok.push(key)
    console.log(`(${i + 1}/${items.length}) ✓ ${key}.png — "${word}" (${kb} KB)`)
  } catch (e) {
    results.failed.push({ key, err: String(e.message || e).slice(0, 160) })
    console.log(`(${i + 1}/${items.length}) ✗ ${key} — ${String(e.message || e).slice(0, 160)}`)
  }
  await sleep(800) // gentle pacing for rate limits
}

console.log('\n=== SUMMARY ===')
console.log(`model: ${MODEL}`)
console.log(`ok: ${results.ok.length}  skipped: ${results.skipped.length}  failed: ${results.failed.length}`)
if (results.failed.length) console.log('failed:', JSON.stringify(results.failed, null, 2))
