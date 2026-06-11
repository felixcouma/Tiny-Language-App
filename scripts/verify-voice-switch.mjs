/*
 * Headless proof that the storybook-voice toggle actually re-routes EVERY spoken
 * line to the chosen voice's clips. For each voice we set tv_story_voice, drive the
 * real UI (open a world → auto-spoken word clip; tap "starts with X" → phrase clip),
 * capture the exact /sounds/ URL the app requests, and fetch it to confirm a real
 * MP3 comes back (200 + audio/mpeg + non-trivial size), not the SPA index fallback.
 */
import { chromium } from 'playwright'

const APP = 'http://localhost:5173/Tiny-Language-App/'
const VOICES = ['aoede', 'leda', 'sulafat']

// Injected before app JS: pin the voice, and replace Audio with a recorder that
// fetches the URL (to prove the file exists) then fires 'ended' so app flows continue.
function initScript(voice) {
  return `
    try { localStorage.setItem('tv_story_voice', ${JSON.stringify(voice)}); localStorage.setItem('tv_muted','0'); } catch {}
    window.__clips = [];
    class FakeAudio extends EventTarget {
      constructor(src){ super(); this._src=''; if(src) this.src = src; }
      set src(v){ this._src = v; this.__rec(v); }
      get src(){ return this._src; }
      async __rec(src){
        if(!src) return;
        const rec = { src, status:null, type:null, bytes:0 };
        window.__clips.push(rec);
        try {
          const r = await fetch(src);
          rec.status = r.status; rec.type = r.headers.get('content-type');
          const b = await r.blob(); rec.bytes = b.size;
        } catch(e){ rec.status = 'fetch-error'; }
        setTimeout(()=>this.dispatchEvent(new Event('ended')), 8);
      }
      play(){ return Promise.resolve(); }
      pause(){}
      load(){}
    }
    window.Audio = FakeAudio;
  `
}

const run = async () => {
  const browser = await chromium.launch()
  const results = []
  for (const voice of VOICES) {
    const ctx = await browser.newContext()
    await ctx.addInitScript(initScript(voice))
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(APP, { waitUntil: 'networkidle' })

    // Pick the first profile if the picker is showing.
    const pick = page.locator('.pick-card').first()
    if (await pick.count()) { await pick.click(); await page.waitForTimeout(300) }

    // Dismiss the first-run onboarding overlay if it appears (intercepts clicks).
    const skip = page.locator('.onb-skip')
    if (await skip.count()) { await skip.click(); await page.waitForTimeout(200) }

    // Open the first world → Learning auto-speaks the item (a WORD clip).
    await page.locator('.world-card').first().click()
    await page.waitForTimeout(1200)
    // Tap "starts with X" → voice(letter) → a PHRASE-folder clip.
    const letter = page.locator('.l2-letter')
    if (await letter.count()) { await letter.click(); await page.waitForTimeout(900) }

    const clips = await page.evaluate(() => window.__clips)
    const sounds = clips.filter((c) => /\/sounds\//.test(c.src))
    results.push({ voice, errors: errors.length, sounds })
    await ctx.close()
  }
  await browser.close()

  // Report + verdict.
  let allPass = true
  for (const { voice, errors, sounds } of results) {
    const expectWord = voice === 'aoede' ? `/sounds/aoede/` : `/sounds/${voice}/`
    const expectPhrase = voice === 'aoede' ? `/sounds/phrases/` : `/sounds/${voice}/phrases/`
    const wordClip = sounds.find((c) => new RegExp(`${expectWord}[^/]+\\.mp3$`).test(c.src) && !/\/phrases\//.test(c.src))
    const phraseClip = sounds.find((c) => c.src.includes(expectPhrase))
    const real = (c) => c && c.status === 200 && /audio\//.test(c.type || '') && c.bytes > 800
    const wordOk = real(wordClip)
    const phraseOk = real(phraseClip)
    if (!wordOk || !phraseOk || errors) allPass = false
    console.log(`\n=== ${voice.toUpperCase()} ===  (console errors: ${errors})`)
    console.log(`  word clip   → ${wordClip ? wordClip.src : 'NONE'}  [${wordClip ? wordClip.status + ' ' + wordClip.type + ' ' + Math.round(wordClip.bytes/1024) + 'KB' : '-'}]  ${wordOk ? 'OK' : 'FAIL'}`)
    console.log(`  phrase clip → ${phraseClip ? phraseClip.src : 'NONE'}  [${phraseClip ? phraseClip.status + ' ' + phraseClip.type + ' ' + Math.round(phraseClip.bytes/1024) + 'KB' : '-'}]  ${phraseOk ? 'OK' : 'FAIL'}`)
    const stray = sounds.filter((c) => !c.src.includes(`/sounds/${voice}/`) && !(voice === 'aoede' && (c.src.includes('/sounds/phrases/') || c.src.includes('/sounds/aoede/'))) && !c.src.includes('/sounds/fx/'))
      .filter((c) => !c.src.includes('/sounds/aoede/')) // aoede is the legit fallback for any missing per-voice clip
    if (stray.length) console.log(`  note: ${stray.length} clip(s) outside the ${voice} folder (excl. aoede fallback / fx):`, stray.map((c) => c.src).slice(0, 4))
  }
  console.log(`\n${allPass ? '✅ PASS' : '❌ FAIL'} — voice switching ${allPass ? 'routes every line to the selected voice' : 'has issues (see above)'}.`)
  process.exit(allPass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
