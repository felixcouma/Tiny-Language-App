/*
 * Regression test for the "Sing with Pip" player (transport bar). Guards the robust-player
 * behaviour so it can't quietly regress:
 *   A) the transport controls are all present (shuffle · prev · play/pause · next),
 *   B) the big Play starts the QUEUE when nothing is selected,
 *   C) Next / Prev step through the queue (and Prev wraps),
 *   D) when a song ENDS it AUTO-ADVANCES to the next in the queue,
 *   E) at the END of the queue it STOPS (no endless loop),
 *   F) Shuffle toggles (aria-pressed), and Play/Pause toggles the current song.
 * Real mp3s never load — window.Audio is stubbed with a FakeAudio we can drive: it exposes
 * itself as window.__fakeAudio so the test can dispatch 'ended' to simulate a song finishing.
 * Run (server up): node scripts/verify-song-player.mjs [url]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

// Three songs, enabled. The screen filters the fixed SONGS catalog by enabledSongs, so the
// non-shuffled queue is catalog order: Alphabet → Bingo → Twinkle.
const SEED = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:['the-alphabet-song','bingo','twinkle-twinkle-little-star'], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','0');
  class FakeAudio extends EventTarget {
    constructor(s){ super(); this._src=''; this.paused=true; this.duration=40; this.currentTime=0; this._t=null; if(s) this.src=s; window.__fakeAudio = this; }
    set src(v){ this._src=v; this.currentTime=0; } get src(){ return this._src; }
    set preload(v){} removeAttribute(){ this._src=''; }
    play(){ this.paused=false; clearInterval(this._t); this._t=setInterval(()=>{ this.currentTime+=0.2; this.dispatchEvent(new Event('timeupdate')); }, 60); return Promise.resolve(); }
    pause(){ this.paused=true; clearInterval(this._t); } load(){}
    end(){ this.paused=true; clearInterval(this._t); this.currentTime=this.duration; this.dispatchEvent(new Event('ended')); }
  }
  window.Audio = FakeAudio;
`

const ALPHABET = 'The Alphabet Song'
const BINGO = 'Bingo'
const TWINKLE = 'Twinkle, Twinkle, Little Star'

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  const fails = []
  const ok = (c, label) => { if (!c) fails.push(label); console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  const title = () => page.locator('.np-title').textContent().then((t) => (t || '').trim())
  const isPlaying = async () => (await page.locator('.now-playing.is-playing').count()) === 1
  // Simulate a song finishing exactly like a real <audio> does: it pauses and fires 'ended'.
  const endCurrent = () => page.evaluate(() => window.__fakeAudio && window.__fakeAudio.end())

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.mode-songs').click()
  await page.waitForSelector('.song-card', { timeout: 5000 })

  // A) all transport controls present.
  const shuffleBtn = page.locator('.np-ctrl[aria-pressed]')
  const prevBtn = page.locator('.np-ctrl[aria-label="Previous song"]')
  const nextBtn = page.locator('.np-ctrl[aria-label="Next song"]')
  const mainPlay = page.locator('.np-play')
  ok((await shuffleBtn.count()) === 1, 'shuffle control present')
  ok((await prevBtn.count()) === 1, 'previous control present')
  ok((await nextBtn.count()) === 1, 'next control present')
  ok((await mainPlay.count()) === 1, 'play/pause control present')

  // B) big Play with nothing selected starts the queue at the first song.
  ok(!(await isPlaying()), 'starts idle (not playing)')
  await mainPlay.click()
  await page.waitForTimeout(200)
  ok(await isPlaying(), 'main Play starts playback')
  ok((await title()) === ALPHABET, `queue starts at first song ("${await title()}")`)

  // C) Next steps forward through the queue.
  await nextBtn.click(); await page.waitForTimeout(150)
  ok((await title()) === BINGO, `Next advances ("${await title()}")`)
  // Prev steps back.
  await prevBtn.click(); await page.waitForTimeout(150)
  ok((await title()) === ALPHABET, `Prev goes back ("${await title()}")`)
  // Prev from the first wraps to the last.
  await prevBtn.click(); await page.waitForTimeout(150)
  ok((await title()) === TWINKLE, `Prev from first wraps to last ("${await title()}")`)

  // D) a song ENDING auto-advances to the next. Reset to first, end it, expect the next.
  await mainPlay.click() // pause
  await page.waitForTimeout(100)
  // jump back to the first via Next-from-last wrap
  await nextBtn.click(); await page.waitForTimeout(150)
  ok((await title()) === ALPHABET, `Next from last wraps to first ("${await title()}")`)
  await endCurrent(); await page.waitForTimeout(200)
  ok((await title()) === BINGO, `song end auto-advances ("${await title()}")`)
  ok(await isPlaying(), 'still playing after auto-advance')
  await endCurrent(); await page.waitForTimeout(200)
  ok((await title()) === TWINKLE, `auto-advances again to last ("${await title()}")`)

  // E) ending the LAST song stops — no loop back to the first.
  await endCurrent(); await page.waitForTimeout(200)
  ok(!(await isPlaying()), 'stops at end of queue (not playing)')
  ok((await title()) === TWINKLE, `no loop — stays on last, does not jump to first ("${await title()}")`)

  // F) Shuffle toggles its pressed state.
  ok((await shuffleBtn.getAttribute('aria-pressed')) === 'false', 'shuffle starts off')
  await shuffleBtn.click(); await page.waitForTimeout(100)
  ok((await shuffleBtn.getAttribute('aria-pressed')) === 'true', 'shuffle toggles on')
  ok((await page.locator('.np-ctrl.is-on').count()) === 1, 'shuffle shows active style')
  await shuffleBtn.click(); await page.waitForTimeout(100)
  ok((await shuffleBtn.getAttribute('aria-pressed')) === 'false', 'shuffle toggles back off')

  // Play/Pause toggles the current song.
  await mainPlay.click(); await page.waitForTimeout(150)
  ok(await isPlaying(), 'Play resumes the current song')
  await mainPlay.click(); await page.waitForTimeout(150)
  ok(!(await isPlaying()), 'Pause stops the current song')

  ok(errors.length === 0, `0 console errors${errors.length ? ': ' + errors[0] : ''}`)
  await browser.close()
  console.log(`\n${fails.length ? '❌ FAIL' : '✅ PASS'} — Sing with Pip player (transport + auto-advance + stop-at-end).`)
  process.exit(fails.length ? 1 : 0)
}
run().catch((e) => { console.error(e); process.exit(2) })
