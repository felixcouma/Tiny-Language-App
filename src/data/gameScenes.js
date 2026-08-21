/*
 * Mini-scene catalog for the Listening Game (and Twin Mode).
 *
 * Instead of one random bag of unrelated items, a session runs 2 tiny CONTEXTS
 * ("Old MacDonald's Farm", "Snack Time", "At the Park"). Each scene is a coherent
 * bag of items + an ordered list of `find` targets + Pip's intro/outro. Distractors
 * are drawn WITHIN the scene (same type as the target), so every round stays on-
 * theme — apples sit next to spoons, not next to elephants. Contextualised vocabulary
 * sticks far better for toddlers, and the intro→play→payoff arc makes it memorable.
 *
 * The prompt clips ("Where's the cow?") already exist (src/data/gamePrompt.js); the
 * only new audio is the intro/outro lines (SCENE_LINES) — one source of truth so the
 * clip generator + the coverage guard cover them.
 */
import { WORLDS } from './content.js'
import { findPrompt } from './gamePrompt.js'

const ITEM = new Map() // sound key -> item
const WORLD_OF = new Map() // sound key -> world id (the "type" for distractors)
// Keep the FIRST occurrence: some animal keys (cow/dog/lion/bee/…) appear in both
// Safari and Music Forest; overwriting would split a scene's distractor "type" across
// two worlds. Safari precedes Music Forest, so first-wins keeps every animal one type.
for (const w of WORLDS) for (const it of w.items) if (it.sound && !ITEM.has(it.sound)) { ITEM.set(it.sound, it); WORLD_OF.set(it.sound, w.id) }

export const itemByKey = (k) => ITEM.get(k)

// Each scene = a coherent POOL of items + how many `rounds` to play from it. Targets are
// sampled at random from the pool every session (see buildSession), and the 3 distractors
// are drawn fresh within the pool each round — so no two plays show the same cards, and a
// deep pool (Farm 9, Counting 20) is fully used, not a fixed handful.
export const SCENES = [
  {
    id: 'farm',
    title: 'Old MacDonald’s Farm',
    grad: 'linear-gradient(135deg,#7CB342 0%,#C0CA33 100%)',
    // Farm animals all carry a REAL recorded sound, so each round plays the actual
    // moo/oink/quack before "Where's the cow?" — the song frames the whole scene.
    intro: 'Old MacDonald had a farm! Ee-eye-ee-eye-oh! Let’s find his animals.',
    outro: 'Ee-eye-ee-eye-oh! You found all the animals!',
    rounds: 5,
    items: ['cow', 'duck', 'pig', 'horse', 'sheep', 'chicken', 'dog', 'cat', 'rooster'],
  },
  {
    id: 'snack',
    title: 'Snack Time',
    grad: 'linear-gradient(135deg,#FF8A65 0%,#FFD54F 100%)',
    intro: 'Let’s help set the table!',
    outro: 'Yummy! Time to eat!',
    rounds: 5,
    items: ['apple', 'banana', 'home-milk', 'home-cup', 'home-spoon', 'cookie', 'juice', 'bread', 'egg', 'cheese', 'do-eating', 'do-drinking'],
  },
  {
    id: 'park',
    title: 'At the Park',
    grad: 'linear-gradient(135deg,#4FC3F7 0%,#AED581 100%)',
    intro: 'Let’s play at the park!',
    outro: 'What fun! Time to go home.',
    rounds: 5,
    items: ['do-running', 'do-jumping', 'do-kicking', 'do-climbing', 'do-swimming', 'do-throwing', 'do-riding', 'do-playing'],
  },
  {
    id: 'body',
    title: 'Head to Toes',
    grad: 'linear-gradient(135deg,#FF6B6B 0%,#FFB6C6 100%)',
    // Framed by "Head, Shoulders, Knees & Toes" — the body-parts counterpart to Old MacDonald.
    intro: 'Head, shoulders, knees and toes! Let’s find them!',
    outro: 'Eyes and ears and mouth and nose! You found them all!',
    rounds: 5,
    items: ['body-head', 'body-hair', 'body-eyes', 'body-ears', 'body-nose', 'body-mouth', 'body-teeth', 'body-hands', 'body-fingers', 'body-tummy', 'body-knees', 'body-feet', 'body-toes'],
  },
  {
    id: 'zoo',
    title: 'The Zoo',
    grad: 'linear-gradient(135deg,#26A69A 0%,#9CCC65 100%)',
    // Wild counterpart to the Farm — the mammals carry a REAL recorded sound (roar/etc.).
    intro: 'We’re going to the zoo! Let’s find the animals.',
    outro: 'What a wild day at the zoo!',
    rounds: 5,
    items: ['lion', 'elephant', 'monkey', 'bear', 'zebra', 'wolf', 'snake', 'turtle'],
  },
  {
    id: 'counting',
    title: '1, 2, 3!',
    grad: 'linear-gradient(135deg,#1E90FF 0%,#87CEEB 100%)',
    intro: 'Let’s count together! Can you find the numbers?',
    outro: 'One, two, three — you found them! Hooray!',
    rounds: 5,
    items: Array.from({ length: 20 }, (_, i) => `number-${i + 1}`), // full 1–20 pool
  },
  {
    id: 'fruits',
    title: 'Fruits & Veggies',
    grad: 'linear-gradient(135deg,#66BB6A 0%,#FFCA28 100%)',
    intro: 'Let’s fill the basket! Find the fruits and veggies.',
    outro: 'Yum! A basket full of good food!',
    rounds: 5,
    items: ['apple', 'banana', 'avocado', 'broccoli', 'carrot', 'cucumber'],
  },
  {
    id: 'dance',
    title: 'Dance Party',
    grad: 'linear-gradient(135deg,#AB47BC 0%,#FF7043 100%)',
    // Joyful action scene — "If you're happy and you know it": who's clapping/dancing/…?
    intro: 'It’s a dance party! Let’s move and groove!',
    outro: 'What a fun dance party!',
    rounds: 5,
    items: ['do-clapping', 'do-dancing', 'do-jumping', 'do-waving', 'do-hugging', 'do-laughing'],
  },
  {
    id: 'morning',
    title: 'Good Morning!',
    grad: 'linear-gradient(135deg,#FFB74D 0%,#FFF176 100%)',
    // "This is the way…" — the getting-ready routine as find-it (wake / brush / dress / eat).
    intro: 'Good morning! Let’s get ready for the day.',
    outro: 'All ready — let’s go!',
    rounds: 5,
    items: ['do-waking', 'do-brushing', 'do-getting', 'do-washing', 'do-eating'],
  },
]

