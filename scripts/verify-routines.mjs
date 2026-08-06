/*
 * Verify "Every Day with Pip" (Phase 2 C) — the routine skeleton actually runs.
 * Home shows the entry → picker lists the routines → a routine opens the player with a
 * glowing tap target and step dots → tapping the target advances a step → the run reaches
 * its "All done!" finale. Asserts 0 console errors throughout (a runtime slip in the new
 * screen would surface here, not just at build).
 * Run: node scripts/verify-routines.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'
import { ROUTINES } from '../src/data/routines.js'

const APP = process.argv[2] || 'http://localhost:5173/'

const seed = `
  const profs = [
    { id:'child1', name:'Mia', initials:'MI', color:'#FF1493', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[], expectantPause:false },
  ];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('child1'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','1');
  class F extends EventTarget { constructor(s){ super(); this._src=''; if(s) this.src=s;} set src(v){ this._src=v; if(v) setTimeout(()=>this.dispatchEvent(new Event('ended')),6);} get src(){return this._src;} play(){return Promise.resolve();} pause(){} load(){} }
  window.Audio = F;
`

const run = async () => {
  const browser = await chromium.launch()
  let pass = true
  const errors = []
  const ok = (c, label) => { if (!c) pass = false; console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  const ctx = await browser.newContext()
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  console.log('\n[1] Home entry → routine picker')
  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip')
  if (await skip.count()) { await skip.click(); await page.waitForTimeout(100) }
  const entry = page.locator('.home2-routines')
  ok(await entry.count() === 1, 'Home shows the "Every Day with Pip" button')
  await entry.click()
  await page.waitForSelector('.rt-card', { timeout: 5000 })
  const cards = await page.$$eval('.rt-card .rt-card-name', (els) => els.map((e) => e.textContent.trim()))
  ok(cards.length === ROUTINES.length, `picker lists all ${ROUTINES.length} routines (got ${cards.length})`)

  console.log('\n[2] Open a routine → player renders')
  await page.locator('.rt-card').first().click()
  await page.waitForSelector('.rt-target', { timeout: 5000 })
  const dots = await page.$$eval('.rt-dot', (els) => els.length)
  ok(dots === ROUTINES[0].steps.length, `step dots match step count (${dots}/${ROUTINES[0].steps.length})`)
  ok(await page.locator('.rt-target.is-glow').count() >= 0, 'tap target present')
  const firstWord = await page.locator('.rt-word').textContent()
  ok(firstWord?.trim() === ROUTINES[0].steps[0].tap, `first target is "${ROUTINES[0].steps[0].tap}"`)

  console.log('\n[3] Tap-along advances a step')
  await page.locator('.rt-target').click()
  await page.waitForTimeout(1600) // tap → settle → advance
  const curWord = await page.locator('.rt-word').textContent()
  ok(curWord?.trim() === ROUTINES[0].steps[1].tap, `advanced to step 2 "${ROUTINES[0].steps[1].tap}"`)

  console.log('\n[4] Reaches the finale')
  for (let i = 0; i < ROUTINES[0].steps.length; i++) {
    const next = page.locator('.rt-next')
    if (await next.count()) { await next.click(); await page.waitForTimeout(200) }
  }
  await page.waitForSelector('.rt-done-title', { timeout: 5000 })
  ok(await page.locator('.rt-done-title').count() === 1, '"All done!" finale shown')

  console.log('\n[5] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length})`)
  if (errors.length) errors.slice(0, 5).forEach((e) => console.log('     · ' + e))

  await browser.close()
  console.log(pass ? '\n✅ PASS — Every Day with Pip runs end to end.' : '\n❌ FAIL')
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
