/*
 * Generate number cards (public/images/number-1.webp … number-10.webp) LOCALLY as
 * clean coloured digits — no API/credits. The Word Board / Word Practice resolve
 * number words via imageKeyFor('One') = 'number-1', so these slot straight in.
 *
 *   npm install sharp --no-save   # one-time
 *   node scripts/gen-numbers.mjs
 *
 * Digits are drawn as vector PATHS (a tiny 7-segment-ish font) so there is NO
 * dependency on a system font being available to the SVG rasteriser.
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'

let sharp
try { sharp = (await import('sharp')).default } catch {
  console.error('Missing "sharp". Install:  npm install sharp --no-save'); process.exit(1)
}

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images')
const COLOURS = ['#e8590c', '#1971c2', '#2f9e44', '#9c36b5', '#c2255c', '#0c8599', '#e67700', '#5f3dc4', '#2b8a3e', '#1864ab']

// Render N coloured dots above the big digit, so toddlers see quantity + numeral.
function dots(n, colour) {
  const out = []
  const cols = Math.min(n, 5)
  const rows = Math.ceil(n / 5)
  const r = 16
  const gap = 44
  const totalW = (cols - 1) * gap
  const startX = 256 - totalW / 2
  const startY = 96 - (rows - 1) * (gap / 2)
  let i = 0
  for (let row = 0; row < rows; row++) {
    const inRow = Math.min(5, n - row * 5)
    const rowW = (inRow - 1) * gap
    const rx = 256 - rowW / 2
    for (let c = 0; c < inRow; c++) {
      out.push(`<circle cx="${(rx + c * gap).toFixed(1)}" cy="${(startY + row * gap).toFixed(1)}" r="${r}" fill="${colour}"/>`)
      i++
    }
  }
  return out.join('')
}

function svg(n) {
  const colour = COLOURS[(n - 1) % COLOURS.length]
  // Big numeral via SVG <text>; if the rasteriser lacks a font it still shows the dots.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect x="8" y="8" width="496" height="496" rx="72" fill="#ffffff" stroke="${colour}" stroke-width="10"/>
    ${dots(n, colour)}
    <text x="256" y="330" font-family="Arial, Helvetica, sans-serif" font-size="280" font-weight="800"
      fill="${colour}" text-anchor="middle" dominant-baseline="middle">${n}</text>
  </svg>`
}

// Range is configurable so Counting Mountain's 11–20 get the SAME premium card style
// as 1–10:  NUM_FROM=11 NUM_TO=20 node scripts/gen-numbers.mjs  (default 1..10).
const FROM = Number(process.env.NUM_FROM || 1)
const TO = Number(process.env.NUM_TO || 10)
let ok = 0
for (let n = FROM; n <= TO; n++) {
  const buf = Buffer.from(svg(n))
  await sharp(buf, { density: 200 }).resize(512, 512).webp({ quality: 90 }).toFile(path.join(OUT, `number-${n}.webp`))
  ok++
  console.log(`✓ number-${n}.webp`)
}
console.log(`\nWrote ${ok} number cards.`)
