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

// Auth: either an AI-Studio API key, OR Vertex AI (service-account ADC) when
// VERTEX_PROJECT is set — the latter bills the GCP credit instead of AI-Studio
// prepayment credits. For Vertex, also set GOOGLE_APPLICATION_CREDENTIALS.
const VERTEX_PROJECT = process.env.VERTEX_PROJECT || ''
const USE_VERTEX = !!VERTEX_PROJECT
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || 'global'
const KEY = process.env.GEMINI_API_KEY || process.env.NANOBANANA_GEMINI_API_KEY || process.env.NANOBANANA_API_KEY
if (!USE_VERTEX && !KEY) { console.error('No auth. Set GEMINI_API_KEY, or VERTEX_PROJECT (+ GOOGLE_APPLICATION_CREDENTIALS).'); process.exit(1) }

const MODEL_CANDIDATES = process.env.NANOBANANA_MODEL
  ? [process.env.NANOBANANA_MODEL]
  : ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-2.0-flash-preview-image-generation']

const slug = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
// Where the board looks for a word's image (content key, else slugged word).
const outKey = (word) => imageKeyFor(word) || slug(word)

const STYLE =
  'Premium, polished professional children’s-book illustration for a toddler AAC ' +
  'language board. One single clear concept, a single adorable centered subject on a ' +
  'plain solid off-white background. Clean confident rounded outlines with soft cel ' +
  'shading, gentle gradients and subtle soft shadows for depth, warm rich vibrant ' +
  'colours, smooth refined linework, crisp high detail, delightful and characterful, ' +
  'no extra props or decorations beyond what is described. NO text, NO letters, NO ' +
  'numbers, NO words, instantly recognizable, consistent style, high-resolution, ' +
  'gallery-quality.'

const NUM_WORDS = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10 }
const COLOURS = new Set(['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White', 'Grey'])

// Fixed character so the "Head, Shoulders, Knees and Toes" song poses read as ONE
// consistent toddler (benchmark for song animations — see docs/SONG_ANIMATIONS_SCOPE.md).
const SONG_CHAR =
  'a cute happy toddler with short dark hair and a round friendly face, wearing a teal ' +
  't-shirt and mustard-yellow shorts, whole body from head to feet visible, standing facing forward'

