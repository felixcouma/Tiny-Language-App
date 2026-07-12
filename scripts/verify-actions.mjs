/*
 * Verify every animated "Things I Do" verb renders its OWN 2-frame loop (correct pose
 * keys), cycles between frames while on the learning stage, and throws 0 console errors.
 * Pages through the Things I Do world once and checks each item that has an animation.
 * Run (dev server up): node scripts/verify-actions.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'
import { ACTION_ANIMATIONS } from '../src/data/actionAnimations.js'

const APP = process.argv[2] || 'http://localhost:5173/'

// word (as shown on the stage) → sound key, for every animated verb.
const VERBS = [
  ['Washing hands', 'do-washing'], ['Eating', 'do-eating'], ['Drinking', 'do-drinking'],
  ['Sleeping', 'do-sleeping'], ['Walking', 'do-walking'], ['Running', 'do-running'],
  ['Jumping', 'do-jumping'], ['Laughing', 'do-laughing'], ['Clapping', 'do-clapping'],
  ['Hugging', 'do-hugging'], ['Dancing', 'do-dancing'], ['Brushing teeth', 'do-brushing'],
  ['Riding a bike', 'do-riding'], ['Blowing bubbles', 'do-blowing'], ['Climbing stairs', 'do-climbing'],
  ['Playing with toys', 'do-playing'], ['Kicking a ball', 'do-kicking'], ['Reading a book', 'do-reading'],
  ['Waving', 'do-waving'], ['Swimming', 'do-swimming'],
]

const SEED = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','1');
`

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  let pass = true
  const ok = (c, label) => { if (!c) pass = false; console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.world-card', { hasText: 'Things I Do' }).click()
  await page.waitForSelector('.l2-word', { timeout: 5000 })
  const nextBtn = page.locator('.l2-playbar .arrow').last()

  for (const [word, key] of VERBS) {
    const cfg = ACTION_ANIMATIONS[key]
    // Page forward until this verb is on the stage.
    let found = false
    for (let i = 0; i < 40; i++) {
      const cur = ((await page.locator('.l2-word').textContent()) || '').trim()
      if (cur === word) { found = true; break }
      await nextBtn.click(); await page.waitForTimeout(180)
    }
    console.log(`\n[${word}]`)
    if (!found) { ok(false, 'reached on stage'); continue }
    const frames = page.locator('.act-anim .act-anim-frame')
    ok((await frames.count()) === cfg.frames.length, `${cfg.frames.length} frames rendered`)
    const srcs = await frames.evaluateAll((els) => els.map((e) => e.getAttribute('src').split('/').pop().replace('.webp', '')))
    ok(srcs.join(',') === cfg.frames.join(','), `correct pose keys (${srcs.join(', ')})`)
    // Sample the loop: the visible (is-on) frame should change over time.
    const seen = new Set()
    for (let i = 0; i < 14; i++) {
      await page.waitForTimeout(140)
      const on = await page.locator('.act-anim .act-anim-frame.is-on').first().getAttribute('src').catch(() => '')
      if (on) seen.add(on.split('/').pop())
    }
    ok(seen.size >= 2, `cycled both frames (${[...seen].join(', ')})`)
  }

  ok(errors.length === 0, `0 console errors${errors.length ? ': ' + errors[0] : ''}`)
  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — action animations verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
