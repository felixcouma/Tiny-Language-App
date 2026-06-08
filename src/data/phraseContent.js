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

// Filesystem-safe key — matches slugify() in src/lib/audio.js so any future
// pre-rendered clip (public/sounds/phrases/<slug>.mp3) lines up automatically.
const keyOf = (w) =>
  String(w || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// ---- Tiers, grouped by category (a parent/therapist sees the structure). -----
const TIER1 = {
  'Doing words': ['Go', 'Play', 'Eat', 'Sleep', 'Stop', 'Help', 'Come', 'Run', 'Sit', 'Look', 'Sing'],
  'Where words': ['In', 'On', 'Out', 'Up', 'Down', 'Here', 'There', 'Home'],
  Things: ['Ball', 'Toy', 'Food', 'Water', 'Cup', 'Shoe', 'Book', 'Car', 'Door', 'Bed'],
  Animals: ['Dog', 'Cat'],
  People: ['Mama', 'Dada', 'Baby', 'Me', 'You'],
  Feelings: ['Happy', 'Sad', 'More', 'Yes', 'No', 'Tired', 'Hurt'],
  Describing: ['Big', 'Small', 'Hot', 'Cold'],
}
const TIER2 = {
  'Doing words': ['Kick', 'Throw', 'Catch', 'Jump', 'Dance', 'Laugh', 'Cry', 'Hug', 'Clap', 'Push', 'Pull', 'Drink', 'Pour'],
  Food: ['Apple', 'Banana', 'Bread', 'Cheese', 'Milk', 'Juice', 'Snack', 'Cookie'],
  Body: ['Hand', 'Foot', 'Head', 'Eyes', 'Nose', 'Mouth', 'Hair', 'Belly'],
  Things: ['Plate', 'Spoon', 'Bowl', 'Shirt', 'Pants', 'Hat', 'Socks', 'Chair', 'Table', 'Light'],
  Toys: ['Block', 'Train', 'Truck', 'Doll', 'Balloon'],
  Animals: ['Bird', 'Fish', 'Cow', 'Duck', 'Pig', 'Sheep', 'Horse'],
  Colours: ['Red', 'Blue', 'Yellow', 'Green'],
}
const TIER3 = {
  'Doing words': ['Hide', 'Find', 'Open', 'Close', 'Ride', 'Roll', 'Wave', 'Shake'],
  Nature: ['Tree', 'Flower', 'Sun', 'Moon', 'Star', 'Rain', 'Snow'],
  'Going places': ['Bus', 'Plane', 'Boat', 'Bike'],
  Animals: ['Lion', 'Monkey', 'Elephant', 'Bunny', 'Turtle'],
  Numbers: ['One', 'Two', 'Three', 'Four', 'Five'],
  Describing: ['Soft', 'Wet', 'Clean', 'Fast', 'Slow', 'Good'],
  'Where words': ['Under', 'Behind', 'Far', 'Close'],
}

function buildTier(groups, tier) {
  return Object.entries(groups).flatMap(([category, words]) =>
    words.map((word) => ({ word, key: keyOf(word), category, tier }))
  )
}

// Every word, with { word, key, category, tier }.
export const WORDS = [...buildTier(TIER1, 1), ...buildTier(TIER2, 2), ...buildTier(TIER3, 3)]

// Words available to a child at a given practice level (higher = more vocabulary).
export const wordsForLevel = (level) => WORDS.filter((w) => w.tier <= Math.max(1, level))

// Distinct category labels, in first-seen order, for the words available at a level.
export const categoriesForLevel = (level) => {
  const out = []
  for (const w of wordsForLevel(level)) if (!out.includes(w.category)) out.push(w.category)
  return out
}

// ---- Level 2: hand-curated natural 2-word phrases (all words drawn from above).
export const LEVEL2_PAIRS = [
  ['Go', 'In'],
  ['Go', 'Out'],
  ['Go', 'Up'],
  ['Come', 'Here'],
  ['Sit', 'Down'],
  ['Eat', 'Food'],
  ['Drink', 'Milk'],
  ['Play', 'Ball'],
  ['Kick', 'Ball'],
  ['Throw', 'Ball'],
  ['Read', 'Book'],
  ['Open', 'Door'],
  ['Hug', 'Baby'],
  ['More', 'Juice'],
  ['Big', 'Dog'],
  ['Hot', 'Food'],
].map(([a, b]) => ({ a, b, phrase: `${a} ${b}` }))

// Levels offered in the Parent Dashboard. Level 3 is reserved (selectable once built).
export const PHRASE_LEVELS = [
  { level: 1, label: 'Level 1 · Single words', hint: 'Tap a word, hear it. Building vocabulary.' },
  { level: 2, label: 'Level 2 · Two-word phrases', hint: 'Tap two words, then hear them together.' },
  { level: 3, label: 'Level 3 · Sentences', hint: 'Three-word phrases — coming soon.', soon: true },
]

// Sensible per-child starting levels (Adriel building vocabulary, Audrey on phrases).
export const DEFAULT_PHRASE_LEVEL = { adriel: 1, audrey: 2 }
