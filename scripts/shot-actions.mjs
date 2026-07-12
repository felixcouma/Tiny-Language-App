/*
 * Local screenshot check for the "Things I Do" action animations. Seeds a guest child,
 * opens the Things I Do world, pages to each animated verb, and captures the learning
 * stage — twice for the bike so the two pedal frames both show. Output → scripts/_shots/.
 * Run (dev server up): node scripts/shot-actions.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '_shots')
mkdirSync(OUT, { recursive: true })
const APP = process.argv[2] || 'http://localhost:5173/'

const SEED = `
  const profs = [{ id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:false }];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('guest'));
  localStorage.setItem('tv_child_count_v1','1');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','1');
`

const TARGETS = ['Riding a bike', 'Blowing bubbles', 'Hugging']

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 })
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }
  await page.locator('.world-card', { hasText: 'Things I Do' }).click()
  await page.waitForSelector('.l2-word', { timeout: 5000 })

  const nextBtn = page.locator('.l2-playbar .arrow').last()
  for (const word of TARGETS) {
    // Page forward until this verb is on the stage (max one loop through the world).
    let found = false
    for (let i = 0; i < 20; i++) {
      const cur = (await page.locator('.l2-word').textContent()) || ''
      if (cur.trim() === word) { found = true; break }
      await nextBtn.click(); await page.waitForTimeout(250)
    }
    const slug = word.toLowerCase().replace(/\s+/g, '-')
    if (!found) { console.log(`XX ${word} — not found`); continue }
    await page.waitForTimeout(400)
    const card = page.locator('.l2-card')
    await card.screenshot({ path: path.join(OUT, `${slug}-a.png`) })
    await page.waitForTimeout(420) // let the loop advance a frame
    await card.screenshot({ path: path.join(OUT, `${slug}-b.png`) })
    console.log(`OK ${word} → ${slug}-a/-b.png`)
  }

  console.log(errors.length ? `\n${errors.length} console error(s): ${errors[0]}` : '\n0 console errors')
  await browser.close()
}
run().catch((e) => { console.error(e); process.exit(1) })
