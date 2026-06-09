/*
 * Generate AAC-style symbol icons for the speech-therapy verbs & prepositions
 * (the abstract words our learning-world art doesn't already cover), with the
 * Gemini image model ("nano-banana"). Output: public/images/<slug>.png — the
 * Word Board then shows them automatically (it loads images/<slug>.webp).
 *
 * Run optimize-images.mjs afterwards to make the .webp the board uses.
 *
 *   node scripts/gen-symbols.mjs                     # all missing verbs + prepositions
 *   node scripts/gen-symbols.mjs --only go,in,up     # just these (test batch)
 *   node scripts/gen-symbols.mjs --limit 6           # first N missing
 *   node scripts/gen-symbols.mjs --force             # regenerate existing
 *
 * Requires GEMINI_API_KEY (paid image model). Resumable: skips existing png/webp.
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORDS, imageKeyFor } from '../src/data/phraseContent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'images')
mkdirSync(OUT_DIR, { recursive: true })

const SEED = Number(process.env.SEED || 7)
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : null

const KEY = process.env.GEMINI_API_KEY || process.env.NANOBANANA_GEMINI_API_KEY || process.env.NANOBANANA_API_KEY
if (!KEY) { console.error('No API key. Set GEMINI_API_KEY.'); process.exit(1) }

const MODEL_CANDIDATES = process.env.NANOBANANA_MODEL
  ? [process.env.NANOBANANA_MODEL]
  : ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-2.0-flash-preview-image-generation']

const slug = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const STYLE =
  'Flat vector cartoon symbol for a toddler AAC language board. One single clear ' +
  'concept, bold simple rounded shapes, thick clean dark outlines, bright cheerful ' +
  'colours, plain solid off-white background, single centered subject, NO text, NO ' +
  'letters, NO words, friendly and cute, instantly recognizable, consistent ' +
  'children’s-book style, high quality.'

// Clear, text-free depictions. Verbs = a recurring cute toddler doing the action;
// prepositions = a red ball + simple box (or a bold arrow) showing the relationship.
const SUBJECT = {
  // verbs
  Go: 'a cute toddler happily walking forward with motion lines',
  Play: 'a cute toddler playing with a colourful ball',
  Eat: 'a cute toddler eating from a spoon',
  Sleep: 'a cute toddler sleeping peacefully with eyes closed, resting on a pillow',
  Stop: 'a cute toddler holding one open palm up in a clear stop gesture',
  Help: 'a cute toddler reaching out an open helping hand',
  Come: 'a cute toddler beckoning come-here with one hand',
  Run: 'a cute toddler running fast with motion lines',
  Sit: 'a cute toddler sitting down on the floor',
  Stand: 'a cute toddler standing up straight, arms at sides',
  Look: 'a cute toddler pointing with one finger to their wide-open eyes',
  Sing: 'a cute toddler singing happily with floating music notes',
  Kick: 'a cute toddler kicking a ball with one foot',
  Throw: 'a cute toddler throwing a ball overhand',
  Catch: 'a cute toddler catching a ball with both hands',
  Jump: 'a cute toddler jumping up into the air, both feet off the ground',
  Dance: 'a cute toddler dancing joyfully with music notes',
  Laugh: 'a cute toddler laughing with a big happy open smile',
  Cry: 'a cute toddler crying with one big tear drop',
  Hug: 'a cute toddler hugging a teddy bear tightly',
  Kiss: 'a cute toddler blowing a kiss with a little heart',
  Clap: 'a cute toddler clapping both hands together',
  Splash: 'a cute toddler splashing happily in a puddle of water',
  Climb: 'a cute toddler climbing up a small set of steps',
  Slide: 'a cute toddler sliding down a playground slide',
  Push: 'a cute toddler pushing a toy box forward',
  Pull: 'a cute toddler pulling a little wagon by its handle',
  Pick: 'a cute toddler bending to pick up a toy from the floor',
  Drop: 'a cute toddler dropping a ball that falls downward',
  Pour: 'a cute toddler pouring liquid from a jug into a cup',
  Drink: 'a cute toddler drinking from a cup with a straw',
  Blow: 'a cute toddler blowing soap bubbles',
  Read: 'a cute toddler reading an open picture book',
  Peek: 'a cute toddler peeking out from behind two hands, peekaboo',
  Hide: 'a cute toddler hiding behind a curtain, only peeking out',
  Find: 'a cute toddler searching with a big magnifying glass',
  Open: 'two cartoon hands opening the lid of a box',
  Close: 'two cartoon hands closing the lid of a box',
  Turn: 'a bold circular turning arrow with a cartoon hand',
  Spin: 'a cute toddler spinning around with a swirl of motion',
  Stretch: 'a cute toddler stretching both arms up high',
  Bend: 'a cute toddler bending down to touch their toes',
  Ride: 'a cute toddler riding a little tricycle',
  Roll: 'a colourful ball rolling along with motion lines',
  Skip: 'a cute toddler skipping happily',
  Hop: 'a cute toddler hopping on one foot',
  Wave: 'a cute toddler waving hello with one open hand',
  Shake: 'two cartoon hands doing a friendly handshake',
  // prepositions (ball + box / bold arrow)
  In: 'a red ball sitting inside an open cardboard box',
  On: 'a red ball resting on top of a closed box',
  Out: 'a red ball coming out of an open box',
  Up: 'a single big bold cheerful arrow pointing straight up',
  Down: 'a single big bold cheerful arrow pointing straight down',
  Here: 'a cartoon hand pointing down to a spot close by',
  There: 'a cartoon hand pointing far away into the distance',
  Home: 'a single cute simple cartoon house',
  Under: 'a red ball underneath a small table',
  Behind: 'a red ball peeking out from behind a box',
  Between: 'a red ball in the middle between two boxes',
  'Next to': 'a red ball right beside a box, side by side',
  Far: 'a tiny cartoon house far away at the end of a long road',
}

const TARGET_CATS = new Set(['Doing words', 'Where words'])
let items = WORDS
  .filter((w) => TARGET_CATS.has(w.category) && !imageKeyFor(w.word))
  .map((w) => ({ key: slug(w.word), word: w.word, subject: SUBJECT[w.word] || `a clear simple symbol representing "${w.word}"` }))
// de-dup by key
const seen = new Set()
items = items.filter((r) => (seen.has(r.key) ? false : seen.add(r.key)))

if (ONLY) {
  const set = new Set(ONLY.split(',').map((s) => slug(s.trim())))
  items = items.filter((r) => set.has(r.key))
}

const ai = new GoogleGenAI({ apiKey: KEY })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const extractImage = (resp) => (resp?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data)?.inlineData?.data || null

async function generate(model, prompt) {
  const resp = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { seed: SEED, responseModalities: ['IMAGE'] },
  })
  return extractImage(resp)
}
let MODEL = null
async function pickModel(prompt) {
  for (const m of MODEL_CANDIDATES) {
    try { const d = await generate(m, prompt); if (d) { console.log(`✓ model "${m}" works.`); return { model: m, data: d } } }
    catch (e) { console.log(`· model "${m}" failed: ${String(e.message || e).slice(0, 120)}`) }
  }
  return null
}

const todo = []
for (const it of items) {
  const png = path.join(OUT_DIR, `${it.key}.png`)
  const webp = path.join(OUT_DIR, `${it.key}.webp`)
  if (!FORCE && (existsSync(png) || existsSync(webp))) continue
  todo.push(it)
}
const run = LIMIT ? todo.slice(0, LIMIT) : todo
console.log(`symbols to generate: ${run.length} (of ${items.length} target words; rest already have art)`)

const results = { ok: [], failed: [] }
let capHits = 0
for (let i = 0; i < run.length; i++) {
  const { key, word, subject } = run[i]
  const prompt = `${STYLE} Subject: ${subject}.`
  try {
    let data
    if (!MODEL) { const p = await pickModel(prompt); if (!p) throw new Error('no model produced an image'); MODEL = p.model; data = p.data }
    else data = await generate(MODEL, prompt)
    if (!data) throw new Error('no image data')
    writeFileSync(path.join(OUT_DIR, `${key}.png`), Buffer.from(data, 'base64'))
    results.ok.push(key)
    capHits = 0
    console.log(`(${i + 1}/${run.length}) ✓ ${key}.png — "${word}"`)
  } catch (e) {
    const msg = String(e.message || e)
    results.failed.push({ key, err: msg.slice(0, 140) })
    console.log(`(${i + 1}/${run.length}) ✗ ${key} — ${msg.slice(0, 140)}`)
    if (/429|RESOURCE_EXHAUSTED|quota|billing|exceeded/i.test(msg) && ++capHits >= 3) {
      console.log('\nQuota/billing limit hit — stopping. Re-run later to resume.')
      break
    }
  }
  await sleep(Number(process.env.PACE_MS || 1200))
}
console.log(`\n=== SUMMARY ===\nmodel: ${MODEL}\nok: ${results.ok.length}  failed: ${results.failed.length}`)
if (results.failed.length) console.log('failed:', JSON.stringify(results.failed.slice(0, 10), null, 2))
