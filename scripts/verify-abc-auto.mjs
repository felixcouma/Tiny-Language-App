/*
 * Verify Alphabet Friends Auto Play advances letters on its own (Observations #3).
 * Muted so song clips resolve instantly; confirms tapping Auto Play rolls the
 * letter index forward and the button flips to a Stop state.
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
const count = async (page) => (await page.locator('.abc-count').textContent())?.trim()

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(APP, { waitUntil: 'networkidle' })

  await page.getByText('ABC Songs', { exact: true }).click()
  await page.waitForTimeout(300)
  const before = await count(page)

  await page.getByText('Auto Play', { exact: false }).click()
  // Wait for the index to roll forward a few letters on its own.
  await page.waitForFunction(
    (b) => {
      const t = document.querySelector('.abc-count')?.textContent?.trim()
      const n = t ? parseInt(t) : 0
      return n >= 3
    },
    before,
    { timeout: 8000 }
  )
  const after = await count(page)
  const stopShown = (await page.locator('.abc-auto').textContent())?.includes('Stop')
  await browser.close()

  const advanced = parseInt(after) > parseInt(before)
  console.log(`start letter index : ${before}`)
  console.log(`after auto-roll    : ${after}  ${advanced ? 'OK (advanced on its own)' : 'FAIL'}`)
  console.log(`button shows Stop  : ${stopShown ? 'yes OK' : 'no FAIL'}`)
  console.log(`console errors     : ${errors.length}`)
  const pass = advanced && stopShown && errors.length === 0
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — ABC Auto Play advances A→Z.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
