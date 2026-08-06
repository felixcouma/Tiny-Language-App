/*
 * UI regression suite. Builds the app, serves the production build with `vite preview`,
 * then runs the headless Playwright verifiers against it and reports one pass/fail.
 * Meant as a pre-push gate so animation/console regressions can't slip out unnoticed.
 *
 *   npm run verify:ui              # build + preview + run the suite
 *   node scripts/verify-suite.mjs --no-build      # reuse existing dist/
 *   node scripts/verify-suite.mjs --full          # every verb in every device/motion combo
 *
 * Each check is a standalone scripts/verify-*.mjs that takes the base URL as argv[2] and
 * exits non-zero on failure (so this stays a thin orchestrator). Add a check = one line.
 */
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const args = process.argv.slice(2)
const NO_BUILD = args.includes('--no-build')
const FULL = args.includes('--full')
const PORT = 4173
const URL = `http://localhost:${PORT}/`
const isWin = process.platform === 'win32'
const npm = isWin ? 'npm.cmd' : 'npm'

// The checks to run, in order. Each is (script, [extra args]).
const CHECKS = [
  ['verify-actions.mjs', FULL ? ['--full'] : []], // action animations × device × reduced-motion
  ['verify-autoplay.mjs', []], // Auto Play advances + stops at the end (no loop)
  ['verify-song-anims.mjs', []], // song animations (all 12 config-driven songs)
  ['verify-song-player.mjs', []], // Sing with Pip player: transport + auto-advance + stop-at-end
  ['verify-parent-insights.mjs', []], // twin nudge · say-it-at-home · why notes · focus-first Auto Play
  ['verify-word-board.mjs', []], // AAC board: stable symbol positions across switch/CLEAR/reload/profile
  ['verify-routines.mjs', []], // Every Day with Pip: picker → player → tap-advance → finale
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(1500) })
      if (r.ok) return true
    } catch { /* not up yet */ }
    await sleep(500)
  }
  return false
}

function killTree(child) {
  if (!child || child.killed) return
  if (isWin) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else { try { process.kill(-child.pid, 'SIGKILL') } catch { child.kill('SIGKILL') } }
}

const run = async () => {
  // 1. Build (prebuild runs `npm run check`) unless reusing dist/.
  if (!NO_BUILD) {
    console.log('▶ building production bundle…')
    const b = spawnSync(npm, ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: isWin })
    if (b.status !== 0) { console.error('✗ build failed'); process.exit(1) }
  }

  // 2. Serve the built app.
  console.log(`▶ starting preview server on ${URL} …`)
  const server = spawn(npm, ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT, stdio: 'ignore', shell: isWin, detached: !isWin,
  })
  let failed = false
  try {
    if (!(await waitForServer(URL))) { console.error('✗ preview server never came up'); killTree(server); process.exit(1) }

    // 3. Run each check against the preview URL; collect failures.
    const failedChecks = []
    for (const [script, extra] of CHECKS) {
      console.log(`\n▶ ${script} ${extra.join(' ')}`)
      const r = spawnSync('node', [path.join(__dirname, script), URL, ...extra], { cwd: ROOT, stdio: 'inherit' })
      if (r.status !== 0) failedChecks.push(script)
    }

    console.log('\n==================================================')
    if (failedChecks.length) {
      console.log(`❌ SUITE FAILED — ${failedChecks.length} check(s): ${failedChecks.join(', ')}`)
      failed = true
    } else {
      console.log('✅ SUITE PASSED — all UI checks green.')
    }
  } finally {
    killTree(server)
  }
  process.exit(failed ? 1 : 0)
}
run().catch((e) => { console.error(e); process.exit(2) })
