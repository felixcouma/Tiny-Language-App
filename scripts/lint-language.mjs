/*
 * Language lint (SLP guardrail) — keeps spoken output natural after Phase 1.
 * Run standalone (`node scripts/lint-language.mjs`) or via `npm run check`
 * (check-content.mjs calls runLanguageLint()).
 *
 * Rule A — contractions: no uncontracted forms in spoken output (say / every
 *   expand rung / phrase text). Natural spoken English models better.
 * Rule B — habitual 3sg -s: the full-sentence rung (expand[2]) and `say` must not
 *   use bare habitual present ("The dog runs") for a here-and-now action — use the
 *   progressive ("The dog's running"). SCOPED to say + rung 3 only: the telegraphic
 *   rung-2 ladder forms ("Dog runs") are intentionally kept and NOT flagged.
 * Rule C — function-word coverage: the core vocabulary must not be noun-dominated. It
 *   checks the four closed-class pillars (pronouns, prepositions, question words, social
 *   regulators) each carry a minimum, plus a backstop on the overall `fn` ratio. Uses the
 *   per-word `fn` tag in phraseContent.js.
 *
 * Add a string to ALLOW_A / ALLOW_B below to whitelist a deliberate exception.
 */
import { WORLDS } from '../src/data/content.js'
import { PHRASES, WORDS } from '../src/data/phraseContent.js'
import { routineSayLines } from '../src/data/routines.js'

// Rule A — uncontracted forms in spoken output.
const UNCONTRACTED = /\b(it is|that is|where is|he is|she is|they are|we are|i am|let us|do not|can not|will not)\b/i
// Rule B — habitual 3sg -s verbs (here-and-now actions should be progressive).
const THIRD_SG =
  /\b(eats|drinks|runs|hugs|plays|goes|sits|sleeps|walks|jumps|swims|crows|honks|baas|pecks|hops|climbs|flies|buzzes|slides|roars|caws|howls|hoots|oinks|kicks|throws|reads|paints|waves|points|cooks)\b/i

// Deliberate exceptions (exact spoken string). Keep this list tiny + commented.
const ALLOW_A = new Set([])
const ALLOW_B = new Set([])

// Collect spoken strings with a label for good error messages.
function collect() {
  const all = [] // { text, where, rung } — rung: 'say' | 0 | 1 | 2 | 'phrase'
  for (const w of WORLDS) {
    for (const it of w.items) {
      if (it.say) all.push({ text: it.say, where: `${w.id}/${it.word} say`, rung: 'say' })
      if (Array.isArray(it.expand)) {
        it.expand.forEach((t, i) => all.push({ text: t, where: `${w.id}/${it.word} rung${i + 1}`, rung: i }))
      }
    }
  }
  // Phrase bank (2-/3-word). Use `say` override when present (Stage 2), else the block text.
  for (const size of Object.keys(PHRASES || {})) {
    for (const e of PHRASES[size] || []) {
      const text = e.say || e.phrase
      if (text) all.push({ text, where: `phrase/${e.phrase}`, rung: 'phrase' })
    }
  }
  // Every Day with Pip — routine narration lines (new spoken content, held to A/B).
  for (const line of routineSayLines()) all.push({ text: line, where: `routine/"${line}"`, rung: 'say' })
  return all
}

export function runLanguageLint({ fail, ok } = {}) {
  const report = fail || ((m) => console.error('✗', m))
  const pass = ok || ((m) => console.log('✓', m))
  const items = collect()
  let n = 0

  // Rule A — everywhere spoken.
  for (const { text, where } of items) {
    if (ALLOW_A.has(text)) continue
    const m = text.match(UNCONTRACTED)
    if (m) { report(`[lang A/contraction] ${where}: "${text}" — uses "${m[1]}"`); n++ }
  }
  // Rule B — say + full-sentence rung only (rung index 2). Telegraphic rung 1/2 kept.
  for (const { text, where, rung } of items) {
    if (rung !== 'say' && rung !== 2) continue
    if (ALLOW_B.has(text)) continue
    const m = text.match(THIRD_SG)
    if (m) { report(`[lang B/3sg] ${where}: "${text}" — bare habitual "${m[1]}" (use progressive)`); n++ }
  }

  // Rule C — function-word coverage (uses the per-word `fn` tag). A noun-only board is
  // clinically poor: each closed-class pillar must carry a minimum, plus a ratio backstop.
  const fnWords = WORDS.filter((w) => w.fn)
  const pillars = [
    { name: 'pronouns', min: 2, has: (w) => w.category === 'People' || w.word === 'Mine' },
    { name: 'prepositions', min: 6, has: (w) => w.category === 'Where words' },
    { name: 'question words', min: 4, has: (w) => w.category === 'Questions' },
    { name: 'social regulators', min: 6, has: (w) => w.category === 'Social' },
  ]
  for (const p of pillars) {
    const count = fnWords.filter(p.has).length
    if (count < p.min) { report(`[lang C/coverage] ${p.name}: only ${count} function word(s), need ≥ ${p.min}`); n++ }
  }
  const ratio = fnWords.length / (WORDS.length || 1)
  if (ratio < 0.1) { report(`[lang C/ratio] function words are ${(ratio * 100).toFixed(1)}% of the core set — need ≥ 10% (noun-dominated)`); n++ }

  if (n === 0) pass(`language lint clean (${items.length} spoken strings; Rules A+B+C — ${fnWords.length} function words, ${(ratio * 100).toFixed(0)}%)`)
  return n
}

// Standalone run.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('lint-language.mjs')) {
  const n = runLanguageLint()
  if (n) { console.error(`\n${n} language problem(s) found.`); process.exit(1) }
  console.log('\nLanguage lint passed.')
}
