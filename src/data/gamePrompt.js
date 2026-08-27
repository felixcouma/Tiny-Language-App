import { hasFx } from './fxKeys.js'

// The listening-game spoken prompts — ONE source of truth, imported by both game screens
// (SoundGame / TwinMode) AND the clip generator + orphan cleaner. Previously this lived in
// FOUR mirrored copies that had to be hand-synced; keeping them identical is what made the
// clips generate (and not get pruned). Now there is nothing to drift.
export const PROMPT_CUE = { Butterfly: 'Pretty wings', Turtle: 'Slow and steady' }

// Plural nouns take "Where ARE the …?" not "Where's the …?" — grammatically correct
// adult-model speech (the telegraphic phrase cubes stay simplified by design; only the
// spoken prompts are corrected).
const PLURAL = new Set([
  'eyes', 'ears', 'hands', 'fingers', 'knees', 'toes', 'feet', 'teeth',
  'socks', 'pants', 'pyjamas', 'shoes', 'glasses', 'stairs',
])

// The single "find it" question the game speaks for an item.
export function findPrompt(item) {
  const w = item.word.toLowerCase()
  // Numbers read as "Where's the number three?" (not "Where's the three?").
  if (String(item.sound || '').startsWith('number-')) return `Where's the number ${w}?`
  if (item.soundLabel) {
    // fx-animals: the game plays the REAL trumpet/oink/… → just ask the question.
    if (hasFx(item.sound)) return `Where's the ${w}?`
    return `${PROMPT_CUE[item.word] || item.soundLabel}! Where's the ${w}?`
  }
  // Actions can't be "found" — narrate the doer ("Who's jumping?").
  if (item.action) return item.word === 'Peekaboo' ? "Who's playing peekaboo?" : `Who's ${w}?`
  return PLURAL.has(w) ? `Where are the ${w}?` : `Where's the ${w}?`
}

// Every spoken string a game round can produce for an item (prompt + praise + retry) —
// used by clip-gen / orphan-clean / coverage so all its clips exist.
export function gamePrompts(item) {
  const w = item.word.toLowerCase()
  return [
    findPrompt(item),
    `Yes! ${item.word}!`,
    item.action ? `Try again. Which one is ${w}?` : `Try again. Find the ${w}.`,
  ]
}
