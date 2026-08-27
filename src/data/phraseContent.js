/*
 * Speech-therapy vocabulary for the Word & Phrase practice (Levels 1–3).
 * Source: VOCABULARY_CORE_200_WORDS.md (therapist-aligned core, ages 2–3).
 *
 * This is a therapeutic tool, not a game: a child taps a word and HEARS it in our
 * warm voice (device voice is the graceful fallback until clips are pre-rendered).
 *
 *   Level 1 — single words   (tap a word → hear it)            ← building vocabulary
 *   Level 2 — 2-word phrases  (tap each word, then the phrase)  ← phrase composition
 *   Level 3 — 3-word phrases  (reserved; not yet built)
 *
 * Words live in three frequency tiers. A child at Level 1 practises Tier 1 (the 50
 * highest-frequency words); more advanced children unlock Tier 2 / 3. Level 2 pairs
 * are hand-curated from these words so every combination is natural ("Go in", not
 * "Eat ball") — the focus is combining KNOWN words, not new vocabulary.
 */

import { WORLDS } from './content.js'

// Filesystem-safe key — matches slugify() in src/lib/audio.js so any future
// pre-rendered clip (public/sounds/phrases/<slug>.mp3) lines up automatically.
const keyOf = (w) =>
  String(w || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// ---- Tiers, grouped by category (a parent/therapist sees the structure). -----
// The complete VOCABULARY_CORE_200_WORDS set — every word appears exactly once.
// Every fringe page fills complete 4-col rows (multiples of 4). Verbs are the 3 themed
// pages (Move/Play/Everyday). Numbers stay in WORDS for Word Practice but are hidden from
// the AAC board (they live in Counting Mountain).
const TIER1 = {
  // Core communication — the highest-frequency social/regulatory words. These live on
  // the AAC Core board but were absent from Word Practice; a child browsing now meets
  // them too. First category = the Word Practice landing (communication before labels).
  // Social = social NICETIES only (8). The core communication words (yes/no/more/all done/
  // mine) now live on the AAC Core board (CORE_BOARD) rather than duplicating here; night-
  // night retired (covered by Time "Night" + the bedtime routine).
  Social: ['Okay', 'Please', 'Thank you', 'Hi', 'Bye', 'Uh-oh', 'Wow', 'Sorry'],
  Move: ['Go', 'Run'],
  Play: ['Play', 'Sing'],
  Everyday: ['Eat', 'Sleep', 'Stop', 'Help', 'Come', 'Sit', 'Stand', 'Look'],
  'Where words': ['In', 'On', 'Out', 'Up', 'Down', 'Here', 'There'],
  Things: ['Ball', 'Toy', 'Food', 'Water', 'Book', 'Car', 'Door', 'Bed'],
  // Animals split into Farm + Wild so each fringe page is smaller → bigger tiles.
  Farm: ['Dog', 'Cat'],
  People: ['Mama', 'Dada', 'Baby', 'Me', 'You', 'Friend', 'Boy', 'Girl', 'Sister', 'Brother', 'Grandma', 'Grandpa'],
  Feelings: ['Happy', 'Sad', 'Tired', 'Hurt'],
  Describing: ['Big', 'Small', 'Hot', 'Cold'],
}
const TIER2 = {
  Move: ['Kick', 'Throw', 'Catch', 'Jump', 'Climb', 'Slide', 'Push', 'Pull'],
  Play: ['Dance', 'Laugh', 'Hug', 'Kiss', 'Clap', 'Blow', 'Read'],
  Everyday: ['Cry', 'Splash', 'Pick', 'Drop', 'Pour', 'Drink'],
  Food: ['Apple', 'Banana', 'Orange', 'Bread', 'Cheese', 'Egg', 'Milk', 'Juice', 'Cookie', 'Candy', 'Snack', 'Rice', 'Avocado', 'Broccoli', 'Cucumber', 'Carrot', 'Meat', 'Ugali', 'Fries', 'Yoghurt'],
  Mealtime: ['Plate', 'Spoon', 'Fork', 'Bowl', 'Cup', 'Bottle', 'Bib', 'Napkin', 'Straw', 'Highchair', 'Mug', 'Tray'],
  Clothes: ['Shirt', 'Pants', 'Hat', 'Socks', 'Shoe', 'Coat', 'Dress', 'Pyjamas'],
  Body: ['Hand', 'Foot', 'Head', 'Eyes', 'Nose', 'Mouth', 'Hair', 'Belly', 'Ears', 'Teeth', 'Knee', 'Toes'],
  'Around home': ['Chair', 'Table', 'Sofa', 'Window', 'Light', 'Stairs', 'Rug', 'Pillow'],
  Toys: ['Block', 'Train', 'Truck', 'Doll', 'Puzzle', 'Swing', 'Balloon', 'Music'],
  Farm: ['Cow', 'Duck', 'Pig', 'Sheep', 'Horse', 'Bird'],
  Wild: ['Fish'],
  Colours: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White', 'Grey', 'Gold'],
  Numbers: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
  Questions: ['Want', 'Where', 'What', 'Who', 'Why', 'When', 'How', 'Can'],
}
const TIER3 = {
  Move: ['Spin', 'Bend', 'Ride', 'Roll', 'Skip', 'Hop'],
  Play: ['Peek', 'Hide', 'Find', 'Open', 'Close', 'Wave', 'Shake'],
  Everyday: ['Turn', 'Stretch'],
  Feelings: ['Excited', 'Scared', 'Angry', 'Silly', 'Quiet', 'Calm', 'Love', 'Sick'],
  'Where words': ['Under', 'Behind', 'Between', 'Next to', 'Off'],
  Describing: ['Soft', 'Hard', 'Wet', 'Dry', 'Clean', 'Dirty', 'Loud', 'Fast', 'Slow', 'Good', 'Funny', 'Yummy'],
  Nature: ['Tree', 'Flower', 'Grass', 'Sun', 'Moon', 'Star', 'Rain', 'Snow', 'Cloud', 'Rock', 'Leaf', 'Sky'],
  'Going places': ['Bus', 'Plane', 'Boat', 'Bike', 'Motorcycle', 'Helicopter', 'Home', 'Park'],
  Farm: ['Goat', 'Rooster', 'Goose', 'Bunny'],
  Wild: ['Lion', 'Monkey', 'Elephant', 'Turtle', 'Bear', 'Tiger', 'Frog', 'Zebra', 'Owl', 'Wolf', 'Crow'],
  School: ['Pencil', 'Paper', 'Crayon', 'Scissors', 'Glue', 'Shape', 'Backpack', 'Marker', 'Paint', 'Sticker', 'Chalk', 'Eraser'],
  Time: ['Day', 'Night', 'Morning', 'Afternoon', 'Today', 'Now', 'After', 'Later'],
}

// Closed-class ("function") words — pronouns, prepositions, question words, and
// social/regulatory markers. Tagged per-word because categories are mixed (in Questions,
// "Where/What/…" are function words but "Want" is a content verb). Unlocks lint Rule C
// (function-word coverage) and lets tools reason about word class.
const FN_WORDS = new Set([
  // prepositions / location
  'In', 'On', 'Out', 'Up', 'Down', 'Here', 'There', 'Under', 'Behind', 'Between', 'Next to', 'Off',
  // pronouns
  'Me', 'You', 'Mine',
  // question words + modal
  'Where', 'What', 'Who', 'Why', 'When', 'How', 'Can',
  // social / regulatory (core words now live on CORE_BOARD; Social page = niceties)
  'Yes', 'No', 'More', 'All done', 'Mine', 'Okay', 'Please', 'Thank you', 'Hi', 'Bye', 'Uh-oh', 'Wow', 'Sorry',
])

function buildTier(groups, tier) {
  return Object.entries(groups).flatMap(([category, words]) =>
    words.map((word) => ({ word, key: keyOf(word), category, tier, fn: FN_WORDS.has(word) }))
  )
}

// Every word, with { word, key, category, tier }.
export const WORDS = [...buildTier(TIER1, 1), ...buildTier(TIER2, 2), ...buildTier(TIER3, 3)]

// All category labels across the whole bank, in first-seen order (core first).
export const CATEGORIES = (() => {
  const out = []
  for (const w of WORDS) if (!out.includes(w.category)) out.push(w.category)
  return out
})()

// Every word in a category (across all tiers) — Word Practice & the Word Board pull
// from the FULL bank so each category is rich, regardless of the child's level.
export const wordsInCategory = (cat) => WORDS.filter((w) => w.category === cat)

// Fixed AAC core board — permanent positions, never shuffles, always the landing page
// of the Word Board (positions are what let a child build motor memory and let an adult
// model language on the board; Sennott, Light & McNaughton 2016). Order IS the layout
// (4 columns). SLP/AAC-editable: reorder or swap words here and the board follows.
// Final vocab + spatial layout pending SLP review.
// Function-first Core (16, a clean 4×4): the highest-frequency, most-combinable words —
// agents/requests, actions, responses, locations. Deliberately NOT the social niceties
// (those are the "Social" fringe page). `my`/`this` dropped as redundant with `mine`/`that`;
// `here`→Where-words, `turn`→Everyday, `please`/`uh-oh`→Social (they already live there).
export const CORE_BOARD = [
  'I', 'want', 'more', 'help',
  'go', 'stop', 'look', 'mine',
  'yes', 'no', 'all done', 'that',
  'up', 'down', 'in', 'on',
]

// Real illustration (public/images/<key>.webp) for a word, when one exists in the
// learning-world content. Reuses our actual WebP art — never a synthetic placeholder;
// words without a match simply render as text (like a sparse AAC board).
const WORD_IMAGE = (() => {
  const m = {}
  for (const world of WORLDS) for (const it of world.items) {
    const k = keyOf(it.word)
    if (k && it.sound && !(k in m)) m[k] = it.sound
  }
  return m
})()
// Reuse a comparable image already in the bank instead of generating a new one
// (synonyms / close concepts). Values are existing image keys that have a .webp.
const WORD_ALIAS = {
  bunny: 'rabbit', // same animal
  day: 'sun',
  night: 'moon',
  morning: 'sun',
  afternoon: 'sun',
}
// Resolve a word to an existing image key: exact content image → alias → none.
export const imageKeyFor = (word) => WORD_IMAGE[keyOf(word)] || WORD_ALIAS[keyOf(word)] || null

// Colour words render as a real coloured SWATCH (not a photo/text tile), so every colour
// on the board looks identical in size + actually shows its colour. Hexes mirror Rainbow
// Island's swatches. (Fixes blue/purple rendering larger from stray color-*.webp files.)
export const COLOR_HEX = {
  Red: '#FF3333', Orange: '#FF8C00', Yellow: '#FFD700', Green: '#32CD32', Blue: '#1E90FF',
  Purple: '#9D4EDD', Pink: '#FF69B4', Brown: '#8B4513', Black: '#2C3E50', White: '#FFFFFF',
  Grey: '#9AA3AD', Gold: '#D4AF37',
}

// (Kept for reference) words/categories scoped to a tier level. Practice now uses
// the full bank above; the tier just orders the source arrays (core words first).
export const wordsForLevel = (level) => WORDS.filter((w) => w.tier <= Math.max(1, level))
export const categoriesForLevel = (level) => {
  const out = []
  for (const w of wordsForLevel(level)) if (!out.includes(w.category)) out.push(w.category)
  return out
}

// ---- Levels 2 & 3: hand-curated natural phrases (every word drawn from above).
// Title-cased so the cubes read cleanly; the child can toggle 2 ↔ 3 words in-app.
const TWO_WORD = [
  // action + direction
  'Go In', 'Go Out', 'Go Up', 'Come Here', 'Sit Down', 'Stand Up', 'Jump Up',
  'Look Up', 'Look Out', 'Climb Up', 'Run Out',
  // action + object
  'Eat Food', 'Eat Apple', 'Eat Banana', 'Drink Milk', 'Drink Juice', 'Drink Water',
  'Play Ball', 'Kick Ball', 'Throw Ball', 'Catch Ball', 'Read Book', 'Open Door',
  'Close Door', 'Push Car', 'Pull Train', 'Hug Baby', 'Hug Mama',
  // describing + thing
  'Big Dog', 'Big Ball', 'Small Cat', 'Small Ball', 'Hot Food', 'Cold Milk', 'Cold Water',
  // more + thing
  'More Food', 'More Milk', 'More Juice', 'More Ball',
  // colour + thing
  'Red Ball', 'Blue Car', 'Yellow Duck', 'Green Ball',
  // requesting (functional — high therapy value)
  'Want Ball', 'Want Milk', 'More Apple', 'More Cookie',
  // saying no / refusing
  'No Ball', 'No More', 'No Bed',
  // joint attention (look together) — natural spoken audio, telegraphic cubes
  { blocks: 'Look Dog', say: 'Look, dog!' },
  { blocks: 'Look Cat', say: 'Look, cat!' },
  { blocks: 'Look Baby', say: 'Look, baby!' },
  // social
  'Bye Bye',
]

const THREE_WORD = [
  // action + where + thing — audio inserts the article ("on the chair")
  { blocks: 'Sit On Chair', say: 'Sit on the chair.' },
  { blocks: 'Jump On Bed', say: 'Jump on the bed.' },
  { blocks: 'Climb Up Stairs', say: 'Climb up the stairs.' },
  { blocks: 'Go In Car', say: 'Go in the car.' },
  // action + thing + direction — the particle (up/out/down) IS the concept, so it stays
  { blocks: 'Throw Ball Up', say: 'Throw the ball up.' },
  { blocks: 'Kick Ball Out', say: 'Kick the ball out.' },
  { blocks: 'Roll Ball Down', say: 'Roll the ball down.' },
  { blocks: 'Push Car Up', say: 'Push the car up.' },
  // action + describing + thing
  { blocks: 'Eat Big Apple', say: 'Eat the big apple.' },
  { blocks: 'Eat Red Apple', say: 'Eat the red apple.' },
  { blocks: 'Drink Cold Milk', say: 'Drink the cold milk.' },
  { blocks: 'Kick Big Ball', say: 'Kick the big ball.' },
  { blocks: 'Throw Small Ball', say: 'Throw the small ball.' },
  // action + more + thing — already natural spoken, left as-is
  'Eat More Food', 'Drink More Milk', 'Eat More Cookie',
  // who + action + thing — full auxiliary "is" so the morpheme is audible to a toddler
  { blocks: 'Mama Hug Baby', say: 'Mama is hugging the baby.' },
  { blocks: 'Baby Eat Food', say: 'The baby is eating.' },
  { blocks: 'Baby Drink Milk', say: 'The baby is drinking milk.' },
  { blocks: 'Dog Eat Food', say: 'The dog is eating.' },
  { blocks: 'Cat Play Ball', say: 'The cat is playing.' },
  { blocks: 'Baby Go Up', say: 'The baby is going up.' },
  { blocks: 'Baby Sit Down', say: 'The baby is sitting down.' },
  // action + describing + thing (a verb added for therapy value)
  { blocks: 'Throw Big Ball', say: 'Throw the big ball.' },
  { blocks: 'Push Blue Car', say: 'Push the blue car.' },
  { blocks: 'Ride Fast Bike', say: 'Ride the bike fast.' },
  // requesting more (functional) — natural spoken, left as-is
  'Want More Milk', 'Want More Food',
  // refusing — natural spoken, left as-is
  'No More Milk', 'No More Ball',
  // asking where — frozen wh-question frame keeps its natural contraction
  { blocks: 'Where Ball Go', say: "Where's the ball?" },
  { blocks: 'Where Mama Go', say: "Where's Mama?" },
]

// Each phrase entry carries three things: `words` (the telegraphic CUBES the child
// taps), `phrase` (the blocks string — display label + stable progress key), and
// `say` (the natural sentence the "hear them together" button SPEAKS). Plain strings
// where all three coincide; `{ blocks, say }` objects where the audio is a grammatical
// expansion of the cubes (§1.4 — telegraphic visual, natural audio).
const toEntries = (list) =>
  list.map((item) =>
    typeof item === 'string'
      ? { words: item.split(' '), phrase: item, say: item }
      : { words: item.blocks.split(' '), phrase: item.blocks, say: item.say },
  )

// Phrases keyed by word-count. The Phrase Builder toggles between these.
export const PHRASES = { 2: toEntries(TWO_WORD), 3: toEntries(THREE_WORD) }
export const PHRASE_SIZES = [2, 3]

// Levels offered in the Parent Dashboard.
export const PHRASE_LEVELS = [
  { level: 1, label: 'Level 1 · Single words', hint: 'Tap a word, hear it. Building vocabulary.' },
  { level: 2, label: 'Level 2 · Two-word phrases', hint: 'Tap each word, then hear them together.' },
  { level: 3, label: 'Level 3 · Three-word phrases', hint: 'Short sentences — opens straight to 3-word phrases.' },
]

// Sensible per-child starting levels (Adriel building vocabulary, Audrey on phrases).
export const DEFAULT_PHRASE_LEVEL = { adriel: 1, audrey: 2 }

// Readiness: a child becomes "ready for phrases" once they've heard a working
// vocabulary of distinct words. We only SUGGEST advancing — the parent/therapist
// confirms (no silent auto-promotion), matching the no-pressure therapy approach.
export const PHRASE_READY_AT = 25
export const distinctWordsHeard = (progress) => Object.keys(progress?.seen || {}).length
export const isPhraseReady = (progress) => distinctWordsHeard(progress) >= PHRASE_READY_AT
