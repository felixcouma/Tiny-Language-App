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
const TIER1 = {
  'Doing words': ['Go', 'Play', 'Eat', 'Sleep', 'Stop', 'Help', 'Come', 'Run', 'Sit', 'Stand', 'Look', 'Sing'],
  'Where words': ['In', 'On', 'Out', 'Up', 'Down', 'Here', 'There', 'Home'],
  Things: ['Ball', 'Toy', 'Food', 'Water', 'Cup', 'Shoe', 'Book', 'Car', 'Door', 'Bed'],
  Animals: ['Dog', 'Cat'],
  People: ['Mama', 'Dada', 'Baby', 'Me', 'You', 'Bye', 'Friend'],
  Feelings: ['Happy', 'Sad', 'More', 'Yes', 'No', 'All done', 'Tired', 'Hurt'],
  Describing: ['Big', 'Small', 'Hot', 'Cold'],
}
const TIER2 = {
  'Doing words': ['Kick', 'Throw', 'Catch', 'Jump', 'Dance', 'Laugh', 'Cry', 'Hug', 'Kiss', 'Clap', 'Splash', 'Climb', 'Slide', 'Push', 'Pull', 'Pick', 'Drop', 'Pour', 'Drink', 'Blow', 'Read'],
  Food: ['Apple', 'Banana', 'Bread', 'Cheese', 'Milk', 'Juice', 'Snack', 'Cookie'],
  Eating: ['Plate', 'Spoon', 'Fork', 'Bowl'],
  Clothes: ['Shirt', 'Pants', 'Hat', 'Socks'],
  Body: ['Hand', 'Foot', 'Head', 'Eyes', 'Nose', 'Mouth', 'Hair', 'Belly'],
  'Around home': ['Chair', 'Table', 'Sofa', 'Window', 'Light', 'Stairs', 'Rug', 'Pillow'],
  Toys: ['Block', 'Train', 'Truck', 'Doll', 'Puzzle', 'Swing', 'Balloon', 'Music'],
  Animals: ['Bird', 'Fish', 'Cow', 'Duck', 'Pig', 'Sheep', 'Horse'],
  Colours: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  Numbers: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
}
const TIER3 = {
  'Doing words': ['Peek', 'Hide', 'Find', 'Open', 'Close', 'Turn', 'Spin', 'Stretch', 'Bend', 'Ride', 'Roll', 'Skip', 'Hop', 'Wave', 'Shake'],
  Feelings: ['Excited', 'Scared', 'Angry', 'Silly', 'Quiet'],
  'Where words': ['Under', 'Behind', 'Between', 'Next to', 'Far'],
  Describing: ['Soft', 'Hard', 'Wet', 'Dry', 'Clean', 'Dirty', 'Loud', 'Fast', 'Slow', 'Good', 'Bad', 'Old', 'New'],
  Nature: ['Tree', 'Flower', 'Grass', 'Sun', 'Moon', 'Star', 'Rain', 'Snow', 'Cloud', 'Rock'],
  'Going places': ['Bus', 'Plane', 'Boat', 'Bike', 'Motorcycle', 'Helicopter'],
  Animals: ['Lion', 'Monkey', 'Elephant', 'Mouse', 'Bunny', 'Turtle'],
  School: ['Pencil', 'Paper', 'Crayon', 'Scissors', 'Glue', 'Shape'],
  Time: ['Day', 'Night', 'Morning', 'Afternoon', 'Today', 'Now', 'When', 'After'],
}

function buildTier(groups, tier) {
  return Object.entries(groups).flatMap(([category, words]) =>
    words.map((word) => ({ word, key: keyOf(word), category, tier }))
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
export const imageKeyFor = (word) => WORD_IMAGE[keyOf(word)] || null

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
  // social
  'Bye Bye',
]

const THREE_WORD = [
  // action + where + thing
  'Sit On Chair', 'Jump On Bed', 'Climb Up Stairs', 'Go In Car',
  // action + thing + direction
  'Throw Ball Up', 'Kick Ball Out', 'Roll Ball Down', 'Push Car Up',
  // action + describing + thing
  'Eat Big Apple', 'Eat Red Apple', 'Drink Cold Milk', 'Kick Big Ball', 'Throw Small Ball',
  // action + more + thing
  'Eat More Food', 'Drink More Milk', 'Eat More Cookie',
  // who + action + thing
  'Mama Hug Baby', 'Baby Eat Food', 'Baby Drink Milk', 'Dog Eat Food', 'Cat Play Ball',
  'Baby Go Up', 'Baby Sit Down',
  // describing + colour + thing
  'Big Red Ball', 'Small Blue Car', 'Big Yellow Duck',
]

const toEntries = (list) => list.map((phrase) => ({ words: phrase.split(' '), phrase }))

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
