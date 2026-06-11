/*
 * Verify browser Back returns to the Home dashboard from a sub-screen instead of
 * leaving the app (Observations #4). Opens a world (Learning), presses Back, and
 * asserts we land on Home — still inside the app, same URL.
 */
import { chromium } from 'playwright'

const APP = 'http://localhost:5173/Tiny-Language-App/'
const seed = `
  try {
    const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[] }];
    localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
    localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
    localStorage.setItem('tv_onboarded', 'true');
    localStorage.setItem('tv_muted', '1');
  } catch {}
`

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(APP, { waitUntil: 'networkidle' })

  // Home shown?
  const homeFirst = await page.locator('.home2').count()
  // Into a sub-screen (Learning).
  await page.locator('.world-card').first().click()
  await page.waitForTimeout(500)
  const inLearning = await page.locator('.learn2').count()

  // Browser Back → should land on Home, still in the app.
  await page.goBack()
  await page.waitForTimeout(500)
  const url = page.url()
  const backHome = await page.locator('.home2').count()
  const stillLearning = await page.locator('.learn2').count()
  await browser.close()

  const inApp = url.startsWith(APP.slice(0, APP.length - 1))
  const ok = homeFirst && inLearning && backHome && !stillLearning && inApp && errors.length === 0
  console.log(`home shown first   : ${homeFirst ? 'yes' : 'NO'}`)
  console.log(`opened Learning    : ${inLearning ? 'yes' : 'NO'}`)
  console.log(`Back → Home shown  : ${backHome ? 'yes OK' : 'NO FAIL'}  (learning gone: ${!stillLearning})`)
  console.log(`still in app (url) : ${inApp ? 'yes OK' : 'NO FAIL'}  ${url}`)
  console.log(`console errors     : ${errors.length}`)
  console.log(`\n${ok ? '✅ PASS' : '❌ FAIL'} — Back returns to Home, doesn't leave the app.`)
  process.exit(ok ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
