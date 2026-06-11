/*
 * Headless smoke of "Say It With Me" (Echo) — opens the screen, confirms it moves
 * through Listen → "Now YOU say it!" → celebrate and advances to the next word, with
 * no console errors. Audio is muted so the turn-window resolves fast.
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

  await page.getByText('Say It With Me', { exact: true }).click()
  await page.waitForTimeout(400)

  const cardShown = await page.locator('.echo-card').count()
  const firstWord = (await page.locator('.echo-word').textContent())?.trim()

  // The "your turn" prompt + "I said it!" button appear (no mic — the turn is the win).
  await page.locator('.echo-said').waitFor({ timeout: 4000 })
  const turnPrompt = (await page.locator('.echo-bubble-row .speech-bubble').textContent())?.trim()

  // Let it auto-advance (no click): the no-mic window celebrates and moves on.
  await page.waitForFunction(
    (w) => document.querySelector('.echo-word')?.textContent?.trim() !== w,
    firstWord,
    { timeout: 8000 }
  )
  const secondWord = (await page.locator('.echo-word').textContent())?.trim()
  await browser.close()

  const advanced = firstWord && secondWord && firstWord !== secondWord
  console.log(`card shown        : ${cardShown ? 'yes' : 'NO'}`)
  console.log(`first word        : ${firstWord}`)
  console.log(`your-turn prompt  : "${turnPrompt}"  ${/say it/i.test(turnPrompt || '') ? 'OK' : 'FAIL'}`)
  console.log(`advanced to next  : ${secondWord}  ${advanced ? 'OK' : 'FAIL'}`)
  console.log(`console errors    : ${errors.length}`)
  const pass = cardShown && /say it/i.test(turnPrompt || '') && advanced && errors.length === 0
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — Say It With Me cycles and advances.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
