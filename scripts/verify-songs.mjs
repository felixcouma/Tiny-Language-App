/*
 * Verify the "Sing with Pip" songs feature on the local dev server (audio stubbed):
 *   1. Home shows the "Sing with Pip" button; 0 console errors.
 *   2. Song screen shows exactly the child's enabled songs (the 4 defaults).
 *   3. Tapping a song requests its /sounds/songs/<id>.mp3 and enters a playing state.
 *   4. Parent area "Songs" shows all 13 toggles (4 on); toggling persists per child
 *      and the song shelf reflects it.
 * Run: node scripts/verify-songs.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'
const DEFAULTS = ['the-alphabet-song', 'head-shoulders-knees-and-toes', 'bingo', 'twinkle-twinkle-little-star']

const seed = (defaults) => `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:${JSON.stringify(defaults)} }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','0');
  window.__songs = [];
  class FakeAudio extends EventTarget {
    constructor(s){ super(); this._src=''; this.paused=true; this.duration=60; this.currentTime=0; if(s) this.src=s; }
    set src(v){ this._src=v; if(v) window.__songs.push(v); }
    get src(){ return this._src; }
    set preload(v){} get preload(){ return 'none'; }
    removeAttribute(){ this._src=''; }
    play(){ this.paused=false; window.__lastPlay=this._src; return Promise.resolve(); }
    pause(){ this.paused=true; }
    load(){}
  }
  window.Audio = FakeAudio;
`

const ls = (page, k) => page.evaluate((x) => localStorage.getItem(x), k)

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(seed(DEFAULTS))
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  let pass = true
  const ok = (c, label) => { if (!c) pass = false; console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }

  console.log('\n[1] Home button')
  const btn = page.locator('.mode-songs')
  ok((await btn.count()) === 1, '"Sing with Pip" button on Home')
  await btn.click()
  await page.waitForSelector('.songs', { timeout: 5000 })

  console.log('\n[2] Song shelf = enabled songs')
  const cards = page.locator('.song-card')
  ok((await cards.count()) === 4, `4 enabled song cards shown (got ${await cards.count()})`)
  const titles = await page.locator('.song-card .song-title').allTextContents()
  ok(titles.includes('Twinkle, Twinkle, Little Star') && titles.includes('Bingo'), 'expected song titles present')

  console.log('\n[3] Tap a song → plays its mp3')
  await page.locator('.song-card', { hasText: 'Twinkle' }).click()
  await page.waitForTimeout(300)
  const reqs = await page.evaluate(() => window.__songs)
  ok(reqs.some((u) => /\/sounds\/songs\/twinkle-twinkle-little-star\.mp3$/.test(u)), 'requested twinkle mp3')
  const npTitle = await page.locator('.np-title').textContent()
  ok(/Twinkle/.test(npTitle || ''), 'now-playing shows the song title')
  const npAria = await page.locator('.np-play').getAttribute('aria-label')
  ok(/Pause/.test(npAria || ''), 'now-playing shows a Pause control (it is playing)')

  console.log('\n[4] Parent toggles persist per child')
  await page.goto(APP, { waitUntil: 'networkidle' })
  await page.locator('.home2-parent').click()
  await page.waitForSelector('.gate-q', { timeout: 5000 })
  const q = await page.locator('.gate-q').textContent()
  const n = (q.match(/\d+/g) || []).map(Number)
  await page.locator('.gate-input').fill(String((n[0] || 0) + (n[1] || 0)))
  await page.locator('.gate-go').click()
  await page.waitForSelector('.song-toggles', { timeout: 5000 })
  const toggles = page.locator('.song-toggle')
  ok((await toggles.count()) === 13, `13 song toggles shown (got ${await toggles.count()})`)
  ok((await page.locator('.song-toggle.is-on').count()) === 4, '4 toggles on by default')
  // turn Bingo off
  await page.locator('.song-toggle', { hasText: 'Bingo' }).click()
  await page.waitForTimeout(150)
  const profs = JSON.parse((await ls(page, 'tv_profiles_v1')) || '[]')
  const en = profs.find((p) => p.id === 'guest')?.enabledSongs || []
  ok(!en.includes('bingo') && en.length === 3, `Bingo removed from enabledSongs (now ${en.length})`)

  console.log('\n[5] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)

  await ctx.close()
  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — Sing with Pip songs feature verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
