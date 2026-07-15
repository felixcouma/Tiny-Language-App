/*
 * Regression test for Auto Play (Learning screen). Guards three things that broke before:
 *   A) it ADVANCES through the world on its own,
 *   B) it STOPS at the last item instead of LOOPING back to the start, and
 *   C) at the end, an animated "Things I Do" verb SETTLES — its loop freezes on the calm
 *      base frame instead of moving forever.
 * (The bug: store.next() wraps with % length, and Auto Play called it, so it looped forever;
 *  and the last verb kept animating after Auto Play stopped.)
 * Runs muted — playItem resolves instantly when muted but still marks the word played, so
 * auto-advance still fires. Run (server up): node scripts/verify-autoplay.mjs [url]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'
const GAP = 2500 // must match LearningScreen's auto-advance gap
const SEED = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1'); localStorage.setItem('tv_onboarded','true'); localStorage.setItem('tv_muted','1');`

const word = (page) => page.locator('.l2-word').textContent().then((t) => (t || '').trim())

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  const fails = []
  const ok = (c, label) => { if (!c) fails.push(label); console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.world-card').first().click()
  await page.waitForSelector('.l2-word', { timeout: 8000 })
  const auto = page.locator('.l2-auto')
  const prev = page.locator('.l2-playbar .arrow').first()

  // A) advances on its own: from item 0, enable Auto Play, expect the word to change.
  const first = await word(page)
  await auto.click()
  await page.waitForTimeout(GAP + 1500)
  const afterAdvance = await word(page)
  ok(afterAdvance !== first, `Auto Play advances ("${first}" -> "${afterAdvance}")`)
  await auto.click() // stop
  await page.waitForTimeout(300)

  // B) stops at the end (no loop): go home, reopen (itemIndex resets), step to the LAST
  // item via one Prev (wraps backward), enable Auto Play, and confirm it does NOT wrap
  // back to the first item — it should stay put and switch itself off.
  await page.locator('.round-btn[aria-label="Home"]').click()
  await page.waitForTimeout(200)
  await page.locator('.world-card').first().click()
  await page.waitForSelector('.l2-word', { timeout: 8000 })
  const start = await word(page)
  await prev.click() // wrap to the last item
  await page.waitForTimeout(300)
  const last = await word(page)
  ok(last !== start, `reached the last item via Prev ("${last}")`)
  await auto.click() // enable Auto Play while on the last item
  await page.waitForTimeout(GAP + 2000)
  const afterEnd = await word(page)
  ok(afterEnd === last, `Auto Play STOPS at the end, no loop (want "${last}", got "${afterEnd}"${afterEnd === start ? ' — LOOPED back to first!' : ''})`)

  // C) at the end, an animated verb SETTLES — its loop freezes instead of moving forever.
  // Open "Things I Do", step to the last verb (an action animation), confirm it's cycling,
  // then let Auto Play run to the end and confirm the frames stop on the calm base frame.
  await page.locator('.round-btn[aria-label="Home"]').click()
  await page.waitForTimeout(200)
  await page.locator('.world-card', { hasText: 'Things I Do' }).click()
  await page.waitForSelector('.l2-word', { timeout: 8000 })
  await prev.click() // wrap to the last verb
  await page.waitForSelector('.act-anim-frame', { timeout: 8000 })
  await page.waitForTimeout(300)

  // Sample the "on" frame over time; >1 distinct src = cycling, exactly 1 = frozen.
  const sampleFrames = async (ms) => {
    const seen = new Set()
    for (let i = 0; i < Math.ceil(ms / 200); i++) {
      const src = await page.locator('.act-anim-frame.is-on').first().getAttribute('src').catch(() => '')
      if (src) seen.add(src.split('/').pop())
      await page.waitForTimeout(200)
    }
    return seen
  }
  const firstFrame = (await page.locator('.act-anim-frame').first().getAttribute('src')).split('/').pop()
  ok((await sampleFrames(2000)).size >= 2, 'last verb is animating (cycling) before the end')
  await auto.click() // enable Auto Play on the last verb
  await page.waitForTimeout(GAP + 2000) // let it reach the end and stop
  const frozen = await sampleFrames(1600)
  ok(frozen.size === 1, `verb animation FREEZES at the end (saw ${[...frozen].join(', ') || 'none'})`)
  ok(frozen.size === 1 && frozen.has(firstFrame), `frozen on the calm base frame (${firstFrame})`)

  ok(errors.length === 0, `0 console errors${errors.length ? ': ' + errors[0] : ''}`)
  await browser.close()
  console.log(`\n${fails.length ? '❌ FAIL' : '✅ PASS'} — Auto Play (advance + stop-at-end + verb settles).`)
  process.exit(fails.length ? 1 : 0)
}
run().catch((e) => { console.error(e); process.exit(2) })
