/*
 * Verify each config-driven song animation renders its OWN character (not Pip, not a
 * leftover frame) and cycles poses + shows the karaoke caption while playing, with 0
 * console errors. Covers the teapot-style rollout (teapot/star/clock/lamb).
 * Run: node scripts/verify-song-anims.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

const SONGS = [
  { id: 'im-a-little-teapot', card: 'Teapot', count: 5, prefix: 'teapot', cap: /teapot|handle|spout|steamed|tip/i },
  { id: 'twinkle-twinkle-little-star', card: 'Twinkle', count: 4, prefix: 'star', cap: /twinkle|wonder|above|diamond/i },
  { id: 'hickory-dickory-dock', card: 'Hickory', count: 4, prefix: 'clock', cap: /hickory|mouse|clock|struck/i },
  { id: 'mary-had-a-little-lamb', card: 'Mary', count: 4, prefix: 'lamb', cap: /mary|fleece|lamb|snow/i },
  { id: 'bingo', card: 'Bingo', count: 4, prefix: 'bingo', cap: /farmer|name-o|clap|B – I – N/i },
  { id: 'the-alphabet-song', card: 'Alphabet', count: 4, prefix: 'abc', cap: /A B C|ABCs|sing with me/i },
  { id: 'one-two-buckle-my-shoe', card: 'Buckle', count: 4, prefix: 'count', cap: /buckle|shoe|door|sticks|hen/i },
  { id: 'hokey-pokey', card: 'Hokey', count: 4, prefix: 'hokey', cap: /hand|hokey|shake|turn/i },
  { id: 'the-happy-song', card: 'Happy', count: 3, prefix: 'happy', cap: /happy|clap|stomp|hooray/i },
  { id: 'are-you-sleeping', card: 'Sleeping', count: 4, prefix: 'sleep', cap: /sleeping|brother john|bells|ding/i },
  { id: 'hush-little-baby', card: 'Hush', count: 3, prefix: 'hush', cap: /hush|baby|mockingbird|diamond/i },
  { id: 'over-the-river-and-through-the-woods', card: 'River', count: 4, prefix: 'river', cap: /river|grandmother|sleigh|snow/i },
]

const seedFor = (id) => `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:['${id}'], expectantPause:false }];
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
  let pass = true
  const ok = (c, label) => { if (!c) pass = false; console.log(`    ${c ? 'OK ' : 'XX '} ${label}`) }

  for (const s of SONGS) {
    console.log(`\n[${s.id}]`)
    const ctx = await browser.newContext()
    await ctx.addInitScript(seedFor(s.id))
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

    await page.goto(APP, { waitUntil: 'networkidle' })
    const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
    await page.locator('.mode-songs').click()
    await page.waitForSelector('.song-card', { timeout: 5000 })
    await page.locator('.song-card', { hasText: s.card }).click()
    await page.waitForTimeout(300)

    ok((await page.locator('.now-playing.is-animated').count()) === 1, 'animated mode')
    ok((await page.locator('.song-anim-pose').count()) === s.count, `${s.count} pose frames`)
    const srcs = await page.locator('.song-anim-pose').evaluateAll((els) => els.map((e) => e.getAttribute('src').split('/').pop()))
    ok(srcs.every((x) => x.startsWith(`song-${s.prefix}-`)), `all frames are ${s.prefix} poses (${srcs.join(', ')})`)

    const seen = new Set(); let sawCap = false
    for (let i = 0; i < 14; i++) {
      await page.waitForTimeout(200)
      const src = await page.locator('.song-anim-pose.is-on').first().getAttribute('src').catch(() => '')
      if (src) seen.add(src.split('/').pop())
      const cap = (await page.locator('.song-anim-caption').textContent().catch(() => '')) || ''
      if (s.cap.test(cap)) sawCap = true
    }
    ok(seen.size >= 2, `cycled multiple poses (${[...seen].join(', ')})`)
    ok(sawCap, 'karaoke caption shown')
    ok(errors.length === 0, `0 console errors${errors.length ? ': ' + errors[0] : ''}`)
    await ctx.close()
  }

  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — song animations verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
