/*
 * Bundle-size budget — the ENTRY chunk (the JS index.html loads on first paint) must stay
 * under a gzip budget. Guards the code-split perf win: re-adding an eager `import` of a heavy
 * library (e.g. Supabase) would silently balloon the initial JS again and slow slow devices,
 * with nothing to flag it. Runs against dist/ after a build (wired into verify:ui).
 *   ENTRY_BUDGET_KB=85 node scripts/verify-bundle-size.mjs
 */
import { readFileSync } from 'node:fs'
import zlib from 'node:zlib'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const BUDGET_KB = Number(process.env.ENTRY_BUDGET_KB || 85)

let html
try {
  html = readFileSync(path.join(DIST, 'index.html'), 'utf8')
} catch {
  console.error('✗ bundle-size: no dist/ — run `npm run build` first')
  process.exit(1)
}
const m = html.match(/assets\/(index-[^"']+\.js)/)
if (!m) {
  console.error('✗ bundle-size: entry chunk not found in dist/index.html')
  process.exit(1)
}
const raw = readFileSync(path.join(DIST, 'assets', m[1]))
const gzip = zlib.gzipSync(raw).length / 1024
console.log(`entry ${m[1]}: ${(raw.length / 1024).toFixed(1)} KB raw · ${gzip.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB)`)
if (gzip > BUDGET_KB) {
  console.error(`✗ bundle-size: entry ${gzip.toFixed(1)} KB gzip exceeds ${BUDGET_KB} KB — did a heavy dep get eagerly imported? Lazy-load it (see supabase.js) or raise ENTRY_BUDGET_KB deliberately.`)
  process.exit(1)
}
console.log('✓ bundle-size within budget')
