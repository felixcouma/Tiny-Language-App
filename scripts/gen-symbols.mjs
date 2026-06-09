/*
 * Generate AAC-style symbol icons for every speech-therapy word that doesn't yet
 * have an illustration (verbs, prepositions, nouns, feelings, colours, numbers…),
 * with the Gemini image model ("nano-banana"). Output: public/images/<key>.png
 * where <key> is exactly what the Word Board resolves to (imageKeyFor||slug), so
 * the board picks them up automatically once optimized to WebP.
 *
 *   node scripts/gen-symbols.mjs                 # all missing words
 *   node scripts/gen-symbols.mjs --only go,in    # just these (test)
 *   node scripts/gen-symbols.mjs --limit 6       # first N missing
 *   node scripts/gen-symbols.mjs --force         # regenerate existing
 *
 * Requires GEMINI_API_KEY (paid image model). Resumable: skips existing files.
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
// Where the board looks for a word's image (content key, else slugged word).
const outKey = (word) => imageKeyFor(word) || slug(word)

const STYLE =
  'Flat vector cartoon symbol for a toddler AAC language board. One single clear ' +
  'concept, bold simple rounded shapes, thick clean dark outlines, bright cheerful ' +
  'colours, plain solid off-white background, single centered subject, NO text, NO ' +
  'letters, NO numbers, NO words, friendly and cute, instantly recognizable, ' +
  'consistent children’s-book style, high quality.'

const NUM_WORDS = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10 }
const COLOURS = new Set(['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'])

const SUBJECT = {
  // verbs
  Go: 'a cute toddler happily walking forward with motion lines', Play: 'a cute toddler playing with a colourful ball',
  Eat: 'a cute toddler eating from a spoon', Sleep: 'a cute toddler sleeping peacefully with eyes closed on a pillow',
  Stop: 'a cute toddler holding one open palm up in a clear stop gesture', Help: 'a cute toddler reaching out an open helping hand',
  Come: 'a cute toddler beckoning come-here with one hand', Run: 'a cute toddler running fast with motion lines',
  Sit: 'a cute toddler sitting down on the floor', Stand: 'a cute toddler standing up straight',
  Look: 'a cute toddler pointing one finger to their wide-open eyes', Sing: 'a cute toddler singing happily with floating music notes',
  Kick: 'a cute toddler kicking a ball', Throw: 'a cute toddler throwing a ball', Catch: 'a cute toddler catching a ball with both hands',
  Jump: 'a cute toddler jumping up into the air', Dance: 'a cute toddler dancing joyfully with music notes',
  Laugh: 'a cute toddler laughing with a big happy smile', Cry: 'a cute toddler crying with one big tear',
  Hug: 'a cute toddler hugging a teddy bear', Kiss: 'a cute toddler blowing a kiss with a little heart',
  Clap: 'a cute toddler clapping both hands', Splash: 'a cute toddler splashing in a puddle of water',
  Climb: 'a cute toddler climbing small steps', Slide: 'a cute toddler sliding down a playground slide',
  Push: 'a cute toddler pushing a toy box', Pull: 'a cute toddler pulling a little wagon',
  Pick: 'a cute toddler picking up a toy from the floor', Drop: 'a cute toddler dropping a ball downward',
  Pour: 'a cute toddler pouring from a jug into a cup', Drink: 'a cute toddler drinking from a cup with a straw',
  Blow: 'a cute toddler blowing soap bubbles', Read: 'a cute toddler reading an open picture book',
  Peek: 'a cute toddler peeking out from behind two hands', Hide: 'a cute toddler hiding behind a curtain',
  Find: 'a cute toddler searching with a big magnifying glass', Open: 'two cartoon hands opening a box lid',
  Close: 'two cartoon hands closing a box lid', Turn: 'a bold circular turning arrow with a cartoon hand',
  Spin: 'a cute toddler spinning with a swirl of motion', Stretch: 'a cute toddler stretching both arms up high',
  Bend: 'a cute toddler bending to touch their toes', Ride: 'a cute toddler riding a little tricycle',
  Roll: 'a colourful ball rolling with motion lines', Skip: 'a cute toddler skipping happily',
  Hop: 'a cute toddler hopping on one foot', Wave: 'a cute toddler waving hello with one hand',
  Shake: 'two cartoon hands doing a friendly handshake',
  // prepositions
  In: 'a red ball inside an open box', On: 'a red ball on top of a closed box', Out: 'a red ball coming out of a box',
  Up: 'a single big bold cheerful arrow pointing straight up', Down: 'a single big bold cheerful arrow pointing straight down',
  Here: 'a cartoon hand pointing down to a spot close by', There: 'a cartoon hand pointing far into the distance',
  Home: 'a single cute cartoon house', Under: 'a red ball underneath a small table', Behind: 'a red ball behind a box',
  Between: 'a red ball in the middle between two boxes', 'Next to': 'a red ball right beside a box', Far: 'a tiny house far away at the end of a long road',
  // things
  Toy: 'a colourful toy box overflowing with toys', Food: 'a plate piled with yummy food', Water: 'a clear glass of water',
  Shoe: 'a single cute sneaker shoe', Car: 'a cute little red car', Door: 'a friendly closed wooden door',
  // people
  Mama: 'a kind smiling cartoon mother', Dada: 'a kind smiling cartoon father', Baby: 'a cute smiling baby',
  Me: 'a cartoon child pointing to themselves with both hands', You: 'a cartoon child pointing forward at the viewer',
  Bye: 'a cartoon child waving goodbye', Friend: 'two cartoon children hugging as friends',
  // feelings
  Happy: 'a big happy smiling round face', Sad: 'a sad round face with one tear', More: 'two open hands held together asking for more',
  Yes: 'a single bold green thumbs-up', No: 'a flat red open hand held up saying no', 'All done': 'two open empty hands, palms up, all finished',
  Tired: 'a yawning sleepy round face', Hurt: 'a child with a bandage on a knee', Excited: 'an excited face with open mouth and sparkles',
  Scared: 'a worried frightened round face', Angry: 'an angry frowning round face', Silly: 'a silly face with tongue sticking out',
  Quiet: 'a face with one finger held over the lips, shhh',
  // describing
  Big: 'a big elephant beside a tiny mouse showing big', Small: 'a tiny mouse beside a big elephant showing small',
  Hot: 'a bright hot sun with heat waves', Cold: 'a blue snowflake with icicles', Soft: 'a soft fluffy pillow',
  Hard: 'a solid grey rock', Wet: 'a big blue water splash droplet', Dry: 'a dry towel under a warm sun',
  Clean: 'a shiny sparkling clean plate with sparkles', Dirty: 'a brown muddy splat', Loud: 'a megaphone with bold sound lines',
  Fast: 'a bright lightning bolt with speed lines', Slow: 'a slow smiling snail', Good: 'a smiling face with a thumbs-up',
  Bad: 'a frowning face with a red thumbs-down', Old: 'a weathered gnarled old tree', New: 'a shiny gift box with a sparkle',
  // food
  Apple: 'a shiny red apple', Banana: 'a ripe yellow banana', Bread: 'a loaf of bread', Cheese: 'a wedge of yellow cheese',
  Juice: 'a glass of orange juice with a straw', Snack: 'a small bowl of crackers', Cookie: 'a chocolate-chip cookie',
  // eating
  Plate: 'a clean empty round plate', Fork: 'a single fork', Bowl: 'a clean empty bowl',
  // clothes
  Shirt: 'a colourful t-shirt', Pants: 'a pair of blue pants', Hat: 'a cute sun hat', Socks: 'a pair of striped socks',
  // body
  Hand: 'a single open hand, palm forward', Foot: 'a single bare foot', Belly: 'a cartoon child with both hands on a round tummy',
  // around home
  Chair: 'a small wooden chair', Table: 'a small wooden table', Sofa: 'a cosy soft sofa', Window: 'a bright open window',
  Light: 'a glowing yellow lamp', Stairs: 'a small set of stairs', Rug: 'a colourful patterned rug', Pillow: 'a soft pillow',
  // toys
  Block: 'colourful stacking blocks', Train: 'a cute toy train', Truck: 'a cute toy dump truck', Doll: 'a cute rag doll',
  Puzzle: 'a few colourful jigsaw puzzle pieces', Swing: 'a playground swing', Balloon: 'a single red balloon', Music: 'colourful music notes',
  // nature
  Tree: 'a round green leafy tree', Flower: 'a single colourful flower', Grass: 'green grass blades with a little flower',
  Sun: 'a bright smiling yellow sun', Moon: 'a friendly crescent moon', Star: 'a bright yellow star',
  Rain: 'a blue cloud with falling raindrops', Snow: 'a snowflake with falling snow', Cloud: 'a fluffy white cloud', Rock: 'a smooth grey rock',
  // going places
  Bus: 'a cute yellow school bus', Plane: 'a cute airplane', Boat: 'a little sailboat on water', Bike: "a child's bicycle",
  Motorcycle: 'a cute motorcycle', Helicopter: 'a cute helicopter',
  // animals
  Mouse: 'a cute little grey mouse', Bunny: 'a cute fluffy bunny rabbit',
  // school
  Pencil: 'a yellow pencil', Paper: 'a blank sheet of paper', Crayon: 'a colourful crayon', Scissors: 'child-safe scissors',
  Glue: 'a glue stick', Shape: 'a colourful circle, square and triangle together',
  // time
  Day: 'a bright daytime sky with a sun', Night: 'a dark night sky with a moon and stars', Morning: 'a sunrise over green hills',
  Afternoon: 'a high midday sun in a blue sky', Today: 'a friendly calendar page', Now: 'a simple round clock face',
  When: 'a round clock face with a thinking question mark', After: 'an arrow pointing from one clock to the next',
}

function subjectFor(word) {
  if (NUM_WORDS[word]) return `${NUM_WORDS[word]} big round colourful dots arranged neatly together`
  if (COLOURS.has(word)) return `a single large flat solid ${word.toLowerCase()}-coloured circle, centered`
  return SUBJECT[word] || `a clear simple cartoon symbol clearly representing "${word}"`
}

const ai = new GoogleGenAI({ apiKey: KEY })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const extractImage = (resp) => (resp?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data)?.inlineData?.data || null

async function generate(model, prompt) {
  const resp = await ai.models.generateContent({
    model, contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

// Target: every word whose resolved board image is missing.
let items = WORDS.map((w) => ({ word: w.word, key: outKey(w.word), subject: subjectFor(w.word) }))
const seen = new Set()
items = items.filter((r) => (seen.has(r.key) ? false : seen.add(r.key)))
if (ONLY) { const set = new Set(ONLY.split(',').map((s) => slug(s.trim()))); items = items.filter((r) => set.has(slug(r.word)) || set.has(r.key)) }

const todo = items.filter((it) => FORCE || (!existsSync(path.join(OUT_DIR, `${it.key}.png`)) && !existsSync(path.join(OUT_DIR, `${it.key}.webp`))))
const run = LIMIT ? todo.slice(0, LIMIT) : todo
console.log(`symbols to generate: ${run.length} (of ${items.length} words)`)

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
    results.ok.push(key); capHits = 0
    console.log(`(${i + 1}/${run.length}) ✓ ${key}.png — "${word}"`)
  } catch (e) {
    const msg = String(e.message || e)
    results.failed.push({ key, err: msg.slice(0, 120) })
    console.log(`(${i + 1}/${run.length}) ✗ ${key} — ${msg.slice(0, 120)}`)
    if (/exceeded its monthly spending cap|billing/i.test(msg)) { console.log('\nSpending cap hit — stopping.'); break }
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg) && ++capHits >= 5) { console.log('\nRate/quota limit — stopping.'); break }
  }
  await sleep(Number(process.env.PACE_MS || 1500))
}
console.log(`\n=== SUMMARY ===\nmodel: ${MODEL}\nok: ${results.ok.length}  failed: ${results.failed.length}`)
if (results.failed.length) console.log('failed:', JSON.stringify(results.failed.slice(0, 12), null, 2))
