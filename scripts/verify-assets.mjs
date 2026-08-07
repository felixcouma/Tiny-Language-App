/*
 * Asset integrity guard — catches "key points at a file that doesn't exist" (a blank visual
 * or dead animation / silent fx, with no console error):
 *   #3 every ACTION_ANIMATIONS frame .webp exists; every routine step's anim key is real and
 *      its img/tap resolves to an image.
 *   #6 every FX_KEYS entry has a public/sounds/fx/<key>.mp3 (else playFx silently no-ops).
 * Run standalone or via `npm run check`.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTINES } from '../src/data/routines.js'
import { ACTION_ANIMATIONS } from '../src/data/actionAnimations.js'
import { FX_KEYS } from '../src/data/fxKeys.js'
import { imageKeyFor } from '../src/data/phraseContent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const slugify = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const img = (k) => existsSync(path.join(ROOT, 'public', 'images', `${k}.webp`))
const fx = (k) => existsSync(path.join(ROOT, 'public', 'sounds', 'fx', `${k}.mp3`))
const leaves = (s) => (s.variants ? s.variants : [s])

export function runAssetIntegrityCheck({ fail, ok } = {}) {
  const report = fail || ((m) => console.error('✗', m))
  const pass = ok || ((m) => console.log('✓', m))
  let n = 0

  // #3a — every animation frame exists.
  for (const [key, cfg] of Object.entries(ACTION_ANIMATIONS)) {
    for (const frame of cfg.frames) {
      if (!img(frame)) { report(`[asset] animation ${key}: frame public/images/${frame}.webp missing`); n++ }
    }
  }

  // #3b — every routine step resolves to a real animation or image.
  for (const r of ROUTINES) {
    for (const s of r.steps.flatMap(leaves)) {
      if (s.anim) {
        if (!ACTION_ANIMATIONS[s.anim]) { report(`[asset] routine ${r.id}: anim "${s.anim}" not in ACTION_ANIMATIONS`); n++ }
        continue // frames already checked above
      }
      const key = s.img || imageKeyFor(s.tap) || slugify(s.tap)
      if (!img(key)) { report(`[asset] routine ${r.id} step "${s.tap}": image public/images/${key}.webp missing`); n++ }
    }
  }

  // #6 — every fx key has a sound file.
  for (const key of FX_KEYS) {
    if (!fx(key)) { report(`[asset] FX_KEYS "${key}" has no public/sounds/fx/${key}.mp3 (playFx would be silent)`); n++ }
  }

  if (!n) pass(`asset integrity clean (${Object.keys(ACTION_ANIMATIONS).length} animations, ${ROUTINES.length} routines, ${FX_KEYS.size} fx)`)
  return n
}

if (process.argv[1]?.endsWith('verify-assets.mjs')) {
  if (runAssetIntegrityCheck()) process.exit(1)
}