// Every intro/outro line the scenes speak — exported so gen-tts + the audio-coverage
// guard cover them (like NAME_CUES). One source of truth.
export const SCENE_LINES = SCENES.flatMap((s) => [s.intro, s.outro])

// Since ANY pool item can now be a target, every pool item's find-it question AND its
// praise word ("Cow!") must have a clip — else a random target would chime. These feed
// gen-tts + the coverage guard (de-duped by slug); most already exist from the base game.
const SCENE_ITEMS = [...new Set(SCENES.flatMap((s) => s.items))].map((k) => ITEM.get(k)).filter(Boolean)
export const SCENE_PROMPTS = SCENE_ITEMS.map((it) => findPrompt(it))
export const SCENE_PRAISE = SCENE_ITEMS.map((it) => `${it.word}!`)

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Distractors for a scene round: same type (world) as the target, from the scene's own
// items first, topped up from that world's wider pool only if the scene runs short.
export function sceneDistractors(target, sceneItemKeys, count) {
  const type = WORLD_OF.get(target.sound)
  const inScene = sceneItemKeys
    .map((k) => ITEM.get(k))
    .filter((it) => it && it.sound !== target.sound && WORLD_OF.get(it.sound) === type)
  let picks = shuffle(inScene).slice(0, count)
  if (picks.length < count) {
    const used = new Set([target.sound, ...picks.map((p) => p.sound)])
    const pool = WORLDS.find((w) => w.id === type)?.items.filter((it) => it.sound && !it.portrait && !used.has(it.sound)) || []
    picks = picks.concat(shuffle(pool).slice(0, count - picks.length))
  }
  return picks
}

// Build a fresh session: 2 DISTINCT scenes picked at random, in random order — so play
// never opens on the same scene twice in a row. Flattened to an ordered list of round-
// specs the game plays start-to-finish with intro/outro beats.
export function buildSession() {
  const chosen = shuffle(SCENES).slice(0, 2)
  const rounds = []
  for (const scene of chosen) {
    const n = Math.min(scene.rounds || 5, scene.items.length)
    const targets = shuffle(scene.items).slice(0, n).map((k) => ITEM.get(k)).filter(Boolean)
    targets.forEach((target, i) => {
      rounds.push({ target, sceneItems: scene.items, scene, first: i === 0, last: i === targets.length - 1 })
    })
  }
  return rounds
}