const SUBJECT = {
  // song poses (Head/Shoulders benchmark) — same character, one action each
  'Song ready': `${SONG_CHAR}, arms relaxed down at their sides, big friendly smile`,
  'Song head': `${SONG_CHAR}, both hands placed flat on the top of their head`,
  'Song shoulders': `${SONG_CHAR}, both hands placed on their own two shoulders`,
  'Song knees': `${SONG_CHAR}, bending forward a little, both hands on their knees`,
  'Song toes': `${SONG_CHAR}, bending down low, both hands touching their toes on the ground`,
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
  // social / core-communication words (abstract — use conventional toddler depictions).
  // NOTE (premium re-render phasing): the toddler character here currently renders light-
  // skinned. Per the project's inclusivity convention (see the diverse family portraits
  // below), future premium passes must VARY skin tone across the set (black / brown / white
  // / asian) so the app reflects every family — bake an explicit skin-tone into each subject.
  Yes: 'a cute toddler nodding their head yes with an enthusiastic happy smile and a cheerful thumbs-up',
  No: 'a cute toddler shaking their head no, one open hand gently raised, mild firm expression',
  'All done': 'a cute toddler holding both open palms up and turned outward in a finished all-done gesture, pleased satisfied smile',
  Bye: 'a cute toddler waving goodbye with one raised open hand, warm cheerful smile',
  Okay: 'a cute toddler giving a cheerful thumbs-up with one hand, happy reassured smile',
  Please: 'a cute toddler with both hands gently clasped together at their chest, sweet hopeful pleading smile, nothing else in the scene',
  'Thank you': 'a cute toddler touching their chin with the fingertips of one flat hand and moving it outward, warm grateful smile',
  Hi: 'a cute toddler waving one open hand in a big friendly hello, wide happy smile',
  Mine: 'a cute toddler hugging a teddy bear tightly to their chest with both arms, showing it belongs to them',
  Again: 'two bold cheerful circular repeat arrows chasing around in a loop, with a small cartoon hand',
  'Uh-oh': 'a cute toddler with a worried surprised face and both hands on their cheeks, a small tipped-over cup beside them',
  Wow: 'a cute toddler with a delighted amazed face, wide open mouth and sparkling star eyes, both hands raised in wonder',
  Sorry: 'a cute toddler with a gentle apologetic sad face and one hand resting on their chest',
  'Night-night': 'a cute toddler sleeping peacefully in a cosy bed under a blanket, a friendly crescent moon and little stars above',
  Yay: 'a cute toddler cheering with both arms raised high and a big joyful smile, little celebration sparkles around',
  // prepositions
  In: 'a red ball inside an open box', On: 'a red ball on top of a closed box', Out: 'a red ball coming out of a box',
  Up: 'a single big bold cheerful arrow pointing straight up', Down: 'a single big bold cheerful arrow pointing straight down',
  Here: 'a cartoon hand pointing down to a spot close by', There: 'a cartoon hand pointing far into the distance',
  Home: 'a single cute cartoon house', Under: 'a red ball underneath a small table', Behind: 'a red ball behind a box',
  Between: 'a red ball in the middle between two boxes', 'Next to': 'a red ball right beside a box', Far: 'a tiny house far away at the end of a long road',
  // things
  Ball: 'a classic bright inflatable beach ball with red, blue, green and yellow curved panels meeting at the top, glossy, round and cheerful',
  Toy: 'a colourful toy box overflowing with toys', Food: 'a plate piled with yummy food', Water: 'a clear glass of water',
  Shoe: 'a single cute sneaker shoe', Car: 'a cute little red car', Door: 'a friendly closed wooden door',
  // routine props (Every Day with Pip)
  Spoon: 'a single cute baby spoon',
  Book: 'a single cute closed picture book with a colourful cover',
  Teeth: 'a cheerful big smile showing clean white teeth with a toothbrush and a dab of toothpaste',
  // abstract words — prepositions / questions / time (Phase 11)
  Off: 'a red ball lifted up and away, off the top of a box',
  Want: 'a cute toddler reaching out with both open hands, wanting something, eager face',
  Where: 'a big friendly question mark next to a red location map-pin',
  What: 'a big friendly question mark beside a closed mystery box',
  Who: 'a big friendly question mark beside the silhouette of a person',
  Why: 'a big friendly curly question mark beside a thoughtful thinking face',
  How: 'a big friendly question mark beside a glowing lightbulb',
  Can: 'a cute toddler flexing one arm with a proud can-do smile',
  Later: 'a friendly clock with an arrow curving forward to a later time',
  // body parts (iconic — kept neutral, not a full figure)
  Head: 'a cute simple friendly cartoon head and face',
  Eyes: 'a pair of big friendly cartoon eyes',
  Nose: 'a cute cartoon nose on a simple friendly face',
  Mouth: 'a cute smiling cartoon mouth with soft lips',
  Toes: 'a cute cartoon bare foot showing five little wiggly toes',
  // routine scene/summary images (multi-ethnic per the inclusivity convention above)
  'rt-mealtime':
    'a cute happy toddler with warm brown skin sitting on a little chair at a small table, a plate of food in front of them, holding a spoon up to their mouth, mid-bite and delighted',
  'rt-night':
    'a single cosy cartoon bedroom window at night — through the glass panes a deep blue night sky with a big friendly crescent moon and a few little stars — the wall around the window plain and light',
  'rt-dressed':
    'a cute happy toddler with dark brown skin, fully dressed head to toe with ALL items clearly visible — a t-shirt, pants, shoes and a hat — waving goodbye with one hand, ready to go out',
  'rt-bath':
    'a cute happy toddler sitting in a bathtub full of white bubbles and foam, splashing, only head and shoulders above the bubbles',
  Soap: 'a single cute bar of soap with a few little bubbles',
  Towel: 'a single soft folded bath towel',
  Cup: 'a cute colourful toddler drinking cup',
  Bed: 'a cute cosy little bed with a soft pillow and a folded blanket',
  // people
  Mama: 'a kind smiling cartoon Black mother with deep brown skin and dark natural hair, head and shoulders',
  Dada: 'a kind smiling cartoon father with deep brown skin, short black hair and a neat beard, head and shoulders',
  Baby: 'a cute smiling baby with light golden skin and soft East Asian features',
  // family portraits — deliberately diverse skin tones across the set (brown / black /
  // white) so the app feels inclusive to every family the therapist shows it to.
  Mommy: 'a kind smiling cartoon mother with warm light-brown skin and dark hair in a bun, head and shoulders',
  Daddy: 'a kind smiling cartoon father with dark brown skin, short black hair and a neat beard, head and shoulders',
  Sister: 'a happy cartoon young girl with light fair skin and blonde pigtails, head and shoulders',
  Brother: 'a happy cartoon young boy with medium brown skin and short curly black hair, head and shoulders',
  Grandma: 'a kind smiling elderly cartoon grandmother with light skin, soft grey hair in a bun and round glasses, head and shoulders',
  Grandpa: 'a kind smiling elderly cartoon grandfather with warm brown skin, short grey hair and glasses, head and shoulders',
  Me: 'a cartoon child pointing to themselves with both hands', You: 'a cartoon child pointing forward at the viewer',
  Bye: 'a cartoon child waving goodbye', Friend: 'two cartoon children hugging as friends',
  // feelings
  Happy: 'a big happy smiling round face', Sad: 'a sad round face with one tear',
  More: 'the baby-sign / ASL gesture for MORE: two hands, each with all four fingertips pinched together to meet the thumb tip forming a bunched "flat-O" handshape (like a closed tulip bud or pinching fingers), both hands the SAME identical posture, turned to face each other and tapping their bunched fingertips together in the centre — clearly NOT flat open palms',
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
  Rice: 'a white bowl of fluffy cooked white rice', Avocado: 'a ripe green avocado cut in half showing the round pit',
  Broccoli: 'a single fresh green broccoli floret', Cucumber: 'a fresh green cucumber, one whole and one slice',
  Carrot: 'a bright orange carrot with a leafy green top', Meat: 'a cooked brown steak of meat on a plate',
  'Chicken leg': 'a cooked golden-brown chicken drumstick', 'Fish fillet': 'a cooked fish fillet on a plate',
  Ugali: 'a white block of ugali (maize meal porridge) on a plate', Fries: 'a red paper cup of golden french fries',
  Bottle: 'a baby feeding bottle full of white milk', Yoghurt: 'a cup of creamy yoghurt with a spoon',
  // mealtime
  Plate: 'a clean empty round plate', Fork: 'a single fork', Bowl: 'a clean empty bowl',
  Bib: 'a cute baby mealtime bib with a friendly rounded shape and a little pattern',
  Napkin: 'a single clean folded napkin', Straw: 'a colourful striped bendy drinking straw',
  Highchair: 'a cute wooden baby high chair with a little tray, for mealtime',
  Mug: 'a warm cheerful mug with a round handle',
  // clothes
  Shirt: 'a colourful t-shirt', Pants: 'a pair of blue pants', Hat: 'a cute sun hat', Socks: 'a pair of striped socks',
  // body
  Hand: 'a single open hand, palm forward', Foot: 'a single bare foot', Belly: 'a cartoon child with both hands on a round tummy',
  Hair: 'a cartoon child face with a big head of hair on top; one hand raised to the top of the head with the index fingertip resting ON the hair and touching it — the fingertip is on the hair, NOT reaching up into the empty air above the head',
  Ears: "a cartoon child's head facing forward with both ears large and clearly visible; a hand held out to the side beyond the edge of the head, to the right of the ear, one finger pointing sideways INWARD directly at the ear — clearly the ear, not the eye or cheek",
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
  Zebra: 'a cute zebra with bold BLACK AND WHITE stripes only — no other colours on its body, white body with black stripes',
  Snake: 'a cute friendly green snake curled in a smiling S shape',
  Owl: 'a cute round brown owl with big friendly eyes',
  Wolf: 'a cute fluffy grey wolf sitting, friendly and gentle',
  Goose: 'a cute white goose with an orange beak',
  Crow: 'a cute glossy black crow bird',
  Rooster: 'a cute proud rooster (cockerel) with a bright red comb and wattle, golden-brown body, and long curved dark green tail feathers, standing tall',
  // core animals (premium re-render — Phase 3)
  Dog: 'a cute happy puppy dog sitting, floppy ears and a wagging tail',
  Cat: 'a cute sitting kitten with a fluffy tail and big eyes',
  Bird: 'a cute plump little bluebird with a cheerful face',
  Fish: 'a cute round orange fish with friendly fins',
  Cow: 'a cute black-and-white spotted cow with a little pink nose',
  Duck: 'a cute fluffy yellow duckling',
  Pig: 'a cute round pink piglet with a curly tail',
  Sheep: 'a cute fluffy white sheep with a woolly coat',
  Horse: 'a cute brown pony horse with a soft flowing mane',
  Lion: 'a cute lion cub with a fluffy golden mane',
  Monkey: 'a cute brown monkey with a long curly tail',
  Elephant: 'a cute grey baby elephant with big floppy ears and a curly trunk',
  Bunny: 'a cute fluffy bunny rabbit with long floppy ears',
  Turtle: 'a cute green turtle with a friendly patterned shell',
  Bear: 'a cute round brown teddy-style bear cub',
  Frog: 'a cute smiling green frog sitting',
  Chicken: 'a cute plump hen chicken with soft white feathers and a small red comb',
  Bee: 'a cute round striped bumblebee with little wings',
  Butterfly: 'a cute butterfly with big colourful patterned wings',
  // ABC Songs words (Alphabet Friends)
  Egg: 'a single smooth white egg', Goat: 'a cute white goat with little horns',
  House: 'a single cute cartoon house with a red roof', 'Ice cream': 'a cute ice cream cone with a pink scoop',
  Jellyfish: 'a cute pink jellyfish with trailing tentacles', Kite: 'a colourful diamond kite with a tail, flying',
  Milk: 'a tall glass of white milk', Nest: "a cute bird's nest with a few little eggs",
  Queen: 'a cute friendly queen wearing a golden crown',
  Tiger: 'a cute orange tiger with black stripes', Umbrella: 'a colourful open umbrella',
  Violin: 'a cute brown violin with a bow', Whale: 'a cute blue whale spouting water',
  Xylophone: 'a colourful toy xylophone with rainbow bars', 'Yo-yo': 'a cute red yo-yo on a string',
  // school
  Pencil: 'a yellow pencil', Paper: 'a blank sheet of paper', Crayon: 'a colourful crayon', Scissors: 'child-safe scissors',
  Glue: 'a glue stick', Shape: 'a colourful circle, square and triangle together',
  // time
  Day: 'a bright daytime sky with a sun', Night: 'a dark night sky with a moon and stars', Morning: 'a sunrise over green hills',
  Afternoon: 'a high midday sun in a blue sky', Today: 'a friendly calendar page', Now: 'a simple round clock face',
  When: 'a round clock face with a thinking question mark', After: 'an arrow pointing from one clock to the next',
  // ---- fringe-page fill-out batch ----
  Boy: 'a cheerful cartoon little boy standing and waving', Girl: 'a cheerful cartoon little girl standing and waving',
  Tray: 'a food serving tray', Coat: 'a warm buttoned winter coat', Dress: 'a pretty little summer dress',
  Pyjamas: 'a cosy two-piece pyjama set',
  Knee: 'a cartoon child standing with one leg bent, the knee joint clearly circled and pointed at',
  Rainbow: 'a bright colourful rainbow arc with a little cloud', Calm: 'a calm peaceful smiling face with gently closed eyes',
  Love: 'a single big red love heart', Sick: 'a poorly sick face with a thermometer in the mouth',
  Funny: 'a silly laughing face with the tongue sticking out', Yummy: 'a happy face licking its lips, yummy',
  Leaf: 'a single fresh green leaf', Sky: 'a bright blue sky with one fluffy white cloud and a sun',
  Park: 'a friendly park scene with a tree, a bench and a swing', Backpack: 'a colourful school backpack',
  Marker: 'a chunky colourful marker pen with the cap off', Paint: 'a paint palette with bright colours and a brush',
  Sticker: 'a shiny gold star sticker', Chalk: 'a stick of white chalk beside a small chalkboard',
  Eraser: 'a pink pencil eraser', Candy: 'a colourful wrapped candy sweet with a swirly lollipop',
}

