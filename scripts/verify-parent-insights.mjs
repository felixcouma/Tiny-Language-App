/*
 * Regression test for the parent-insight + focus-word features (competitive-review round):
 *   A) TWIN DIVERGENCE NUDGE — with two children and divergent progress, the parent area shows
 *      one gentle cooperative card naming the leader, the lagger, and a world to try together.
 *   B) "SAY IT AT HOME" card — appears when focus words are pinned and lists them.
 *   C) "WHY" notes — the plain-language rationale lines under the therapy settings are present.
 *   D) FOCUS-FIRST AUTO PLAY + legibility — on a world containing a pinned focus word, enabling
 *      Auto Play LEADS with that word and the "Practice word" marker shows.
 * Runs muted so playItem resolves instantly (Auto Play still leads). The grown-up gate is a plain
 * sum rendered in the DOM, so the test reads it and answers. Run: node scripts/verify-parent-insights.mjs [url]
 */
import { chromium } from 'playwright'

const APP = process.argv[2] || 'http://localhost:5173/'

// Two children with DIVERGENT saved progress: Mia has explored Safari Island (+ Things I Do)
// a lot this week; Leo has barely played and never visited Safari. Mia has 'Ball' pinned as a
// focus word (Ball lives in the Home Village world). Progress lives per-child in localStorage.
const SEED = `
  const now = Date.now();
  const recent = (words) => Object.fromEntries(words.map((w,i) => [w, now - i*1000]));
  const profs = [
    { id:'guest', name:'Everyone', color:'#20B2AA', stage:'first', limit:0, bedtime:null, phraseLevel:1, guest:true, focusWords:[], enabledSongs:[], expectantPause:false },
    { id:'child1', name:'Mia', initials:'MI', color:'#FF1493', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:['Ball'], enabledSongs:[], expectantPause:false },
    { id:'child2', name:'Leo', initials:'LE', color:'#1E90FF', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[], expectantPause:false },
  ];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('child1'));
  localStorage.setItem('tv_child_count_v1','2');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','1');
  localStorage.setItem('tv_progress_v1__child1', JSON.stringify({
    lastSeen: recent(['Lion','Zebra','Giraffe','Monkey','Elephant']),
    byWorld: { 'safari-island': 5, 'things-i-do': 2 },
    week: { start: '', byWorld: { 'safari-island': 5, 'things-i-do': 2 }, wordsHeard: 12 },
  }));
  localStorage.setItem('tv_progress_v1__child2', JSON.stringify({
    lastSeen: recent(['Mommy']),
    byWorld: { 'home-village': 1 },
    week: { start: '', byWorld: { 'music-forest': 3 }, wordsHeard: 4 },
  }));
`

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  await ctx.addInitScript(SEED)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  const fails = []
  const ok = (c, label) => { if (!c) fails.push(label); console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip'); if (await skip.count()) { await skip.click(); await page.waitForTimeout(150) }

  // Enter the (gated) parent area: click the grown-up button, solve the sum, submit.
  await page.locator('.home2-parent').click()
  await page.waitForSelector('.gate-q', { timeout: 5000 })
  const q = await page.locator('.gate-q').textContent()
  const m = (q || '').match(/(\d+)\s*\+\s*(\d+)/)
  ok(!!m, `grown-up gate shows a sum ("${(q || '').trim()}")`)
  await page.locator('.gate-input').fill(String(Number(m[1]) + Number(m[2])))
  await page.locator('.gate-go').click()
  await page.waitForSelector('.parent-main', { timeout: 5000 })

  // A0) weekly narrative — "This week with Pip": one line per child, each naming the world
  //     they explored most this rolling week (from progress.week.byWorld).
  const week = page.locator('.gu-week')
  ok((await week.count()) === 1, '"This week with Pip" weekly card is shown')
  const weekText = (await week.textContent().catch(() => '')) || ''
  ok(/Mia/.test(weekText) && /Safari Island/.test(weekText), `weekly: Mia loved Safari Island ("${weekText.trim()}")`)
  ok(/Leo/.test(weekText) && /Music Forest/.test(weekText), 'weekly: Leo loved Music Forest')

  // A) twin divergence nudge
  const nudge = page.locator('.twin-nudge')
  ok((await nudge.count()) === 1, 'twin divergence nudge is shown')
  const nudgeText = (await nudge.textContent().catch(() => '')) || ''
  ok(/Mia/.test(nudgeText) && /Leo/.test(nudgeText), `nudge names both children ("${nudgeText.trim()}")`)
  ok(/Safari Island/.test(nudgeText), 'nudge points to the world the lagging twin has not visited (Safari Island)')

  // B) "Say it at home" card lists the pinned focus word (Focus Words is a collapsed
  //    panel now — open it first).
  await page.locator('.parent-panel-head', { hasText: 'Focus Words' }).click()
  await page.waitForTimeout(150)
  const tip = page.locator('.home-tip')
  ok((await tip.count()) === 1, '"Say it at home" card is shown when focus words are pinned')
  ok(/Ball/.test((await tip.textContent().catch(() => '')) || ''), 'the card lists the pinned focus word (Ball)')

  // C) plain-language "why" notes under the therapy settings. Wait time is an open
  //     panel; Storybook voice is collapsed, so open it before counting both notes.
  await page.locator('.parent-panel-head', { hasText: 'Storybook voice' }).click()
  await page.waitForTimeout(150)
  ok((await page.locator('.voice-why').count()) >= 2, 'the "why" rationale notes are present (wait time + voice)')

  // D) focus-first Auto Play + "Practice word" marker, in a world that has the focus word
  await page.locator('.icon-btn[aria-label="Back to home"]').click()
  await page.waitForTimeout(200)
  await page.locator('.world-card', { hasText: 'Home Village' }).click()
  await page.waitForSelector('.l2-word', { timeout: 8000 })
  const firstWord = (await page.locator('.l2-word').textContent().catch(() => '') || '').trim()
  ok(firstWord !== 'Ball', `starts on a non-focus word ("${firstWord}")`)
  await page.locator('.l2-auto').click() // enable Auto Play → should LEAD with the focus word
  await page.waitForTimeout(400)
  const ledWord = (await page.locator('.l2-word').textContent().catch(() => '') || '').trim()
  ok(ledWord === 'Ball', `Auto Play leads with the focus word ("${ledWord}")`)
  ok((await page.locator('.l2-focus').count()) === 1, 'the "Practice word" marker is shown on the focus word')
  await page.locator('.l2-auto').click() // stop before it advances

  ok(errors.length === 0, `0 console errors${errors.length ? ': ' + errors[0] : ''}`)
  await browser.close()
  console.log(`\n${fails.length ? '❌ FAIL' : '✅ PASS'} — parent insights (twin nudge · say-it-at-home · why notes · focus-first).`)
  process.exit(fails.length ? 1 : 0)
}
run().catch((e) => { console.error(e); process.exit(2) })
