/*
 * Build ONE audio file of every Word Board word, back-to-back, plus a timestamped
 * tracklist — so you can listen straight through (e.g. on desktop) and catch any
 * mispronounced clips without tapping each cell in the app. Note the time (or the
 * word) of a bad one and hand the list back for a targeted --force regen.
 *
 *   npm install ffmpeg-static ffprobe-static --no-save
 *   node scripts/build-wordboard-review.mjs                 # default Aoede voice
 *   node scripts/build-wordboard-review.mjs --voice leda    # leda / sulafat
 *   node scripts/build-wordboard-review.mjs --order category # group by category (default: alpha)
 *
 * Outputs to scripts/_review/ (gitignored):
 *   wordboard-review-<voice>.mp3   — all words, ~0.6s gap between each
 *   wordboard-review-<voice>.md    — index · mm:ss · word · category · tier (+ any missing clips)
 * The Word Board speaks each word via voice(word) -> sounds[/<voice>]/phrases/<key>.mp3,
 * so this plays the exact same clips the child hears.
 */
import { WORDS } from '../src/data/phraseContent.js'
import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const args = process.argv.slice(2)
const VOICE = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : 'aoede'
const ORDER = args.includes('--order') ? args[args.indexOf('--order') + 1] : 'alpha'
const GAP = 0.6 // seconds of silence between words
const ffprobePath = ffprobeStatic.path

// Aoede is the flat sounds/phrases/; other voices live under sounds/<voice>/phrases/.
const clipDir = VOICE === 'aoede'
  ? path.join(ROOT, 'public', 'sounds', 'phrases')
  : path.join(ROOT, 'public', 'sounds', VOICE, 'phrases')

const OUT = path.join(__dirname, '_review')
const TMP = path.join(OUT, '_tmp')
rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })

const ff = (a) => execFileSync(ffmpegPath, a, { stdio: 'ignore' })
const durationOf = (f) =>
  Number(execFileSync(ffprobePath, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim()) || 0

// Order the words for a scannable list.
const words = [...WORDS]
if (ORDER === 'category') words.sort((a, b) => a.category.localeCompare(b.category) || a.word.localeCompare(b.word))
else words.sort((a, b) => a.word.localeCompare(b.word, 'en', { sensitivity: 'base' }))

// A single reusable silence clip at the common format.
const sil = path.join(TMP, '_sil.wav')
ff(['-y', '-f', 'lavfi', '-i', `anullsrc=r=24000:cl=mono`, '-t', String(GAP), sil])

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const listLines = []
const rows = []
const missing = []
let t = 0
let n = 0

for (const w of words) {
  const src = path.join(clipDir, `${w.key}.mp3`)
  if (!existsSync(src)) { missing.push(w); continue }
  n++
  const wav = path.join(TMP, `${String(n).padStart(3, '0')}.wav`)
  ff(['-y', '-i', src, '-ar', '24000', '-ac', '1', wav])
  const dur = durationOf(wav)
  rows.push({ i: n, at: t, ...w })
  listLines.push(`file '${wav.replace(/\\/g, '/')}'`)
  listLines.push(`file '${sil.replace(/\\/g, '/')}'`)
  t += dur + GAP
}

// Concatenate all the normalized WAVs (+ gaps) and encode one MP3.
const listFile = path.join(TMP, 'list.txt')
writeFileSync(listFile, listLines.join('\n'))
const outMp3 = path.join(OUT, `wordboard-review-${VOICE}.mp3`)
ff(['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c:a', 'libmp3lame', '-q:a', '4', outMp3])

// Tracklist.
const md = [
  `# Word Board review — ${VOICE} voice`,
  ``,
  `${rows.length} words · ~${mmss(t)} total · ${GAP}s gap · order: ${ORDER}.`,
  `Listen through; note the time (or word) of any that sound wrong and send the list back.`,
  ``,
  `| # | time | word | category | tier |`,
  `|---|------|------|----------|------|`,
  ...rows.map((r) => `| ${r.i} | ${mmss(r.at)} | ${r.word} | ${r.category} | ${r.tier} |`),
]
if (missing.length) {
  md.push(``, `## Missing clips (${missing.length}) — these chime in-app, no recording:`, ``)
  md.push(...missing.map((w) => `- ${w.word} (${w.category})`))
}
const outMd = path.join(OUT, `wordboard-review-${VOICE}.md`)
writeFileSync(outMd, md.join('\n'))

rmSync(TMP, { recursive: true, force: true })
console.log(`✓ ${rows.length} words → ${outMp3}`)
console.log(`✓ tracklist    → ${outMd}`)
if (missing.length) console.log(`· ${missing.length} words had no clip (listed in the tracklist)`)
console.log(`  total ~${mmss(t)}`)