function subjectFor(word) {
  if (NUM_WORDS[word]) return `${NUM_WORDS[word]} big round colourful dots arranged neatly together`
  if (COLOURS.has(word)) return `a single large flat solid ${word.toLowerCase()}-coloured circle, centered`
  return SUBJECT[word] || `a clear simple cartoon symbol clearly representing "${word}"`
}

// Inclusivity convention: character illustrations must span skin tones (black / brown /
// white / asian), not default to light-skinned. For any character subject that doesn't
// already pin a tone, inject one that ROTATES by index so a batch comes out diverse.
const SKIN_TONES = ['warm brown', 'deep brown', 'fair', 'light golden with East Asian features', 'olive tan']
// Human children only — deliberately NOT bare "baby" (that matched "baby elephant" and
// spawned a child riding it). The People "Baby" card pins its own tone in its subject.
const isCharacter = (s) => /\b(toddler|child|children|boy|girl|kid)\b/i.test(s)
const hasTone = (s) => /\bskin\b|complexion|East Asian|light-brown|dark brown|brown skin/i.test(s)
function diversify(subject, i) {
  if (!isCharacter(subject) || hasTone(subject)) return subject
  return `${subject}, the child has ${SKIN_TONES[i % SKIN_TONES.length]} skin`
}

const ai = USE_VERTEX
  ? new GoogleGenAI({ vertexai: true, project: VERTEX_PROJECT, location: VERTEX_LOCATION })
  : new GoogleGenAI({ apiKey: KEY })
