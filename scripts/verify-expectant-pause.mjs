/*
 * Verify §11 — the per-child expectant pause — on the dev server:
 *   1. Parent area "Wait time" toggle persists expectantPause per child.
 *   2. OFF (default): the Learning screen speaks the word promptly on arrival.
 *   3. ON: the word is NOT spoken for a few seconds (the expectant window); tapping
 *      the picture speaks it immediately. 0 console errors.
 * Run: node scripts/verify-expectant-pause.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

const seed = (expectant) => `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:${expectant} }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','0');
  window.__snd = [];
  class FakeAudio extends EventTarget {
    constructor(s){ super(); this._src=''; if(s) this.src=s; }
    set src(v){ this._src=v; if(v){ if(/\\/sounds\\//.test(v)) window.__snd.push(v); setTimeout(()=>this.dispatchEvent(new Event('ended')), 6); } }
    get src(){ return this._src; }
    play(){ return Promise.resolve(); } pause(){} load(){}
  }
  window.Audio = FakeAudio;
`

const ls = (page, k) => page.evaluate((x) => localStorage.getItem(x), k)
const sndCount = (page) => page.evaluate(() => window.__snd.length)

const run = async () => {
  const browser = await chromium.launch()
  let pass = true
  const ok = (c, label) => { if (!c) pass = false; console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }
  const errors = []

  // ---- 1. Parent toggle persists ----
  {
    const ctx = await browser.newContext()
    await ctx.addInitScript(seed(false))
    const page = await ctx.newPage()
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(APP, { waitUntil: 'networkidle' })
    const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
    await page.locator('.home2-parent').click()
    await page.waitForSelector('.gate-q', { timeout: 5000 })
    const q = await page.locator('.gate-q').textContent()
    const n = (q.match(/\d+/g) || []).map(Number)
    await page.locator('.gate-input').fill(String((n[0] || 0) + (n[1] || 0)))
    await page.locator('.gate-go').click()
    await page.waitForSelector('.parent-main', { timeout: 5000 })
    console.log('\n[1] Parent "Wait time" toggle')
    const onBtn = page.locator('.voice-option', { hasText: 'pause first' })
    ok((await onBtn.count()) > 0, 'Wait time toggle present')
    await onBtn.click()
    await page.waitForTimeout(150)
    const profs = JSON.parse((await ls(page, 'tv_profiles_v1')) || '[]')
    ok(profs.find((p) => p.id === 'guest')?.expectantPause === true, 'toggling On persists expectantPause=true')
    await ctx.close()
  }

  // ---- 2. OFF → speaks promptly ----
  {
    const ctx = await browser.newContext()
    await ctx.addInitScript(seed(false))
    const page = await ctx.newPage()
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(APP, { waitUntil: 'networkidle' })
    const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
    await page.locator('.world-card').first().click()
    await page.waitForSelector('.l2-word', { timeout: 5000 })
    await page.waitForTimeout(1200)
    console.log('\n[2] Expectant pause OFF (default)')
    ok((await sndCount(page)) >= 1, 'word spoken promptly (<1.2s) on arrival')
    await ctx.close()
  }

  // ---- 3. ON → silent window, then tap speaks ----
  {
    const ctx = await browser.newContext()
    await ctx.addInitScript(seed(true))
    const page = await ctx.newPage()
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(APP, { waitUntil: 'networkidle' })
    const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
    await page.locator('.world-card').first().click()
    await page.waitForSelector('.l2-word', { timeout: 5000 })
    await page.waitForTimeout(1500)
    console.log('\n[3] Expectant pause ON')
    ok((await sndCount(page)) === 0, 'no word spoken during the expectant window (~1.5s in)')
    await page.locator('.l2-word-btn').click()
    await page.waitForTimeout(300)
    ok((await sndCount(page)) >= 1, 'tapping the picture speaks it immediately')
    await ctx.close()
  }

  console.log('\n[4] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)

  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — expectant pause verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
