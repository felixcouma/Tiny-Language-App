/*
 * Audio coverage guard — every phrase the app speaks via voice() must have a pre-rendered
 * clip in public/sounds/phrases/ (the Aoede default; the storybook voices fall back to it).
 * A missing clip plays a soft CHIME instead of the word — a silent failure with no console
 * error, straight against the speech-first mission. Uses the canonical spoken set so it can
 * never drift from what gen-tts generates. Run standalone or via `npm run check`.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spokenTexts } from '../src/data/spokenPhrases.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIR = path.join(__dirname, '..', 'public', 'sounds', 'phrases')
const slugify = (t) =>
  String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export function runAudioCoverageCheck({ fail, ok } = {}) {
  const report = fail || ((m) => console.error('✗', m))
  const pass = ok || ((m) => console.log('✓', m))
  const slugs = new Set()
  for (const t of spokenTexts()) { const s = slugify(t); if (s) slugs.add(s) }
  const missing = [...slugs].filter((s) => !existsSync(path.join(DIR, `${s}.mp3`)))
  for (const s of missing.slice(0, 40)) {
    report(`[audio] missing clip: public/sounds/phrases/${s}.mp3 (child would hear a chime, not the word)`)
  }
  if (missing.length > 40) report(`[audio] …and ${missing.length - 40} more missing`)
  if (!missing.length) pass(`audio coverage complete (${slugs.size} phrase clips present)`)
  return missing.length
}

if (process.argv[1]?.endsWith('verify-audio-coverage.mjs')) {
  if (runAudioCoverageCheck()) process.exit(1)
}
