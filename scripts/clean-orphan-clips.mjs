/*
 * Remove orphaned audio clips — files on disk whose text/key no longer exists in
 * the content (left behind when a `say`/phrase line was reworded). Mirrors the
 * valid-set logic of gen-phrases.mjs / gen-audio.mjs so it only ever deletes
 * clips nothing references.
 *
 *   node scripts/clean-orphan-clips.mjs            # list orphans (dry run)
 *   node scripts/clean-orphan-clips.mjs --apply    # delete them
 */
import { readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS, PRAISE } from '../src/data/content.js'
import { WORDS, PHRASES, CORE_BOARD } from '../src/data/phraseContent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOUNDS = path.join(__dirname, '..', 'public', 'sounds')
const APPLY = process.argv.includes('--apply')

const slugify = (t) =>
  String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/* valid phrase slugs (must match gen-phrases.mjs) */
const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']
// MUST mirror SoundGameScreen/TwinModeScreen buildPrompt (same strings → valid slugs).
const PROMPT_CUE = { Zebra: 'Black and white stripes', Butterfly: 'Pretty wings', Turtle: 'Slow and steady', Elephant: 'Ppprrrr, ppprrrr' }
function gamePrompts(item) {
  const w = item.word.toLowerCase()
  const out = []
  if (item.soundLabel) out.push(`${PROMPT_CUE[item.word] || item.soundLabel}! Where's the ${w}?`)
  else if (item.action) out.push(item.word === 'Peekaboo' ? "Who's playing peekaboo?" : `Who's ${w}?`)
  else out.push(`Where's the ${w}?`)
  out.push(`Yes! ${item.word}!`)
  out.push(item.action ? `Try again. Which one is ${w}?` : `Try again. Find the ${w}.`)
  return out
}
const validPhrases = new Set()
for (const w of WORDS) validPhrases.add(slugify(w.word))
for (const w of CORE_BOARD) validPhrases.add(slugify(w)) // AAC core board words
for (const size of Object.keys(PHRASES)) for (const e of PHRASES[size]) validPhrases.add(slugify(e.phrase))
for (const world of WORLDS) for (const item of world.items) (item.expand || []).forEach((t) => validPhrases.add(slugify(t)))
for (const world of WORLDS) {
  if (!POOL_IDS.includes(world.id)) continue
  for (const item of world.items) if (!item.portrait) gamePrompts(item).forEach((t) => validPhrases.add(slugify(t)))
}
// Hardcoded spoken cues that aren't derived from content/phrases — keep them.
;['Audrey,', 'Adriel,', 'Ethan', 'Ezra', 'Leila', 'Your turn!', 'All done! Wonderful listening!'].forEach((t) => validPhrases.add(slugify(t)))
PRAISE.forEach((t) => validPhrases.add(slugify(t))) // rotating praise clips (correct-answer feedback)
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((t) => validPhrases.add(slugify(t))) // letter buttons
for (const world of WORLDS) { // phonics "which one starts with X?" prompts
  if (!POOL_IDS.includes(world.id)) continue
  for (const item of world.items) if (!item.portrait) {
    validPhrases.add(slugify(`Which one starts with ${item.word[0].toUpperCase()}? Where's the ${item.word.toLowerCase()}?`))
  }
}

/* valid voice keys (must match gen-audio.mjs): item.sound for any item with spoken text */
const validVoice = new Set()
for (const world of WORLDS) for (const item of world.items) {
  if (item.sound && (item.say || item.word)) validVoice.add(item.sound)
}
// body-head ships as the storybook-voice sample (playStorybookSample) — keep it.
validVoice.add('body-head')

const listMp3 = (dir) => {
  try { return readdirSync(path.join(SOUNDS, dir)).filter((f) => f.endsWith('.mp3')) } catch { return [] }
}

let removed = 0
const sweep = (dir, valid) => {
  const orphans = listMp3(dir).filter((f) => !valid.has(f.replace(/\.mp3$/, '')))
  console.log(`\n${dir}/  — ${orphans.length} orphan(s)`)
  for (const f of orphans) {
    console.log(`  ${APPLY ? 'deleted' : 'orphan'}: ${dir}/${f}`)
    if (APPLY) { unlinkSync(path.join(SOUNDS, dir, f)); removed++ }
  }
}

sweep('phrases', validPhrases)
for (const v of ['aoede', 'leda', 'sulafat']) sweep(v, validVoice)

console.log(`\n${APPLY ? `Removed ${removed} file(s).` : 'Dry run — re-run with --apply to delete.'}`)
