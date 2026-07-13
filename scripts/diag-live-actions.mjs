/*
 * Diagnose the live site: are the new "Things I Do" verbs present, and does the action
 * animation CYCLE across desktop/mobile × reduced-motion on/off? Prints the is-on frame
 * sampled over ~2s for each scenario (constant = frozen still, changing = animating).
 * Run: node scripts/diag-live-actions.mjs [url]
 */
import { chromium, devices } from 'playwright'

const APP = process.argv[2] || 'https://felixcouma.github.io/Tiny-Language-App/'
const SEED = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1'); localStorage.setItem('tv_onboarded','true'); localStorage.setItem('tv_muted','1');`

const TARGET = 'Cooking' // a round-2 verb: proves the new deploy + tests animation

async function scenario(browser, label, opts) {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.world-card', { hasText: 'Things I Do' }).click()
  await page.waitForSelector('.l2-word', { timeout: 8000 })
  const nextBtn = page.locator('.l2-playbar .arrow').last()
  let found = false
  for (let i = 0; i < 40; i++) {
    const cur = ((await page.locator('.l2-word').textContent()) || '').trim()
    if (cur === TARGET) { found = true; break }
    await nextBtn.click(); await page.waitForTimeout(160)
  }
  const frameCount = await page.locator('.act-anim .act-anim-frame').count()
  const seen = new Set()
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(130)
    const on = await page.locator('.act-anim .act-anim-frame.is-on').first().getAttribute('src').catch(() => '')
    if (on) seen.add(on.split('/').pop())
  }
  const reduceMatches = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  console.log(`\n[${label}]`)
  console.log(`  ${TARGET} on stage: ${found}   frames rendered: ${frameCount}`)
  console.log(`  prefers-reduced-motion matches: ${reduceMatches}`)
  console.log(`  is-on frames over 2s: {${[...seen].join(', ')}}  -> ${seen.size >= 2 ? 'ANIMATING' : 'FROZEN (still only)'}`)
  await ctx.close()
}

const run = async () => {
  const browser = await chromium.launch()
  await scenario(browser, 'Desktop · no reduced-motion', { viewport: { width: 1280, height: 900 } })
  await scenario(browser, 'Desktop · reduced-motion: reduce', { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  await scenario(browser, 'Mobile (iPhone 13) · default', { ...devices['iPhone 13'] })
  await scenario(browser, 'Mobile (iPhone 13) · reduced-motion: reduce', { ...devices['iPhone 13'], reducedMotion: 'reduce' })
  await scenario(browser, 'Tablet (iPad Pro 11) · default', { ...devices['iPad Pro 11'] })
  await browser.close()
}
run().catch((e) => { console.error(e); process.exit(1) })
