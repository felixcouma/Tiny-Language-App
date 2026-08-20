/*
 * One-off: capture pamphlet screenshots of key screens into ~/Downloads/tinyvoice-pamphlet/.
 * Seeds a two-child profile (Ava + Leo) so Home/Twin/Parent look populated, mutes + fakes
 * Audio (no autoplay noise), and shoots at a crisp phone size. Not part of the check suite.
 *   node scripts/shoot-pamphlet.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const APP = process.argv[2] || 'http://localhost:5173/'
const OUT = path.join(os.homedir(), 'Downloads', 'tinyvoice-pamphlet')
mkdirSync(OUT, { recursive: true })

const seed = `
  const profs = [
    { id:'child1', name:'Ava', initials:'AV', color:'#FF3D8B', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[], expectantPause:false },
    { id:'child2', name:'Leo', initials:'LE', color:'#3AA0FF', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[], expectantPause:false },
  ];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('child1'));
  localStorage.setItem('tv_child_count_v1','2');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','1');
  class F extends EventTarget { constructor(s){ super(); this._src=''; if(s) this.src=s;} set src(v){ this._src=v; if(v) setTimeout(()=>this.dispatchEvent(new Event('ended')),6);} get src(){return this._src;} play(){return Promise.resolve();} pause(){} load(){} }
  window.Audio = F;
`
// Setup shot must NOT be seeded (we want the "how many children?" first-run screen).
const seedMuteOnly = `
  localStorage.setItem('tv_muted','1');
  class F extends EventTarget { constructor(s){ super(); this._src=''; if(s) this.src=s;} set src(v){ this._src=v; if(v) setTimeout(()=>this.dispatchEvent(new Event('ended')),6);} get src(){return this._src;} play(){return Promise.resolve();} pause(){} load(){} }
  window.Audio = F;
`

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const run = async () => {
  const browser = await chromium.launch()
  const shots = []

  // Fresh seeded page that lands on Home (skips onboarding overlay).
  const home = async (initScript = seed) => {
    const ctx = await browser.newContext({
      viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true,
    })
    await ctx.addInitScript(initScript)
    const page = await ctx.newPage()
    await page.goto(APP, { waitUntil: 'networkidle' })
    const skip = page.locator('.onb-skip')
    if (await skip.count()) { await skip.click().catch(() => {}); await wait(150) }
    return { ctx, page }
  }

  const shoot = async (name, page, fullPage = false) => {
    await wait(700) // let art/fonts settle
    const file = path.join(OUT, `${name}.png`)
    await page.screenshot({ path: file, fullPage })
    shots.push(name)
    console.log(`  ✓ ${name}.png`)
  }

  try {
    // 1) Setup — first-run "how many children?" (unseeded)
    {
      const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true })
      await ctx.addInitScript(seedMuteOnly)
      const page = await ctx.newPage()
      await page.goto(APP, { waitUntil: 'networkidle' })
      await shoot('setup', page)
      await ctx.close()
    }

    // 2) Home — the world map
    {
      const { ctx, page } = await home()
      await shoot('home', page, true)
      await ctx.close()
    }

    // 3) Learning — a world's word + hear-it
    {
      const { ctx, page } = await home()
      await page.locator('.world-card').first().click()
      await page.waitForSelector('.home2-grid', { state: 'detached', timeout: 5000 }).catch(() => {})
      await shoot('learning', page)
      await ctx.close()
    }

    // 4) Listening Game
    {
      const { ctx, page } = await home()
      await page.locator('.mode-btn', { hasText: 'Listening Game' }).first().click()
      await page.waitForSelector('.home2-grid', { state: 'detached', timeout: 5000 }).catch(() => {})
      await wait(600)
      await shoot('game', page)
      await ctx.close()
    }

    // 5) Word Board (AAC)
    {
      const { ctx, page } = await home()
      await page.locator('.mode-grid').first().click()
      await page.waitForSelector('.home2-grid', { state: 'detached', timeout: 5000 }).catch(() => {})
      await shoot('wordboard', page)
      await ctx.close()
    }

    // 6) Every Day with Pip — routine picker
    {
      const { ctx, page } = await home()
      await page.locator('.home2-routines').first().click()
      await page.waitForSelector('.rt-card', { timeout: 5000 }).catch(() => {})
      await shoot('routines', page, true)
      await ctx.close()
    }

    // 7) Parent dashboard — solve the sum gate
    {
      const { ctx, page } = await home()
      await page.locator('.home2-parent').first().click()
      await page.waitForSelector('.gate-card', { timeout: 5000 })
      const q = await page.locator('.gate-q').innerText() // "What is 3 + 5 ?"
      const nums = (q.match(/\d+/g) || []).map(Number)
      const sum = (nums[0] || 0) + (nums[1] || 0)
      await page.locator('.gate-input').fill(String(sum))
      await page.locator('.gate-go').click()
      await wait(500)
      await shoot('parent', page, true)

      // Feedback footer — scroll the "Share your thoughts" link into view (it sits at
      // the bottom of the dashboard's inner scroll, above Reset progress).
      const fb = page.locator('.feedback-btn-standalone')
      if (await fb.count()) {
        await fb.scrollIntoViewIfNeeded()
        await wait(300)
        await shoot('feedback', page)
      } else {
        console.log('  ! feedback link not found (VITE_FEEDBACK_URL unset on this server?)')
      }
      await ctx.close()
    }
  } catch (e) {
    console.error('screenshot error:', e.message)
  }

  await browser.close()
  console.log(`\nSaved ${shots.length} shot(s) to ${OUT}`)
}
run().catch((e) => { console.error(e); process.exit(1) })
