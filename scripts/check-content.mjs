/*
 * Content sanity checks — run with `node scripts/check-content.mjs`.
 * Pure data validation (no browser needed). Exits non-zero on any problem.
 */
import { WORLDS, getWorld, photoWorlds } from '../src/data/content.js'
import { runLanguageLint } from './lint-language.mjs'
import { runCssScopeCheck } from './verify-css-scope.mjs'
import { runAudioCoverageCheck } from './verify-audio-coverage.mjs'
import { runAssetIntegrityCheck } from './verify-assets.mjs'
import { runSettingsSyncCheck } from './verify-settings-sync.mjs'

let errors = 0
const fail = (msg) => {
  console.error('✗', msg)
  errors++
}
const ok = (msg) => console.log('✓', msg)

// 1. Worlds well-formed and unique
const ids = new Set()
for (const w of WORLDS) {
  if (!w.id || ids.has(w.id)) fail(`world id missing/duplicate: ${w.id}`)
  ids.add(w.id)
  if (!w.name || !w.grad || !w.color) fail(`world ${w.id} missing name/grad/color`)
  if (!Array.isArray(w.items) || w.items.length === 0) fail(`world ${w.id} has no items`)
}
ok(`${WORLDS.length} worlds, all with unique ids and items`)

// 2. Every item is well-formed
let itemCount = 0
for (const w of WORLDS) {
  for (const it of w.items) {
    itemCount++
    const where = `${w.id} / ${it.word}`
    if (!it.word) fail(`item with no word in ${w.id}`)
    if (!it.say && !it.soundLabel) fail(`${where}: nothing to speak (say/soundLabel)`)
    if (!it.color) fail(`${where}: missing color`)
    if (it.expand && !Array.isArray(it.expand)) fail(`${where}: expand is not an array`)
    // photo items (not colour swatch / number / family portrait) need a wiki title
    const isPhoto = it.numeral == null && !it.swatch && !it.portrait
    if (isPhoto && !it.wiki && !it.image) fail(`${where}: photo item missing wiki/image`)
  }
}
ok(`${itemCount} items, all well-formed`)

// 3. Counting Mountain = 1..20
const counting = getWorld('counting-mountain')
const nums = counting.items.map((i) => i.numeral)
if (nums.length !== 20 || nums.some((n, i) => n !== i + 1)) fail('counting-mountain is not 1..20')
else ok('counting-mountain is 1..20 with quantity')

// 4. Rainbow Island items all have a hex swatch
const rainbow = getWorld('rainbow-island')
if (rainbow.items.some((i) => !/^#[0-9a-f]{6}$/i.test(i.swatch || '')))
  fail('rainbow-island has an item without a valid hex swatch')
else ok(`rainbow-island: ${rainbow.items.length} valid colour swatches`)

// 5. Game pool is big enough for 4-choice rounds with photos
const pool = WORLDS.filter((w) => photoWorlds.includes(w.id))
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)
if (pool.length < 8) fail(`game pool too small (${pool.length})`)
else ok(`game pool has ${pool.length} photo items (enough for 4-choice rounds)`)

// 6. Language lint (SLP guardrail) — contractions + habitual-3sg (see lint-language.mjs)
errors += runLanguageLint({ fail, ok })

// 7. CSS scope guard — no className used in one code-split screen but defined only in
// another's CSS chunk (would render unstyled). See verify-css-scope.mjs.
errors += runCssScopeCheck({ fail, ok })

// 8. Audio coverage — every phrase the app speaks has a clip (else a silent chime).
errors += runAudioCoverageCheck({ fail, ok })

// 9. Asset integrity — animation frames / routine images / fx files all exist.
errors += runAssetIntegrityCheck({ fail, ok })

// 10. Per-child settings sync — every cloud-synced setting is in the child seed.
errors += runSettingsSyncCheck({ fail, ok })

if (errors) {
  console.error(`\n${errors} problem(s) found.`)
  process.exit(1)
}
console.log('\nAll content checks passed.')
