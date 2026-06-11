/*
 * Verify the Listening Game fits the viewport with NO vertical scroll across phone
 * and tablet sizes (the observation: on tablet the game overflowed and the child
 * had to scroll). Checks the app-shell scroller isn't overflowing and all 4 choice
 * tiles are within the viewport.
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
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
]

const run = async () => {
  const browser = await chromium.launch()
  let allPass = true
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    await ctx.addInitScript(seed)
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(APP, { waitUntil: 'networkidle' })
    await page.getByText('Listening Game', { exact: true }).click()
    await page.locator('.choice').first().waitFor({ timeout: 5000 })
    await page.waitForTimeout(500)

    const m = await page.evaluate(() => {
      const shell = document.querySelector('.app-shell')
      const tiles = [...document.querySelectorAll('.choice')]
      const vh = window.innerHeight
      const overflow = Math.max(
        shell ? shell.scrollHeight - shell.clientHeight : 0,
        document.documentElement.scrollHeight - window.innerHeight
      )
      const offscreen = tiles.filter((t) => t.getBoundingClientRect().bottom > vh + 1).length
      const tileBox = tiles[0]?.getBoundingClientRect()
      return { overflow, tiles: tiles.length, offscreen, tileSize: tileBox ? Math.round(tileBox.width) : 0 }
    })
    await ctx.close()

    const ok = m.overflow <= 1 && m.tiles === 4 && m.offscreen === 0 && errors.length === 0
    if (!ok) allPass = false
    console.log(`${vp.name.padEnd(17)} ${vp.width}x${vp.height}  scroll-overflow=${m.overflow}px  tiles=${m.tiles}  offscreen=${m.offscreen}  tile≈${m.tileSize}px  err=${errors.length}  ${m.overflow <= 1 && m.offscreen === 0 ? 'OK' : 'FAIL'}`)
  }
  await browser.close()
  console.log(`\n${allPass ? '✅ PASS' : '❌ FAIL'} — Listening Game fits with no scroll on phone + tablet.`)
  process.exit(allPass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
