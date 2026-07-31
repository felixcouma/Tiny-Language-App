/*
 * Verify the Word Board AAC redesign — STABLE symbol positions (SLP §S1).
 * The Core page is a fixed layout constant; a word must sit in the SAME cell across
 * category switch, CLEAR, reload, and profile switch. Includes a NEGATIVE check — the
 * board is non-blank on load and unchanged after a category round-trip — which fails
 * against the old blank/random-reveal behaviour, so the guarantee can't silently
 * regress. CLEAR must empty the message strip but never blank the board.
 * Run: node scripts/verify-word-board.mjs [http://localhost:5173/]
 */
import { chromium } from 'playwright'
import { CORE_BOARD } from '../src/data/phraseContent.js'

const APP = process.argv[2] || 'http://localhost:5173/'

const seed = `
  const profs = [
    { id:'child1', name:'Mia', initials:'MI', color:'#FF1493', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[], expectantPause:false },
    { id:'child2', name:'Leo', initials:'LE', color:'#1E90FF', stage:'first', limit:0, bedtime:null, phraseLevel:1, focusWords:[], enabledSongs:[], expectantPause:false },
  ];
  localStorage.setItem('tv_profiles_v1', JSON.stringify(profs));
  localStorage.setItem('tv_active_profile_v1', JSON.stringify('child1'));
  localStorage.setItem('tv_child_count_v1','2');
  localStorage.setItem('tv_onboarded','true');
  localStorage.setItem('tv_muted','1');
  class F extends EventTarget { constructor(s){ super(); this._src=''; if(s) this.src=s;} set src(v){ this._src=v; if(v) setTimeout(()=>this.dispatchEvent(new Event('ended')),6);} get src(){return this._src;} play(){return Promise.resolve();} pause(){} load(){} }
  window.Audio = F;
`

// Board cells expose their word via aria-label ("Say <word>"); a blank Find cell is
// "Find a word"/"Empty". Read the visible board's cell words in order.
const readCells = (page) =>
  page.$$eval('.wb-board .wb-cell', (els) =>
    els.map((e) => (e.getAttribute('aria-label') || '').replace(/^Say /, ''))
  )

const CORE = CORE_BOARD.join(' | ')

async function openBoard(page) {
  await page.goto(APP, { waitUntil: 'networkidle' })
  const skip = page.locator('.onb-skip')
  if (await skip.count()) { await skip.click(); await page.waitForTimeout(100) }
  await page.locator('.mode-grid').click()
  await page.waitForSelector('.wb-board', { timeout: 5000 })
  await page.waitForTimeout(150)
}

const run = async () => {
  const browser = await chromium.launch()
  let pass = true
  const errors = []
  const ok = (c, label) => { if (!c) pass = false; console.log(`  ${c ? 'OK ' : 'XX '} ${label}`) }

  const ctx = await browser.newContext()
  await ctx.addInitScript(seed)
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  console.log('\n[1] Core board is the fixed landing layout')
  await openBoard(page)
  const L1 = await readCells(page)
  ok(L1.join(' | ') === CORE, `Core page shows the fixed layout in order (${L1.length} cells)`)
  // NEGATIVE: old blank/random-reveal started with 0 filled cells → this fails on it.
  const filled = L1.filter((w) => w && w !== 'Find a word' && w !== 'Empty').length
  ok(filled === CORE_BOARD.length, `board is non-blank on load (${filled}/${CORE_BOARD.length} filled) — not the old reveal board`)

  console.log('\n[2] Position-stable across a category round-trip')
  await page.locator('.wb-cat', { hasText: 'Animals' }).click()
  await page.waitForTimeout(120)
  await page.locator('.wb-cat', { hasText: 'Core' }).click()
  await page.waitForTimeout(120)
  ok((await readCells(page)).join(' | ') === CORE, 'switching category and back leaves Core positions identical')

  console.log('\n[3] CLEAR empties the message strip but never blanks the board')
  await page.locator('.wb-board .wb-cell').nth(0).click()
  await page.locator('.wb-board .wb-cell').nth(1).click()
  await page.waitForTimeout(120)
  ok((await page.locator('.wb-chip').count()) >= 2, 'tapping cells builds a message')
  await page.locator('.wb-clear').click()
  await page.waitForTimeout(120)
  ok((await page.locator('.wb-chip').count()) === 0, 'CLEAR empties the message strip')
  ok((await readCells(page)).join(' | ') === CORE, 'CLEAR leaves the board untouched (positions stable)')

  console.log('\n[4] Stable across reload')
  await openBoard(page)
  ok((await readCells(page)).join(' | ') === CORE, 'Core positions identical after reload')

  console.log('\n[5] Stable across profile switch')
  await page.evaluate(() => localStorage.setItem('tv_active_profile_v1', JSON.stringify('child2')))
  await openBoard(page)
  ok((await readCells(page)).join(' | ') === CORE, 'Core positions identical for a different child')

  console.log('\n[6] Console')
  ok(errors.length === 0, `0 console errors (got ${errors.length}${errors.length ? ': ' + errors[0] : ''})`)

  await browser.close()
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — Word Board stable symbol positions verified.`)
  process.exit(pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(2) })
