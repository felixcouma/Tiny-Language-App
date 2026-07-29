/*
 * Verify Part B (cloud accounts) wiring on the local dev server, WITHOUT sending
 * a real magic-link email (the Supabase /auth/v1/otp call is stubbed):
 *   1. App boots with Supabase configured → 0 console errors.
 *   2. Parent area shows the "Save & sync progress" account section + email form.
 *   3. Trial banner is hidden while signed out.
 *   4. Submitting an email triggers the OTP request and shows "check your email".
 * Run: node scripts/verify-cloud.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

const seed = () => {
  const profs = [{ id: 'guest', name: 'Everyone', color: '#20B2AA', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1, guest: true, focusWords: [] }]
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs))
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'))
  localStorage.setItem('tv_child_count_v1', '1')
  localStorage.setItem('tv_onboarded', 'true')
}

const openParent = async (page) => {
  await page.goto(APP, { waitUntil: 'networkidle' })
  await page.locator('.home2-parent').click()
  await page.waitForSelector('.gate-q', { timeout: 5000 })
  const q = await page.locator('.gate-q').textContent()
  const nums = (q.match(/\d+/g) || []).map(Number)
  await page.locator('.gate-input').fill(String((nums[0] || 0) + (nums[1] || 0)))
  await page.locator('.gate-go').click()
  await page.waitForSelector('.parent-main', { timeout: 5000 })
}

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()

  // Stub Supabase auth so no real email is sent; capture that it was called.
  let otpCalled = null
  await page.route('**/auth/v1/otp**', async (route) => {
    otpCalled = route.request().postData()
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })

  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await openParent(page)

  let pass = true
  const ok = (cond, label) => { if (!cond) pass = false; console.log(`  ${cond ? 'OK ' : 'XX '} ${label}`) }

  console.log('\n[1] Boot + parent area')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)
  // Account is a collapsed panel — open it before asserting on its contents.
  await page.locator('.parent-panel-head', { hasText: 'Account' }).click()
  const acct = page.locator('.account-section')
  await acct.scrollIntoViewIfNeeded().catch(() => {})
  ok((await acct.count()) > 0, 'Account section present (Supabase configured)')
  ok((await page.getByText('Save & sync progress').count()) > 0, 'sign-in heading shown while signed out')
  ok((await page.locator('.account-input').count()) > 0, 'email input present')

  console.log('\n[2] Trial banner hidden while signed out')
  ok((await page.locator('.trial-banner').count()) === 0, 'no trial banner when signed out')

  console.log('\n[3] Magic-link request (stubbed — no real email)')
  await page.locator('.account-input').fill('pilot.tester@example.com')
  await page.locator('.account-btn.primary').click()
  await page.waitForTimeout(600)
  ok(!!otpCalled && /pilot\.tester@example\.com/.test(otpCalled), 'OTP request fired with the entered email')
  ok((await page.locator('.account-sent').count()) > 0, '"check your email" confirmation shown')

  await ctx.close()

  // ---- 4. expired/used magic link → friendly note + cleaned URL ----
  console.log('\n[4] Stale magic-link redirect (#error_code=otp_expired)')
  const ctx2 = await browser.newContext()
  await ctx2.addInitScript(seed)
  const page2 = await ctx2.newPage()
  const errs2 = []
  page2.on('console', (m) => { if (m.type() === 'error') errs2.push(m.text()) })
  await page2.goto(`${APP}#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`, { waitUntil: 'networkidle' })
  await page2.waitForTimeout(300)
  const hash = await page2.evaluate(() => window.location.hash)
  ok(hash === '', 'error hash stripped from the URL')
  // open parent and confirm the friendly note (not a raw error)
  await page2.locator('.home2-parent').click()
  await page2.waitForSelector('.gate-q', { timeout: 5000 })
  const q2 = await page2.locator('.gate-q').textContent()
  const n2 = (q2.match(/\d+/g) || []).map(Number)
  await page2.locator('.gate-input').fill(String((n2[0] || 0) + (n2[1] || 0)))
  await page2.locator('.gate-go').click()
  await page2.waitForSelector('.parent-main', { timeout: 5000 })
  await page2.locator('.parent-panel-head', { hasText: 'Account' }).click()
  const note = page2.locator('.account-note')
  ok((await note.count()) > 0, 'friendly "request a fresh link" note shown')
  ok(/expired|no longer valid/i.test((await note.textContent()) || ''), 'note explains the expiry in plain language')
  ok(errs2.length === 0, `0 console errors on the error redirect (got ${errs2.length})`)
  await ctx2.close()

  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — cloud account UI + magic-link flow verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
