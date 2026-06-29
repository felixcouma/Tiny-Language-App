/*
 * Verify Part A (generic profiles + 1/2 onboarding) on the local dev server:
 *   A. Fresh device  → "How many children?" setup; choose ONE  → 1 child, NO Twin Mode.
 *   B. Fresh device  → choose TWO → picker w/ Child 1 + Child 2 → Twin Mode shown, names lead turns.
 *   C. Existing data → seed Audrey/Adriel (no child-count) → skips setup, lands as Audrey,
 *                      Twin Mode present and turn pill speaks a real twin name. (No data wiped.)
 * Run: node scripts/verify-profiles.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'
const ls = (page, key) => page.evaluate((k) => localStorage.getItem(k), key)

const run = async () => {
  const browser = await chromium.launch()
  let pass = true
  const ok = (cond, label) => {
    if (!cond) pass = false
    console.log(`  ${cond ? 'OK ' : 'XX '} ${label}`)
  }

  // ---- A. fresh → ONE child ----
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(APP, { waitUntil: 'networkidle' })
    const hasSetup = await page.locator('.setup-title', { hasText: 'Welcome' }).count()
    console.log('\n[A] Fresh device → One child')
    ok(hasSetup > 0, 'setup screen "How many children?" shown on a fresh device')
    await page.getByText('One child').click()
    await page.waitForTimeout(500)
    const skip = page.locator('.onb-skip'); if (await skip.count()) await skip.click()
    await page.waitForTimeout(200)
    const profs = JSON.parse((await ls(page, 'tv_profiles_v1')) || '[]')
    const kids = profs.filter((p) => !p.guest)
    ok(kids.length === 1, `exactly one child seeded (got ${kids.length})`)
    ok(kids[0]?.name === 'Child 1', `child named "Child 1" (got "${kids[0]?.name}")`)
    ok((await ls(page, 'tv_child_count_v1')) === '1', 'child count persisted = 1')
    ok((await page.locator('.mode-twin').count()) === 0, 'Twin Mode button HIDDEN for one child')
    ok((await page.locator('.world-card').count()) > 0, 'home renders (world cards present)')
    await ctx.close()
  }

  // ---- B. fresh → TWO children ----
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(APP, { waitUntil: 'networkidle' })
    console.log('\n[B] Fresh device → Two children')
    await page.getByText('Two children').click()
    await page.waitForTimeout(500)
    // lands on the "who's playing?" picker
    const pickCards = page.locator('.pick-card')
    ok((await pickCards.count()) >= 2, 'picker shown with profile cards')
    const profs = JSON.parse((await ls(page, 'tv_profiles_v1')) || '[]')
    const kids = profs.filter((p) => !p.guest)
    ok(kids.length === 2, `two children seeded (got ${kids.length})`)
    ok(kids[0]?.name === 'Child 1' && kids[1]?.name === 'Child 2', 'named Child 1 + Child 2')
    // pick the first child → home
    await page.locator('.pick-card', { hasText: 'Child 1' }).click()
    await page.waitForTimeout(400)
    const skip = page.locator('.onb-skip'); if (await skip.count()) await skip.click()
    await page.waitForTimeout(200)
    ok((await page.locator('.mode-twin').count()) === 1, 'Twin Mode button SHOWN for two children')
    // open Twin Mode, confirm a real name leads the turn
    await page.locator('.mode-twin').click()
    await page.waitForTimeout(700)
    const pill = await page.locator('.turn-pill').first().textContent().catch(() => '')
    ok(/Child 1|Child 2/.test(pill || ''), `turn pill uses a real child name (got "${(pill || '').trim()}")`)
    await ctx.close()
  }

  // ---- C. existing Audrey/Adriel device is untouched ----
  {
    const ctx = await browser.newContext()
    await ctx.addInitScript(() => {
      const profs = [
        { id: 'guest', name: 'Everyone', color: '#20B2AA', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1, guest: true },
        { id: 'audrey', name: 'Audrey', initials: 'AJ', color: '#FF1493', stage: 'first', limit: 0, bedtime: null, phraseLevel: 2 },
        { id: 'adriel', name: 'Adriel', initials: 'AG', color: '#1E90FF', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1 },
      ]
      localStorage.setItem('tv_profiles_v1', JSON.stringify(profs))
      localStorage.setItem('tv_active_profile_v1', JSON.stringify('audrey'))
      localStorage.setItem('tv_onboarded', 'true')
      // deliberately NO tv_child_count_v1 — it must be inferred as 2
    })
    const page = await ctx.newPage()
    await page.goto(APP, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    console.log('\n[C] Existing Audrey/Adriel device (migration)')
    ok((await page.locator('.setup-title').count()) === 0, 'setup screen NOT shown (count inferred)')
    ok((await ls(page, 'tv_child_count_v1')) === '2', 'child count inferred + persisted = 2')
    const profs = JSON.parse((await ls(page, 'tv_profiles_v1')) || '[]')
    const names = profs.filter((p) => !p.guest).map((p) => p.name).join(',')
    ok(names === 'Audrey,Adriel', `twins preserved exactly (got "${names}")`)
    const who = await page.locator('.home2-whoname').first().textContent().catch(() => '')
    ok(/Audrey/.test(who || ''), `lands playing as Audrey (got "${(who || '').trim()}")`)
    ok((await page.locator('.mode-twin').count()) === 1, 'Twin Mode still shown')
    await page.locator('.mode-twin').click()
    await page.waitForTimeout(700)
    const pill = await page.locator('.turn-pill').first().textContent().catch(() => '')
    ok(/Audrey|Adriel/.test(pill || ''), `turn pill speaks a twin name (got "${(pill || '').trim()}")`)
    await ctx.close()
  }

  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — generic profiles + 1/2 onboarding verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
