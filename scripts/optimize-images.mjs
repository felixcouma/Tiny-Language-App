/*
 * Optimize illustrations: public/images/*.png  →  WebP ~512px.
 * Cuts ~1 MB PNGs to ~40–80 KB each (≈20× smaller load + stops repo bloat).
 *
 * One-time dependency (not added to package.json — it's a heavy native binary):
 *   npm install sharp --no-save
 *
 * Usage:
 *   node scripts/optimize-images.mjs            # write .webp next to each .png
 *   node scripts/optimize-images.mjs --replace  # ...and delete the original .png
 *
 * The app prefers .webp (src/lib/images.js LOCAL_EXTS), so webp is used as soon
 * as it exists. Review the WebP quality, then re-run with --replace to drop the
 * big PNGs and shrink the repo.
 */
import { readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('Missing "sharp". Install it first:  npm install sharp --no-save')
  process.exit(1)
}

const DIR = 'public/images'
const replace = process.argv.includes('--replace')
const pngs = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith('.png'))

if (!pngs.length) {
  console.log('No PNGs to optimize in public/images/.')
  process.exit(0)
}

let before = 0
let after = 0
for (const f of pngs) {
  const src = join(DIR, f)
  const out = join(DIR, f.replace(/\.png$/i, '.webp'))
  const b = (await stat(src)).size
  await sharp(src)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out)
  const a = (await stat(out)).size
  before += b
  after += a
  if (replace) await unlink(src)
  console.log(`${f}  ${(b / 1024) | 0}KB → ${(a / 1024) | 0}KB`)
}
console.log(
  `\nTotal: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB` +
    (replace ? '  (PNGs removed)' : '  (PNGs kept — re-run with --replace when happy)'),
)
