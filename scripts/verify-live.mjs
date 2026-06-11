/*
 * Verify on the LIVE site (GitHub Pages): the voice toggle routes every spoken line
 * to the chosen voice, the clips fetch clean (small — no baked-in narration), and the
 * deployed app runs with zero console errors. A fresh Playwright context has no service
 * worker cache, so it fetches the freshly-deployed clips from the network.
 */
import { chromium } from 'playwright'

const APP = 'https://felixcouma.github.io/Tiny-Language-App/'
const VOICES = ['aoede', 'leda', 'sulafat']

function initScript(voice) {
  return `
    try { localStorage.setItem('tv_story_voice', ${JSON.stringify(voice)}); localStorage.setItem('tv_muted','0'); localStorage.setItem('tv_onboarded','true'); } catch {}
    window.__clips = [];
    class FakeAudio extends EventTarget {
      constructor(src){ super(); this._src=''; if(src) this.src = src; }
      set src(v){ this._src = v; this.__rec(v); }
      get src(){ return this._src; }
      async __rec(src){
        if(!src) return;
        const rec = { src, status:null, type:null, bytes:0 };
        window.__clips.push(rec);
        try { const r = await fetch(src + (src.includes('?')?'':'?v=live')); rec.status=r.status; rec.type=r.headers.get('content-type'); rec.bytes=(await r.blob()).size; } catch(e){ rec.status='err'; }
        setTimeout(()=>this.dispatchEvent(new Event('ended')), 8);
      }
      play(){ return Promise.resolve(); } pause(){} load(){}
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
    const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(200) }
    const pick = page.locator('.pick-card').first(); if (await pick.count()) { await pick.click(); await page.waitForTimeout(300) }
    const skip2 = page.locator('.onb-skip'); if (await skip2.count()) { await skip2.click(); await page.waitForTimeout(200) }
    await page.locator('.world-card').first().click()
    await page.waitForTimeout(1500)
    const letter = page.locator('.l2-letter'); if (await letter.count()) { await letter.click(); await page.waitForTimeout(1200) }
    const clips = await page.evaluate(() => window.__clips)
    results.push({ voice, errors: errors.length, sounds: clips.filter((c) => /\/sounds\//.test(c.src)) })
    await ctx.close()
  }
  await browser.close()

  let allPass = true
  for (const { voice, errors, sounds } of results) {
    const expectWord = voice === 'aoede' ? `/sounds/aoede/` : `/sounds/${voice}/`
    const expectPhrase = voice === 'aoede' ? `/sounds/phrases/` : `/sounds/${voice}/phrases/`
    const wordClip = sounds.find((c) => new RegExp(`${expectWord}[^/]+\\.mp3`).test(c.src) && !/\/phrases\//.test(c.src))
    const phraseClip = sounds.find((c) => c.src.includes(expectPhrase))
    const real = (c) => c && c.status === 200 && /audio\//.test(c.type || '') && c.bytes > 800
    // "clean" = not the oversized leaked size: a letter phrase clip should be tiny (<12KB).
    const phraseClean = phraseClip && phraseClip.bytes < 12000
    const ok = real(wordClip) && real(phraseClip) && phraseClean && errors === 0
    if (!real(wordClip) || !real(phraseClip) || !phraseClean || errors) allPass = false
    console.log(`\n=== ${voice.toUpperCase()} (live) ===  console errors: ${errors}`)
    console.log(`  word   → ${wordClip ? wordClip.src.split('?')[0] : 'NONE'}  [${wordClip ? wordClip.status+' '+Math.round(wordClip.bytes/1024)+'KB' : '-'}]  ${real(wordClip) ? 'OK' : 'FAIL'}`)
    console.log(`  phrase → ${phraseClip ? phraseClip.src.split('?')[0] : 'NONE'}  [${phraseClip ? phraseClip.status+' '+Math.round(phraseClip.bytes/1024)+'KB' : '-'}]  ${real(phraseClip)&&phraseClean ? 'OK (clean size)' : 'FAIL'}`)
  }
  console.log(`\n${allPass ? '✅ PASS' : '❌ FAIL'} — live site: voice switching works, clips clean, 0 errors.`)
  process.exit(allPass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
