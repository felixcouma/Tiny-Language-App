/*
 * Headless check that "focus words of the week" drive the Word Board's Find game.
 * Seeds the guest profile with a pinned focus word, opens Vocab → Find, and asserts
 * the target the child is told to find is the pinned word (and the "This week" label
 * shows). Proves the caregiver-set targets reach the toddler-facing practice.
 */
import { chromium } from 'playwright'

const APP = 'http://localhost:5173/Tiny-Language-App/'
const PIN = 'Dog'

const seed = `
  try {
    const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[${JSON.stringify(PIN)}] }];
    localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
    localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
    localStorage.setItem('tv_onboarded', 'true');
    localStorage.setItem('tv_muted', '1'); // silence audio for the check
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

  // Home → Word Board (Vocab). The mode button label is "Word Board".
  await page.getByText('Word Board', { exact: true }).click()
  await page.waitForTimeout(400)
  // Switch to the Find tab.
  await page.locator('.wb-mode', { hasText: 'Find' }).click()
  await page.waitForTimeout(600)

  const target = (await page.locator('.wb-find-target').textContent())?.trim()
  const label = (await page.locator('.wb-find-label').textContent())?.trim()
  await browser.close()

  const targetOk = target === PIN
  const labelOk = /this week/i.test(label || '')
  console.log(`pinned focus word : ${PIN}`)
  console.log(`Find target shown : ${target}  ${targetOk ? 'OK' : 'FAIL'}`)
  console.log(`Find label        : "${label}"  ${labelOk ? 'OK (shows This week)' : 'FAIL'}`)
  console.log(`console errors    : ${errors.length}`)
  const pass = targetOk && labelOk && errors.length === 0
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — focus words drive the Find game.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
