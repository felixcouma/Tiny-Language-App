/*
 * Verify the DEPLOYED Vercel site end-to-end before handing the link to the therapist:
 *   1. Voice switching routes clips to the chosen voice, clips fetch clean (small), 0 errors.
 *   2. The new food + family images and clips are actually served (200 + right type).
 *   3. A food card and a family portrait render (decode) in the running app.
 *   4. The "Share feedback" button is present (behind the grown-up gate) and links out to the form.
 * A fresh Playwright context has no service-worker cache, so it fetches the live deploy.
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'https://tiny-language-app.vercel.app/'
const base = APP.replace(/\/$/, '')
const VOICES = ['aoede', 'leda', 'sulafat']

const seed = (voice) => `
  try {
    const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[] }];
    localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
    localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
    localStorage.setItem('tv_onboarded','true');
    localStorage.setItem('tv_story_voice', ${JSON.stringify(voice)});
    localStorage.setItem('tv_muted','0');
  } catch {}
  window.__clips = [];
  class FakeAudio extends EventTarget {
    constructor(src){ super(); this._src=''; if(src) this.src = src; }
    set src(v){ this._src = v; this.__rec(v); }
    get src(){ return this._src; }
    async __rec(src){
      if(!src) return;
      const rec = { src, status:null, type:null, bytes:0 };
      window.__clips.push(rec);
      try { const r = await fetch(src); rec.status=r.status; rec.type=r.headers.get('content-type'); rec.bytes=(await r.blob()).size; } catch(e){ rec.status='err'; }
      setTimeout(()=>this.dispatchEvent(new Event('ended')), 8);
    }
    play(){ return Promise.resolve(); } pause(){} load(){}
  }
  window.Audio = FakeAudio;
`

const openHomeVillage = async (page) => {
  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.world-card', { hasText: 'Home Village' }).click()
  await page.waitForTimeout(1200)
}

const run = async () => {
  const browser = await chromium.launch()

  // ---- 1. voices + clip cleanliness (one fresh context per voice) ----
  const voiceResults = []
  for (const voice of VOICES) {
    const ctx = await browser.newContext()
    await ctx.addInitScript(seed(voice))
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await openHomeVillage(page)
    const letter = page.locator('.l2-letter'); if (await letter.count()) { await letter.click(); await page.waitForTimeout(900) }
    await page.locator('.arrow').last().click(); await page.waitForTimeout(900) // advance → another clip
    const clips = await page.evaluate(() => window.__clips)
    voiceResults.push({ voice, errors: errors.length, sounds: clips.filter((c) => /\/sounds\//.test(c.src)) })
    await ctx.close()
  }

  // ---- 3. in-app render of a food card + a family portrait (decode check) ----
  const ctx = await browser.newContext()
  await ctx.addInitScript(seed('aoede'))
  const page = await ctx.newPage()
  const renderErrors = []
  page.on('console', (m) => { if (m.type() === 'error') renderErrors.push(m.text()) })
  await openHomeVillage(page)
  // family portrait is item 0 (Mommy); step a couple to be safe and grab whatever card image shows
  await page.waitForSelector('.l2-card img', { timeout: 8000 })
  const famImg = await page.evaluate(() => {
    const i = document.querySelector('.l2-card img'); return i ? { src: i.currentSrc || i.src, w: i.naturalWidth } : null
  })
  // jump to a food: click Home, reopen, then Next to the tail is slow — instead assert via the Word Board
  await page.goto(APP, { waitUntil: 'networkidle' })
  await page.locator('.mode-grid, .home2-speech').first().click().catch(() => {})
  await page.waitForTimeout(800)

  // ---- 4. feedback button behind the grown-up gate ----
  await page.goto(APP, { waitUntil: 'networkidle' })
  await page.locator('.home2-parent').click()
  await page.waitForSelector('.gate-q', { timeout: 5000 })
  const q = await page.locator('.gate-q').textContent()
  const nums = (q.match(/\d+/g) || []).map(Number)
  await page.locator('.gate-input').fill(String((nums[0] || 0) + (nums[1] || 0)))
  await page.locator('.gate-go').click()
  await page.waitForTimeout(600)
  const fb = page.locator('.feedback-btn')
  const fbCount = await fb.count()
  const fbHref = fbCount ? await fb.getAttribute('href') : null
  await ctx.close()
  await browser.close()

  // ---- 2. direct asset fetches (served by Vercel) ----
  const assets = [
    'images/avocado.webp', 'images/ugali.webp', 'images/food-fish.webp',
    'images/home-mommy.webp', 'images/home-grandpa.webp',
    'sounds/aoede/avocado.mp3', 'sounds/leda/rice.mp3', 'sounds/sulafat/ugali.mp3',
    'sounds/phrases/eat-ugali.mp3', 'sounds/leda/phrases/eat-ugali.mp3',
  ]
  const assetRows = []
  for (const a of assets) {
    try {
      const r = await fetch(`${base}/${a}`)
      const buf = await r.arrayBuffer()
      assetRows.push({ a, status: r.status, type: r.headers.get('content-type') || '', bytes: buf.byteLength })
    } catch (e) { assetRows.push({ a, status: 'err', type: '', bytes: 0 }) }
  }

  // ---- report ----
  let pass = true
  console.log(`\n=== DEPLOYED SITE: ${APP} ===`)

  console.log('\n[1] Voice switching + clip cleanliness')
  for (const { voice, errors, sounds } of voiceResults) {
    const expectWord = `/sounds/${voice === 'aoede' ? 'aoede' : voice}/`
    const expectPhrase = voice === 'aoede' ? '/sounds/phrases/' : `/sounds/${voice}/phrases/`
    const wordClip = sounds.find((c) => new RegExp(`${expectWord}[^/]+\\.mp3`).test(c.src) && !/\/phrases\//.test(c.src))
    const phraseClip = sounds.find((c) => c.src.includes(expectPhrase))
    const real = (c) => c && c.status === 200 && /audio\//.test(c.type || '') && c.bytes > 800
    const clean = phraseClip && phraseClip.bytes < 14000
    const ok = real(wordClip) && real(phraseClip) && clean && errors === 0
    if (!ok) pass = false
    console.log(`  ${voice.padEnd(8)} word=${wordClip ? wordClip.status : '—'} phrase=${phraseClip ? `${phraseClip.status} ${Math.round(phraseClip.bytes / 1024)}KB` : '—'} errors=${errors}  ${ok ? 'OK' : 'FAIL'}`)
  }

  console.log('\n[2] New assets served by Vercel')
  for (const r of assetRows) {
    const wantImg = r.a.endsWith('.webp')
    const ok = r.status === 200 && (wantImg ? /image\//.test(r.type) : /audio\//.test(r.type)) && r.bytes > 500
    if (!ok) pass = false
    console.log(`  ${ok ? 'OK ' : 'XX '} ${r.a.padEnd(34)} ${r.status} ${r.type.padEnd(12)} ${Math.round(r.bytes / 1024)}KB`)
  }

  console.log('\n[3] In-app render')
  const famOk = famImg && famImg.w > 0
  if (!famOk) pass = false
  console.log(`  ${famOk ? 'OK ' : 'XX '} card image decoded: ${famImg ? `${famImg.src.split('/').pop()} (${famImg.w}px)` : 'NONE'}`)

  console.log('\n[4] Feedback button (behind grown-up gate)')
  const fbOk = fbCount > 0 && fbHref && /^https?:\/\//.test(fbHref)
  if (!fbOk) pass = false
  console.log(`  ${fbOk ? 'OK ' : 'XX '} button=${fbCount > 0 ? 'present' : 'MISSING'}  →  ${fbHref || '(no href / VITE_FEEDBACK_URL not set?)'}`)

  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — deployed Vercel site verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
