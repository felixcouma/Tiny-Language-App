/*
 * Verify the Home Village foods (speech-therapy "action talk" mealtime words) are
 * fully wired: every food has a content card with a spoken `say` script, a real WebP
 * image at its key, and a warm voice clip in ALL THREE voices (aoede/leda/sulafat) —
 * so a food card always shows a picture and speaks (never a synthetic placeholder /
 * device voice). Pure file + data check; no browser needed. Exits non-zero on a gap.
 */
import { WORLDS } from '../src/data/content.js'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const VOICES = ['aoede', 'leda', 'sulafat']

// The mealtime foods added to Home Village (keyed by their content `sound`).
const FOOD_KEYS = [
  'apple', 'banana', 'avocado', 'broccoli', 'cucumber', 'carrot', 'rice', 'ugali',
  'bread', 'egg', 'meat', 'food-chicken', 'food-fish', 'fries', 'cheese', 'yoghurt',
  'juice', 'bottle', 'water', 'snack', 'cookie',
]

const home = WORLDS.find((w) => w.id === 'home-village')
const items = home.items.filter((i) => FOOD_KEYS.includes(i.sound))
let bad = 0
for (const k of FOOD_KEYS) {
  const it = items.find((i) => i.sound === k)
  const img = existsSync(path.join(ROOT, 'public', 'images', `${k}.webp`))
  const clips = VOICES.map((v) => existsSync(path.join(ROOT, 'public', 'sounds', v, `${k}.mp3`)))
  const ok = it && it.say && img && clips.every(Boolean)
  if (!ok) bad++
  console.log(
    `${ok ? 'OK ' : 'XX '} ${k.padEnd(13)} card=${!!it} say=${!!(it && it.say)} ` +
      `img=${img} clips=${clips.filter(Boolean).length}/3  "${it ? it.word : '—'}"`,
  )
}
console.log(
  `\nfoods in Home Village: ${items.length}/${FOOD_KEYS.length} — ` +
    `${bad ? `${bad} INCOMPLETE` : 'all complete (cards + images + 3-voice clips)'}`,
)
process.exit(bad ? 1 : 0)
