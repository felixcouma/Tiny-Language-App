/*
 * Regression test for the "Things I Do" action animations.
 *
 * WHY THIS SHAPE: an earlier bug shipped where verbs showed only a still frame on any
 * device with "Reduce Motion" on (the loop froze under prefers-reduced-motion). The old
 * test only ran with motion ENABLED, so it passed and the bug went unnoticed. This test
 * now runs a MATRIX — {desktop, mobile} × {motion on, reduce} — and asserts every verb
 * actually CYCLES its frames in each combo. Reduce-motion is a first-class case here.
 *
 * For each context: open Things I Do, page through the verbs, and for each assert
 *   (a) both frames render with the correct pose keys, and
 *   (b) the visible (is-on) frame CHANGES over time (i.e. it animates, not frozen).
 * Plus 0 console errors per context. The full verb list runs in the primary context;
 * the reduce/mobile contexts run a representative subset (the freeze was global, so a
 * subset reliably catches it) — pass --full to run every verb in every context.
 *
 * Run (server up): node scripts/verify-actions.mjs [url] [--full]
 */
import { chromium, devices } from 'playwright'
import { ACTION_ANIMATIONS } from '../src/data/actionAnimations.js'

const args = process.argv.slice(2)
const APP = args.find((a) => a.startsWith('http')) || 'http://localhost:5173/'
const FULL = args.includes('--full')

// word (as shown on the stage) → sound key, for every animated verb. Keep in sync with
// content.js doing[]. A mismatch vs ACTION_ANIMATIONS is itself a failure (caught below).
const VERBS = [
  ['Washing hands', 'do-washing'], ['Eating', 'do-eating'], ['Drinking', 'do-drinking'],
  ['Sleeping', 'do-sleeping'], ['Walking', 'do-walking'], ['Running', 'do-running'],
  ['Jumping', 'do-jumping'], ['Laughing', 'do-laughing'], ['Clapping', 'do-clapping'],
  ['Hugging', 'do-hugging'], ['Dancing', 'do-dancing'], ['Brushing teeth', 'do-brushing'],
  ['Riding a bike', 'do-riding'], ['Blowing bubbles', 'do-blowing'], ['Climbing stairs', 'do-climbing'],
  ['Playing with toys', 'do-playing'], ['Kicking a ball', 'do-kicking'], ['Reading a book', 'do-reading'],
  ['Waving', 'do-waving'], ['Swimming', 'do-swimming'], ['Crying', 'do-crying'],
  ['Painting', 'do-painting'], ['Throwing a ball', 'do-throwing'], ['Cooking', 'do-cooking'],
  ['Peekaboo', 'do-peekaboo'], ['Waking up', 'do-waking'], ['Pointing', 'do-pointing'],
  ['Getting dressed', 'do-getting'],
]

// A representative subset (boy solo, girl solo, both-together, a fast one, a slow one) for
// the secondary contexts — the reduced-motion freeze was global, so this reliably catches it.
const SUBSET = new Set(['do-running', 'do-blowing', 'do-hugging', 'do-sleeping', 'do-peekaboo', 'do-pointing'])

const CONTEXTS = [
  { label: 'desktop · motion ON', opts: { viewport: { width: 1280, height: 900 } }, full: true },
  { label: 'desktop · REDUCE motion', opts: { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' } },
  { label: 'mobile (iPhone 13) · REDUCE motion', opts: { ...devices['iPhone 13'], reducedMotion: 'reduce' } },
  { label: 'mobile (iPhone 13) · motion ON', opts: { ...devices['iPhone 13'] } },
  { label: 'Android (Pixel 7) · REDUCE motion', opts: { ...devices['Pixel 7'], reducedMotion: 'reduce' } },
]

const SEED = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1'); localStorage.setItem('tv_onboarded','true'); localStorage.setItem('tv_muted','1');`

// Sample the visible frame until it changes (animating) or a generous timeout (frozen).
// Reduce-motion runs at a >=1s cadence, so allow ~4s before calling it frozen.
async function animates(page) {
  const seen = new Set()
  for (let i = 0; i < 30; i++) {
    const on = await page.locator('.act-anim .act-anim-frame.is-on').first().getAttribute('src').catch(() => '')
    if (on) seen.add(on.split('/').pop())
    if (seen.size >= 2) return { ok: true, seen }
    await page.waitForTimeout(140)
  }
  return { ok: false, seen }
}

async function runContext(browser, ctxDef, results) {
  const list = FULL || ctxDef.full ? VERBS : VERBS.filter(([, k]) => SUBSET.has(k))
  const ctx = await browser.newContext(ctxDef.opts)
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  console.log(`\n=== ${ctxDef.label}  (${list.length} verbs) ===`)
  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.world-card', { hasText: 'Things I Do' }).click()
  await page.waitForSelector('.l2-word', { timeout: 8000 })
  const nextBtn = page.locator('.l2-playbar .arrow').last()

  for (const [word, key] of list) {
    const cfg = ACTION_ANIMATIONS[key]
    const ok = (c, label) => { if (!c) results.fails.push(`[${ctxDef.label}] ${word}: ${label}`); return c }
    let found = false
    for (let i = 0; i < 40; i++) {
      const cur = ((await page.locator('.l2-word').textContent()) || '').trim()
      if (cur === word) { found = true; break }
      await nextBtn.click(); await page.waitForTimeout(150)
    }
    if (!ok(found, 'reached on stage') || !ok(!!cfg, 'has an animation config')) { console.log(`  XX ${word}`); continue }
    const frames = page.locator('.act-anim .act-anim-frame')
    const nFrames = await frames.count()
    const keysOk = ok(nFrames === cfg.frames.length, `frame count (${nFrames}/${cfg.frames.length})`)
    const srcs = await frames.evaluateAll((els) => els.map((e) => e.getAttribute('src').split('/').pop().replace('.webp', '')))
    ok(srcs.join(',') === cfg.frames.join(','), `pose keys (${srcs.join(', ')})`)
    const anim = await animates(page)
    const cycOk = ok(anim.ok, `should ANIMATE but stayed frozen on {${[...anim.seen].join(', ')}}`)
    console.log(`  ${keysOk && cycOk ? 'OK ' : 'XX '} ${word}${cycOk ? '' : '  <-- FROZEN / not cycling'}`)
  }
  const errOk = errors.length === 0
  if (!errOk) results.fails.push(`[${ctxDef.label}] ${errors.length} console error(s): ${errors[0]}`)
  console.log(`  ${errOk ? 'OK ' : 'XX '} 0 console errors`)
  await ctx.close()
}

const run = async () => {
  const browser = await chromium.launch()
  const results = { fails: [] }
  for (const ctxDef of CONTEXTS) await runContext(browser, ctxDef, results)
  await browser.close()
  console.log('\n--------------------------------------------------')
  if (results.fails.length) {
    console.log(`❌ FAIL — ${results.fails.length} problem(s):`)
    for (const f of results.fails) console.log(`   • ${f}`)
    process.exit(1)
  }
  console.log('✅ PASS — action animations cycle in every context (incl. Reduce Motion, mobile, Android).')
  process.exit(0)
}
run().catch((e) => { console.error(e); process.exit(2) })
