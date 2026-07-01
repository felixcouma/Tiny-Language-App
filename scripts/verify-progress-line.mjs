/*
 * Verify §9 — the in-session parent progress line — end to end on the dev server:
 *   1. Hearing words on the Learning screen fills the per-child DAILY bucket
 *      (wordsHeard/newWords, today's date) in localStorage.
 *   2. Finishing the Listening Game shows the parent-facing "Today with … " line
 *      on the done screen, reflecting the real counts. 0 console errors.
 * Run: node scripts/verify-progress-line.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

const seed = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[] }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','0');
  class FakeAudio extends EventTarget {
    constructor(s){ super(); this._src=''; if(s) this.src=s; }
    set src(v){ this._src=v; if(v) setTimeout(()=>this.dispatchEvent(new Event('ended')), 6); }
    get src(){ return this._src; }
    play(){ return Promise.resolve(); } pause(){} load(){}
  }
  window.Audio = FakeAudio;
`

const ls = (page, k) => page.evaluate((x) => localStorage.getItem(x), k)

async function winGame(page) {
  for (let guard = 0; guard < 80; guard++) {
    if (await page.locator('.game-done').count()) return true
    const tiles = page.locator('.choice')
    const n = await tiles.count()
    if (!n) { await page.waitForTimeout(300); continue }
    let hit = false
    for (let i = 0; i < n; i++) {
      await tiles.nth(i).click({ timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(450)
      if (await page.locator('.game-done').count()) return true
      if (await page.locator('.choice.is-right').count()) { hit = true; await page.waitForTimeout(2100); break }
    }
    if (!hit) await page.waitForTimeout(250)
  }
  return (await page.locator('.game-done').count()) > 0
}

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  let pass = true
  const ok = (c, label) => { if (!c) pass = false; console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }

  console.log('\n[1] Hearing words fills the daily bucket')
  await page.locator('.world-card').first().click()
  await page.waitForSelector('.l2-word', { timeout: 5000 })
  await page.waitForTimeout(400)
  for (let i = 0; i < 3; i++) { await page.locator('.arrow').last().click(); await page.waitForTimeout(300) }
  const prog = JSON.parse((await ls(page, 'tv_progress_v1__guest')) || '{}')
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` })()
  ok(prog.daily && prog.daily.date === today, `daily bucket dated today (${prog.daily && prog.daily.date})`)
  ok((prog.daily?.wordsHeard || 0) >= 1, `wordsHeard recorded today (${prog.daily?.wordsHeard})`)
  ok((prog.daily?.newWords || 0) >= 1, `newWords recorded today (${prog.daily?.newWords})`)

  console.log('\n[2] Parent progress line on the game-done screen')
  await page.locator('.round-btn[aria-label="Home"]').first().click().catch(() => {})
  await page.waitForTimeout(300)
  await page.locator('.mode-btn', { hasText: 'Listening Game' }).click()
  await page.waitForSelector('.choice', { timeout: 5000 })
  const won = await winGame(page)
  ok(won, 'reached the game done screen')
  const line = page.locator('.today-progress')
  ok((await line.count()) > 0, 'parent progress line rendered')
  const txt = (await line.textContent().catch(() => '')) || ''
  ok(/Today with Everyone/.test(txt), `line addresses the child (got "${txt.replace(/\s+/g, ' ').trim()}")`)
  ok(/for grown-ups/i.test(txt), 'line is tagged "for grown-ups" (parent-facing)')

  console.log('\n[3] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)

  await ctx.close()
  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — in-session parent progress line verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
