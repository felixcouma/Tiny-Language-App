/*
 * Trim song recordings to end at a marked cut point (drops a trailing second section
 * that isn't the song). A 0.5s fade-out is applied at the cut so the end is gentle,
 * not an abrupt click. Cut points were found by ear with scripts/cut-helper.html.
 *
 * Uses static ffmpeg/ffprobe (install --no-save; not app deps):
 *   npm install ffmpeg-static ffprobe-static --no-save
 *   node scripts/trim-songs.mjs           # trims per CUTS below
 *   node scripts/trim-songs.mjs --dry     # probe + plan only, writes nothing
 *
 * Re-cutting: originals are committed in git — `git checkout -- public/sounds/songs/<id>.mp3`
 * to restore, then adjust CUTS and re-run. The script skips files already <= their cut.
 */
import { execFileSync } from 'node:child_process'
import { renameSync, existsSync, rmSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIR = path.join(__dirname, '..', 'public', 'sounds', 'songs')
const ffprobePath = ffprobeStatic.path
const dry = process.argv.includes('--dry')
const FADE = 0.5 // seconds of fade-out ending exactly at the cut

// id → cut point in seconds (song ends here; everything after is dropped)
const CUTS = {
  'im-a-little-teapot': 38.403,
  'the-alphabet-song': 76.679,
  'bingo': 87.125,
  'twinkle-twinkle-little-star': 61.788,
  'one-two-buckle-my-shoe': 54.826,
  'mary-had-a-little-lamb': 102.862,
  'hickory-dickory-dock': 57.244,
  'are-you-sleeping': 62.772,
}

const dur = (file) =>
  Number(execFileSync(ffprobePath, ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file]).toString().trim())
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.round((s % 1) * 1000)).padStart(3, '0')}`

let changed = 0
const locked = []
for (const [id, cut] of Object.entries(CUTS)) {
  const src = path.join(DIR, `${id}.mp3`)
  if (!existsSync(src)) { console.log(`? ${id} — file missing, skipped`); continue }
  const before = dur(src)
  if (before <= cut + 0.05) { console.log(`· ${id} — already ${fmt(before)} ≤ cut ${fmt(cut)}, skipped`); continue }
  const st = Math.max(0, cut - FADE).toFixed(3)
  console.log(`✂ ${id}: ${fmt(before)} → ${fmt(cut)}  (fade out ${st}s–${cut.toFixed(3)}s)`)
  if (dry) continue
  const tmp = path.join(DIR, `${id}.trim.mp3`)
  execFileSync(ffmpegPath, [
    '-y', '-i', src,
    '-t', String(cut),
    '-af', `afade=t=out:st=${st}:d=${FADE}`,
    '-c:a', 'libmp3lame', '-q:a', '2',
    tmp,
  ], { stdio: ['ignore', 'ignore', 'ignore'] })
  const after = dur(tmp)
  // Windows can lock the destination (Defender scan, or a browser/player with the mp3
  // open) → EPERM. Retry a few times; if still locked, skip and keep going.
  let renamed = false
  for (let attempt = 1; attempt <= 6 && !renamed; attempt++) {
    try { renameSync(tmp, src); renamed = true }
    catch (e) {
      if (e.code !== 'EPERM') throw e
      if (attempt < 6) { console.log(`   … locked, retry ${attempt}/5`); await sleep(600) }
    }
  }
  if (renamed) { console.log(`   ✓ now ${fmt(after)}`); changed++ }
  else { rmSync(tmp, { force: true }); locked.push(id); console.log(`   ⚠ ${id}.mp3 is locked — skipped (close any player/tab with it open, then re-run)`) }
}
console.log(`\n${dry ? 'dry run — ' : ''}${changed} trimmed.${locked.length ? ` ${locked.length} locked: ${locked.join(', ')}` : ''}`)
