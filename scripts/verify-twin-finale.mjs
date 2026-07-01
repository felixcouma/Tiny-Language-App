/*
 * Verify §10 — the cooperative "we did it!" Twin Mode finale — on the dev server:
 *   Two named children → Twin Mode → play to the end → the done screen is
 *   twin-aware: "You did it together!" naming BOTH children, no winner. 0 errors.
 * Run: node scripts/verify-twin-finale.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

const seed = `
  const profs = [
    { id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[] },
    { id:'child1', name:'Mia', initials:'M', color:'#FF1493', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[] },
    { id:'child2', name:'Leo', initials:'L', color:'#1E90FF', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[] },
  ];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('child1'));
  localStorage.setItem('tv_child_count_v1','2');
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

  console.log('\n[1] Twin Mode available + reaches a twin finale')
  const twinBtn = page.locator('.mode-twin')
  ok((await twinBtn.count()) === 1, 'Twin Mode button shown (2 children)')
  await twinBtn.click()
  await page.waitForSelector('.choice', { timeout: 5000 })
  const won = await winGame(page)
  ok(won, 'reached the done screen')

  console.log('\n[2] Finale is cooperative (both names, no winner)')
  ok((await page.locator('.game-done.is-twin').count()) === 1, 'done screen is twin-aware (.is-twin)')
  const title = (await page.locator('.done-title').textContent().catch(() => '')) || ''
  ok(/did it together/i.test(title), `title is a shared payoff (got "${title.trim()}")`)
  const sub = (await page.locator('.done-sub').textContent().catch(() => '')) || ''
  ok(/Mia/.test(sub) && /Leo/.test(sub), `both children named (got "${sub.replace(/\s+/g, ' ').trim()}")`)
  ok(/teamwork/i.test(sub) && !/winner|win\b|beat/i.test(sub), 'framed as teamwork, no winner')

  console.log('\n[3] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)

  await ctx.close()
  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — cooperative Twin Mode finale verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