console.log(USE_VERTEX ? `auth: Vertex AI (project ${VERTEX_PROJECT}, ${VERTEX_LOCATION})` : 'auth: AI Studio API key')
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

// Target: every word whose resolved board image is missing, plus any EXTRA_WORDS
// (comma-separated) — e.g. safari animals that live in content.js, not the WORDS
// vocab (Zebra, Snake, Owl…). Their subjects come from the SUBJECT map.
const EXTRA = (process.env.EXTRA_WORDS || '').split(',').map((s) => s.trim()).filter(Boolean)
let items = [...WORDS.map((w) => w.word), ...EXTRA].map((word) => ({ word, key: outKey(word), subject: subjectFor(word) }))
const seen = new Set()
items = items.filter((r) => (seen.has(r.key) ? false : seen.add(r.key)))
if (ONLY) { const set = new Set(ONLY.split(',').map((s) => slug(s.trim()))); items = items.filter((r) => set.has(slug(r.word)) || set.has(r.key)) }

const todo = items.filter((it) => FORCE || (!existsSync(path.join(OUT_DIR, `${it.key}.png`)) && !existsSync(path.join(OUT_DIR, `${it.key}.webp`))))
const run = LIMIT ? todo.slice(0, LIMIT) : todo
console.log(`symbols to generate: ${run.length} (of ${items.length} words)`)

