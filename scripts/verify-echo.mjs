/*
 * Verify "Say It With Me" (Echo) praise is tied to a real attempt, not a timer
 * (Observations follow-up): (a) reaching "your turn" does NOT auto-praise or advance
 * on its own within a few seconds; (b) tapping "I said it!" celebrates and advances.
 * Muted so the word clip resolves instantly.
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
const word = (page) => page.locator('.echo-word').textContent().then((t) => t?.trim())
const bubble = (page) => page.locator('.echo-bubble-row .speech-bubble').textContent().then((t) => t?.trim())

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(APP, { waitUntil: 'networkidle' })

  await page.getByText('Say It With Me', { exact: true }).click()
  // Reach "your turn".
  await page.locator('.echo-said').waitFor({ timeout: 4000 })
  const firstWord = await word(page)
  const turnPrompt = await bubble(page)

  // (a) No premature praise: wait 4s WITHOUT tapping; still same word, no cheer.
  await page.waitForTimeout(4000)
  const stillSameWord = (await word(page)) === firstWord
  const stillTurn = (await bubble(page))?.toLowerCase().includes('say it')
  const noPrematureCheer = stillSameWord && stillTurn

  // (b) Tap "I said it!" → celebrate + advance to the next word.
  await page.locator('.echo-said').click()
  await page.waitForFunction(
    (w) => document.querySelector('.echo-word')?.textContent?.trim() !== w,
    firstWord,
    { timeout: 4000 }
  )
  const secondWord = await word(page)
  await browser.close()

  const advancedOnTap = secondWord && secondWord !== firstWord
  console.log(`reached "your turn"        : "${turnPrompt}"  ${/say it/i.test(turnPrompt || '') ? 'OK' : 'FAIL'}`)
  console.log(`no praise without a tap    : ${noPrematureCheer ? 'OK (still waiting on same word after 4s)' : 'FAIL (auto-advanced/praised)'}`)
  console.log(`tap "I said it!" advances  : ${firstWord} → ${secondWord}  ${advancedOnTap ? 'OK' : 'FAIL'}`)
  console.log(`console errors             : ${errors.length}`)
  const pass = /say it/i.test(turnPrompt || '') && noPrematureCheer && advancedOnTap && errors.length === 0
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — praise is tied to the "I said it!" tap, not a timer.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
