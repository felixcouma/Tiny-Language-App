/*
 * Generate docs/PHRASES_REVIEW.md — a clinically-framed inventory of EVERY spoken
 * line in the app, for a speech-language pathologist (SLP) to review for the twins.
 * Pure read. Re-run after any content change:  node scripts/list-phrases.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS, PRAISE } from '../src/data/content.js'
import { WORDS, PHRASES, CATEGORIES, wordsInCategory } from '../src/data/phraseContent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'docs', 'PHRASES_REVIEW.md')

const L = []
const w = (s = '') => L.push(s)

const totalItems = WORLDS.reduce((n, world) => n + world.items.length, 0)

/* ---------------- Intro framing for the SLP ---------------- */
w('# TinyVoice Twins — Spoken Language Inventory')
w('')
w('> **For speech-language pathologist review.** Every line the child *hears* in the app, so you')
w('> can judge whether the vocabulary, phrase structures, and progression suit each twin.')
w('> Auto-generated from the app content (`scripts/list-phrases.mjs`) — always matches what ships.')
w('')
w('## The approach (how language is targeted)')
w('- **Sound-first.** The child hears every word and phrase in a warm, consistent human-style voice')
w('  (no robotic text-to-speech). Pictures support comprehension; nothing relies on reading.')
w('- **A word → sentence ladder** on each item: the single **word**, then a **2-word** phrase, then a')
w('  **3-word** phrase, then a short **sentence** — modelling expansion without pressure.')
w('- **Per-child level.** Each twin has a stage: **Word Practice** (single words) graduates to')
w('  **Phrase Builder** (2- and 3-word combinations) once ~25 distinct words are heard.')
w('  *Current setup: Adriel → words, Audrey → phrases.*')
w('- **No scores, no failure.** A wrong tap gives a gentle "try again", never a penalty.')
w('')
w(`**At a glance:** ${WORDS.length} core words · ${PHRASES[2].length} two-word + ${PHRASES[3].length} three-word`
  + ` phrase models · ${totalItems} learning items across ${WORLDS.length} worlds.`)
w('')
w('---')

/* ---------------- Core vocabulary by category ---------------- */
w('')
w('## 1. Core vocabulary — Word Practice / Phrase Builder / Word Board')
w(`The functional single-word set the twins practise (${WORDS.length} words), grouped by category.`)
w('')
for (const cat of CATEGORIES) {
  const list = wordsInCategory(cat).map((x) => x.word)
  if (list.length) w(`- **${cat}** (${list.length}): ${list.join(', ')}`)
}

/* ---------------- Phrase combinations ---------------- */
w('')
w('## 2. Phrase combinations (modelled in Phrase Builder)')
w(`Natural word combinations the child hears and builds — every word drawn from the core set above.`)
w('')
w('The child taps **telegraphic cubes** (e.g. `Baby` `Eat` `Food`) but the “hear them together”')
w('button speaks the **natural sentence** — shown below (cubes noted where they differ).')
w('')
const phraseLine = (p) => (p.say && p.say !== p.phrase ? `“${p.say}” *(cubes: ${p.phrase})*` : `“${p.phrase}”`)
w(`### Two-word phrases (${PHRASES[2].length})`)
w(PHRASES[2].map(phraseLine).join(' · '))
w('')
w(`### Three-word phrases (${PHRASES[3].length})`)
w(PHRASES[3].map(phraseLine).join(' · '))

/* ---------------- Learning worlds: word, sentence, ladder, IPA ---------------- */
w('')
w('## 3. Spoken lines by world (Learning)')
w('Each item: the **word**, the **sentence** the child hears, the **expansion ladder**, and the')
w('pronunciation reference (IPA) where defined — how the word sounds, not an articulation target. Source: `src/data/content.js`.')
for (const world of WORLDS) {
  w('')
  w(`### ${world.name} (${world.items.length})`)
  for (const it of world.items) {
    const say = it.say || (it.soundLabel ? `(animal sound: ${it.soundLabel})` : '')
    const ipa = it.ipa ? `  \`${it.ipa}\`` : ''
    w(`- **${it.word}**${ipa} — “${say}”`)
    if (it.expand?.length) w(`  - ladder: ${it.expand.map((p) => `“${p}”`).join(' → ')}`)
  }
}

/* ---------------- Game prompts (mirror the actual templates) ---------------- */
w('')
w('## 4. Game & listening prompts')
w('What the child hears in the **Listening Game**, **Twin Mode**, and **Letter Sounds** (phonics).')
w('Mirrors the in-app templates. Source: `SoundGame`/`TwinMode`/`Phonics` via `ChoiceGame`.')
const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']
w('')
w('### Find-it prompts (one example shown per item; the child also hears “Yes! …” and “Try again …”)')
for (const world of WORLDS) {
  if (!POOL_IDS.includes(world.id)) continue
  for (const it of world.items) {
    if (it.portrait) continue
    const wd = it.word.toLowerCase()
    let prompt
    if (it.soundLabel) prompt = `Listen… ${it.soundLabel}! Where is the ${wd}?`
    else if (it.action) prompt = `Which one is ${wd}?` // action words can't be "found"
    else prompt = `Can you find the ${wd}?`
    w(`- **${it.word}**: “${prompt}”`)
  }
}
w('')
w('### Phonics prompts (Letter Sounds)')
w('Pattern: “Which one starts with **&lt;letter&gt;**? Find the **&lt;word&gt;**!” — e.g.')
const phonicsEx = WORLDS.filter((x) => POOL_IDS.includes(x.id))
  .flatMap((x) => x.items).filter((it) => !it.portrait).slice(0, 5)
for (const it of phonicsEx) {
  w(`- “Which one starts with ${it.word[0].toUpperCase()}? Find the ${it.word.toLowerCase()}!”`)
}
w('- …one per pictured item; the child also hears each **letter A–Z** on its own.')

/* ---------------- Feedback & scaffolding language ---------------- */
w('')
w('## 5. Feedback & encouragement language')
w('- **Praise on a correct answer (rotating):** ' + PRAISE.map((p) => `“${p}”`).join(' · ')
  + ' — followed by the word.')
w('- **Turn-taking by name:** “Audrey,” / “Adriel,” before a prompt.')
w('- **Gentle retry:** “Try again. Find the …” / “Try again. Which one is …”')
w('- **Session close:** “All done! Wonderful listening!”')

w('')
w('---')
w('_Generated from the live app content — re-run `node scripts/list-phrases.mjs` after any change._')

writeFileSync(OUT, L.join('\n') + '\n')
console.log(`Wrote ${OUT} (${L.length} lines).`)
