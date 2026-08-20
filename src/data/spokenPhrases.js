import { WORLDS, PRAISE, PRAISE_TEMPLATES, PRAISE_LIGHT, RETRY_AGAIN, RETRY_MODEL } from './content.js'
import { WORDS, CORE_BOARD, PHRASES } from './phraseContent.js'
import { routineSayLines, routineTapWords } from './routines.js'
import { gamePrompts } from './gamePrompt.js'
import { ALL_NAMES, nameCue } from './names.js'
import { SCENE_LINES } from './gameScenes.js'

// Worlds whose items become listening-game / phonics rounds.
export const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']

// Twin Mode cues that aren't content-derived: a "calling" clip per baked child name
// (src/data/names.js — comma stripped by slugify, so Name, → name.mp3), the generic
// turn cue and the shared finale. The name catalog is the single source (audio.js +
// the clip generator import it too).
export const NAME_CUES = [...ALL_NAMES.map(nameCue), 'Your turn!', 'All done! Wonderful listening!']

// EVERY phrase the app speaks via voice() that needs a pre-rendered clip — ONE source of
// truth for the clip generator (gen-tts), the orphan cleaner (clean-orphan) AND the
// audio-coverage guard, so they can never drift. De-dup is left to the caller (by slug).
export function spokenTexts() {
  const out = []
  const add = (t) => out.push(t)
  for (const w of WORDS) add(w.word)
  for (const w of CORE_BOARD) add(w) // AAC core board words (some aren't in WORDS)
  routineSayLines().forEach(add) // Every Day with Pip — routine narration lines
  routineTapWords().forEach(add) // routine tap-target words (Bath/Soap/Towel/body parts)
  for (const size of Object.keys(PHRASES)) for (const e of PHRASES[size]) add(e.say || e.phrase) // §1.4 natural sentence
  for (const world of WORLDS) for (const item of world.items) (item.expand || []).forEach(add) // ladder rungs
  for (const world of WORLDS) {
    if (!POOL_IDS.includes(world.id)) continue
    for (const item of world.items) if (!item.portrait) gamePrompts(item).forEach(add) // find-it prompt + praise + retry
  }
  NAME_CUES.forEach(add)
  SCENE_LINES.forEach(add) // mini-scene intro/outro lines (Old MacDonald / Snack / Park)
  PRAISE.forEach(add)
  PRAISE_TEMPLATES.forEach(add)
  PRAISE_LIGHT.forEach(add)
  add(RETRY_AGAIN)
  add(RETRY_MODEL)
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(add) // letter buttons
  for (const world of WORLDS) {
    if (!POOL_IDS.includes(world.id)) continue
    for (const item of world.items) if (!item.portrait) {
      add(`Which one starts with ${item.word[0].toUpperCase()}? Where's the ${item.word.toLowerCase()}?`) // phonics
    }
  }
  return out
}
