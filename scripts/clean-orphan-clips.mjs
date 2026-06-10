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
import { WORLDS } from '../src/data/content.js'
import { WORDS, PHRASES } from '../src/data/phraseContent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOUNDS = path.join(__dirname, '..', 'public', 'sounds')
const APPLY = process.argv.includes('--apply')

const slugify = (t) =>
  String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/* valid phrase slugs (must match gen-phrases.mjs) */
const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']
function gamePrompts(item) {
  const w = item.word.toLowerCase()
  const out = []
  if (item.soundLabel) {
    out.push(`Listen… ${item.soundLabel}! Where is the ${w}?`)
    out.push(`find the ${w} — listen, ${item.soundLabel}!`)
  } else if (item.action) {
    out.push(`Which one is ${w}?`); out.push(`which one is ${w}?`)
  } else {
    out.push(`Can you find the ${w}?`); out.push(`find the ${w}!`)
  }
  out.push(`Yes! ${item.word}!`)
  out.push(item.action ? `Try again. Which one is ${w}?` : `Try again. Find the ${w}.`)
  return out
}
const validPhrases = new Set()
for (const w of WORDS) validPhrases.add(slugify(w.word))
for (const size of Object.keys(PHRASES)) for (const e of PHRASES[size]) validPhrases.add(slugify(e.phrase))
for (const world of WORLDS) for (const item of world.items) (item.expand || []).forEach((t) => validPhrases.add(slugify(t)))
for (const world of WORLDS) {
  if (!POOL_IDS.includes(world.id)) continue
  for (const item of world.items) if (!item.portrait) gamePrompts(item).forEach((t) => validPhrases.add(slugify(t)))
}
;['Audrey,', 'Adriel,', 'All done! Wonderful listening!'].forEach((t) => validPhrases.add(slugify(t)))

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
