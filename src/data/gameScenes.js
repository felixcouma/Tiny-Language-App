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

const ITEM = new Map() // sound key -> item
const WORLD_OF = new Map() // sound key -> world id (the "type" for distractors)
for (const w of WORLDS) for (const it of w.items) if (it.sound) { ITEM.set(it.sound, it); WORLD_OF.set(it.sound, w.id) }

export const itemByKey = (k) => ITEM.get(k)

export const SCENES = [
  {
    id: 'farm',
    title: 'Old MacDonald’s Farm',
    grad: 'linear-gradient(135deg,#7CB342 0%,#C0CA33 100%)',
    // Farm animals all carry a REAL recorded sound, so each round plays the actual
    // moo/oink/quack before "Where's the cow?" — the song frames the whole scene.
    intro: 'Old MacDonald had a farm! Ee-eye-ee-eye-oh! Let’s find his animals.',
    outro: 'Ee-eye-ee-eye-oh! You found all the animals!',
    items: ['cow', 'duck', 'pig', 'horse', 'sheep', 'chicken', 'dog', 'cat', 'rooster'],
    find: ['cow', 'duck', 'pig', 'horse', 'sheep'],
  },
  {
    id: 'snack',
    title: 'Snack Time',
    grad: 'linear-gradient(135deg,#FF8A65 0%,#FFD54F 100%)',
    intro: 'Let’s help set the table!',
    outro: 'Yummy! Time to eat!',
    items: ['apple', 'banana', 'home-milk', 'home-cup', 'home-spoon', 'cookie', 'juice', 'bread', 'egg', 'cheese', 'do-eating', 'do-drinking'],
    find: ['apple', 'home-spoon', 'home-milk', 'do-eating', 'cookie'],
  },
  {
    id: 'park',
    title: 'At the Park',
    grad: 'linear-gradient(135deg,#4FC3F7 0%,#AED581 100%)',
    intro: 'Let’s play at the park!',
    outro: 'What fun! Time to go home.',
    items: ['do-running', 'do-jumping', 'do-kicking', 'do-climbing', 'do-swimming'],
    find: ['do-running', 'do-jumping', 'do-kicking', 'do-climbing'],
  },
  {
    id: 'body',
    title: 'Head to Toes',
    grad: 'linear-gradient(135deg,#FF6B6B 0%,#FFB6C6 100%)',
    // Framed by "Head, Shoulders, Knees & Toes" — the body-parts counterpart to Old
    // MacDonald. The find order follows the song for a familiar, singable arc.
    intro: 'Head, shoulders, knees and toes! Let’s find them!',
    outro: 'Eyes and ears and mouth and nose! You found them all!',
    items: ['body-head', 'body-hair', 'body-eyes', 'body-ears', 'body-nose', 'body-mouth', 'body-teeth', 'body-hands', 'body-fingers', 'body-tummy', 'body-knees', 'body-feet', 'body-toes'],
    find: ['body-head', 'body-knees', 'body-toes', 'body-eyes', 'body-nose'],
  },
]

// Every intro/outro line the scenes speak — exported so gen-tts + the audio-coverage
// guard cover them (like NAME_CUES). One source of truth.
export const SCENE_LINES = SCENES.flatMap((s) => [s.intro, s.outro])

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

// Build a fresh session: always include the Farm (the showpiece) + one other scene,
// order randomised, flattened to an ordered list of round-specs the game plays
// start-to-finish with intro/outro beats.
export function buildSession() {
  const farm = SCENES.find((s) => s.id === 'farm')
  const other = shuffle(SCENES.filter((s) => s.id !== 'farm'))[0]
  const chosen = shuffle([farm, other].filter(Boolean))
  const rounds = []
  for (const scene of chosen) {
    scene.find.forEach((key, i) => {
      const target = ITEM.get(key)
      if (!target) return
      rounds.push({ target, sceneItems: scene.items, scene, first: i === 0, last: i === scene.find.length - 1 })
    })
  }
  return rounds
}
