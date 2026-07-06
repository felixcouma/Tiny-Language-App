/*
 * Verify the "I'm a Little Teapot" animation renders the teapot CHARACTER (not the
 * child role-play) and cycles its poses on the dev server:
 *   1. The song opens in animated mode with all 5 teapot pose frames present.
 *   2. On play the active pose moves through the teapot poses (body/handle/spout/
 *      steam/tip) and the karaoke caption shows the lyric. 0 console errors.
 * Run: node scripts/verify-teapot.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'
const seed = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:['im-a-little-teapot'], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','0');
  class FakeAudio extends EventTarget {
    constructor(s){ super(); this._src=''; this.paused=true; this.duration=40; this.currentTime=0; this._t=null; if(s) this.src=s; }
    set src(v){ this._src=v; this.currentTime=0; } get src(){ return this._src; }
    set preload(v){} removeAttribute(){ this._src=''; }
    play(){ this.paused=false; clearInterval(this._t); this._t=setInterval(()=>{ this.currentTime+=0.2; this.dispatchEvent(new Event('timeupdate')); }, 60); return Promise.resolve(); }
    pause(){ this.paused=true; clearInterval(this._t); } load(){}
  }
  window.Audio = FakeAudio;
`

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
  await page.locator('.mode-songs').click()
  await page.waitForSelector('.song-card', { timeout: 5000 })

  console.log('\n[1] Teapot song shows the pose animation')
  await page.locator('.song-card', { hasText: 'Teapot' }).click()
  await page.waitForTimeout(300)
  ok((await page.locator('.now-playing.is-animated').count()) === 1, 'now-playing is in animated mode')
  ok((await page.locator('.song-anim').count()) === 1, 'SongAnimation rendered (not just Pip)')
  ok((await page.locator('.song-anim-pose').count()) === 5, 'all 5 teapot pose frames present')
  // every frame is a teapot pose — no leftover child "ready" frame
  const srcs = await page.locator('.song-anim-pose').evaluateAll((els) => els.map((e) => e.getAttribute('src').split('/').pop()))
  ok(srcs.every((s) => /song-teapot-/.test(s)), `all frames are teapot poses (${srcs.join(', ')})`)

  console.log('\n[2] Poses cycle while playing')
  const seenPoses = new Set()
  let sawCaption = false
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(220)
    const src = await page.locator('.song-anim-pose.is-on').first().getAttribute('src').catch(() => '')
    if (src) seenPoses.add(src.split('/').pop())
    const cap = (await page.locator('.song-anim-caption').textContent().catch(() => '')) || ''
    if (/teapot|handle|spout|steamed|tip/i.test(cap)) sawCaption = true
  }
  ok(seenPoses.size >= 2, `cycled through multiple teapot poses (${[...seenPoses].join(', ')})`)
  ok(sawCaption, 'karaoke caption (lyric line) shown during play')

  console.log('\n[3] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)

  await ctx.close(); await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — teapot animation verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