const results = { ok: [], failed: [] }
const QUOTA_WAIT = Number(process.env.QUOTA_WAIT_MS || 65000) // per-minute image quota reset
const MAX_RETRY = Number(process.env.QUOTA_RETRIES || 12) // wait-and-retry a 429 this many times
let stop = false
for (let i = 0; i < run.length && !stop; i++) {
  const { key, word, subject } = run[i]
  const prompt = `${STYLE} Subject: ${diversify(subject, i)}.`
  for (let attempt = 0; ; attempt++) {
    try {
      let data
      if (!MODEL) { const p = await pickModel(prompt); if (!p) throw new Error('no model produced an image'); MODEL = p.model; data = p.data }
      else data = await generate(MODEL, prompt)
      if (!data) throw new Error('no image data')
      writeFileSync(path.join(OUT_DIR, `${key}.png`), Buffer.from(data, 'base64'))
      results.ok.push(key)
      console.log(`(${i + 1}/${run.length}) ✓ ${key}.png — "${word}"`)
      break
    } catch (e) {
      const msg = String(e.message || e)
      if (/exceeded its monthly spending cap|billing/i.test(msg)) {
        console.log('\nSpending cap hit — stopping.'); results.failed.push({ key, err: msg.slice(0, 120) }); stop = true; break
      }
      // Quota 429: wait for the per-minute window to reset and retry the SAME image.
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg) && attempt < MAX_RETRY) {
        console.log(`(${i + 1}/${run.length}) …quota, waiting ${Math.round(QUOTA_WAIT / 1000)}s and retrying (${attempt + 1}/${MAX_RETRY})`)
        await sleep(QUOTA_WAIT); continue
      }
      results.failed.push({ key, err: msg.slice(0, 120) })
      console.log(`(${i + 1}/${run.length}) ✗ ${key} — ${msg.slice(0, 120)}`)
      break
    }
  }
  await sleep(Number(process.env.PACE_MS || 1500))
}
console.log(`\n=== SUMMARY ===\nmodel: ${MODEL}\nok: ${results.ok.length}  failed: ${results.failed.length}`)
if (results.failed.length) console.log('failed:', JSON.stringify(results.failed.slice(0, 12), null, 2))
