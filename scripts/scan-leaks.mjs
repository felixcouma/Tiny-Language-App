/*
 * Scan every generated TTS clip for a baked-in style-prompt leak.
 *
 * The Gemini-TTS `input.prompt` (a *silent* delivery instruction) used to bleed
 * into the spoken audio. The generator no longer sends it, but clips made BEFORE
 * that fix and never re-recorded may still carry it. A leak adds a fixed ~5s of
 * narration, so a leaked clip is far larger than its text justifies.
 *
 * Detection = bytes-per-character outlier, computed against each clip's REAL text
 * (so long-but-legit clips like ABC songs / phonics prompts don't false-positive),
 * cross-checked against the same slug in the other voices.
 *
 *   node scripts/scan-leaks.mjs            # report suspects
 *   node scripts/scan-leaks.mjs --json     # machine-readable (for --force regen lists)
 */
import { readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS, PRAISE } from '../src/data/content.js'
import { WORDS, PHRASES } from '../src/data/phraseContent.js'
import { ABC_SONGS, abcKey } from '../src/data/abcSongs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOUNDS = path.join(__dirname, '..', 'public', 'sounds')
const JSON_OUT = process.argv.includes('--json')

const slugify = (t) =>
  String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/* ---- rebuild the exact text behind each clip key (mirrors gen-tts-gcloud.mjs) ---- */
const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']
function gamePrompts(item) {
  const w = item.word.toLowerCase()
  const out = []
  if (item.soundLabel) {
    out.push(`Listen… ${item.soundLabel}! Where is the ${w}?`)
    out.push(`find the ${w} — listen, ${item.soundLabel}!`)
  } else if (item.action) {
    out.push(`Which one is ${w}?`); out.push(`which one is ${w}?`)
  } else {
    out.push(`Can you find the ${w}?`); out.push(`find the ${w}!`)
  }
  out.push(`Yes! ${item.word}!`)
  out.push(item.action ? `Try again. Which one is ${w}?` : `Try again. Find the ${w}.`)
  return out
}
function phraseText() {
  const m = new Map()
  const add = (t) => { const s = slugify(t); if (s && !m.has(s)) m.set(s, t) }
  for (const w of WORDS) add(w.word)
  for (const size of Object.keys(PHRASES)) for (const e of PHRASES[size]) add(e.phrase)
  for (const world of WORLDS) for (const item of world.items) (item.expand || []).forEach(add)
  for (const world of WORLDS) if (POOL_IDS.includes(world.id))
    for (const item of world.items) if (!item.portrait) gamePrompts(item).forEach(add)
  ;['Audrey,', 'Adriel,', 'All done! Wonderful listening!'].forEach(add)
  PRAISE.forEach(add)
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(add)
  for (const world of WORLDS) if (POOL_IDS.includes(world.id))
    for (const item of world.items) if (!item.portrait)
      add(`Which one starts with ${item.word[0].toUpperCase()}? Find the ${item.word.toLowerCase()}!`)
  return m
}
function voiceText() {
  const m = new Map()
  for (const world of WORLDS) for (const item of world.items) {
    const key = item.sound, text = item.say || item.word
    if (key && text && !m.has(key)) m.set(key, text)
  }
  return m
}
function abcText() {
  const m = new Map()
  for (const s of ABC_SONGS) m.set(abcKey(s.letter), s.lyric)
  return m
}

const PHRASE_TXT = phraseText()
const VOICE_TXT = voiceText()
const ABC_TXT = abcText()

// folder -> text map for that folder's keys
const FOLDERS = [
  { dir: 'phrases', txt: PHRASE_TXT, voice: 'aoede', kind: 'phrase' },
  { dir: 'leda/phrases', txt: PHRASE_TXT, voice: 'leda', kind: 'phrase' },
  { dir: 'sulafat/phrases', txt: PHRASE_TXT, voice: 'sulafat', kind: 'phrase' },
  { dir: 'aoede', txt: VOICE_TXT, voice: 'aoede', kind: 'word' },
  { dir: 'leda', txt: VOICE_TXT, voice: 'leda', kind: 'word' },
  { dir: 'sulafat', txt: VOICE_TXT, voice: 'sulafat', kind: 'word' },
  { dir: 'abc-songs', txt: ABC_TXT, voice: 'aoede', kind: 'abc' },
]

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }

const all = []
for (const f of FOLDERS) {
  const abs = path.join(SOUNDS, f.dir)
  if (!existsSync(abs)) continue
  for (const name of readdirSync(abs)) {
    if (!name.endsWith('.mp3')) continue
    const key = name.slice(0, -4)
    // skip the 'word' folders' phrase-only keys: word folders only hold item.sound keys
    const text = f.txt.get(key)
    if (text == null) continue // not a known key in this folder (e.g. leftover) — report separately below
    const bytes = statSync(path.join(abs, name)).size
    const chars = Math.max(1, text.trim().length)
    all.push({ folder: f.dir, voice: f.voice, kind: f.kind, key, bytes, chars, bpc: bytes / chars, text })
  }
}

// Per-kind baseline bytes-per-char (robust median). A leak ~ fixed +narration, so
// short clips spike hardest; flag bpc well above the kind median AND a meaningful
// absolute excess so we don't chase tiny clips.
const kinds = [...new Set(all.map((r) => r.kind))]
const baseline = {}
for (const k of kinds) baseline[k] = median(all.filter((r) => r.kind === k).map((r) => r.bpc))

// Cross-voice: same slug across aoede/leda/sulafat phrase folders. A voice whose
// clip is >1.7x the min of its siblings is a strong leak signal.
const bySlug = new Map()
for (const r of all.filter((r) => r.kind === 'phrase' || r.kind === 'word')) {
  const g = bySlug.get(r.key) || []; g.push(r); bySlug.set(r.key, g)
}

const suspects = []
for (const r of all) {
  const base = baseline[r.kind]
  const bpcRatio = r.bpc / base
  const siblings = (bySlug.get(r.key) || []).filter((s) => s.kind === r.kind)
  const minSib = siblings.length > 1 ? Math.min(...siblings.map((s) => s.bytes)) : r.bytes
  const sibRatio = r.bytes / minSib
  // Estimated "expected" bytes from the kind baseline; excess is the suspected leak payload.
  const excess = r.bytes - base * r.chars
  const bpcHit = bpcRatio >= 1.9 && excess > 18000        // disproportionately large for its text
  const sibHit = sibRatio >= 1.7 && r.bytes - minSib > 18000 // an outlier vs its other-voice twins
  if (bpcHit || sibHit) suspects.push({ ...r, bpcRatio: +bpcRatio.toFixed(2), sibRatio: +sibRatio.toFixed(2), excessKB: Math.round(excess / 1024) })
}
suspects.sort((a, b) => b.bpcRatio - a.bpcRatio)

// Per-folder profile: median bytes/char + clip count + how many flagged. A whole
// folder generated with the leak shows a markedly higher median than its clean twins.
const folderProfile = {}
for (const f of FOLDERS) {
  const rows = all.filter((r) => r.folder === f.dir)
  if (!rows.length) continue
  folderProfile[f.dir] = {
    clips: rows.length,
    medBpc: Math.round(median(rows.map((r) => r.bpc))),
    medKB: +(median(rows.map((r) => r.bytes)) / 1024).toFixed(1),
    flagged: suspects.filter((s) => s.folder === f.dir).length,
  }
}

if (JSON_OUT) {
  // group suspects by folder for easy --force regen
  const byFolder = {}
  for (const s of suspects) (byFolder[s.folder] ||= []).push(s.key)
  console.log(JSON.stringify(byFolder, null, 2))
} else {
  console.log('Per-folder profile (median bytes/char · median KB · flagged/clips):')
  for (const [dir, p] of Object.entries(folderProfile))
    console.log(`  ${dir.padEnd(16)} bpc≈${String(p.medBpc).padStart(5)}  med≈${String(p.medKB).padStart(5)}KB  flagged ${p.flagged}/${p.clips}`)
  console.log('')
  console.log(`Scanned ${all.length} clips across ${FOLDERS.filter((f)=>existsSync(path.join(SOUNDS,f.dir))).length} folders.`)
  console.log('Baseline bytes/char by kind:', Object.fromEntries(kinds.map((k) => [k, Math.round(baseline[k])])))
  console.log(`\n${suspects.length} SUSPECTED LEAK${suspects.length === 1 ? '' : 'S'} (oversized for their text):\n`)
  for (const s of suspects) {
    console.log(`  ${s.folder}/${s.key}.mp3  ${Math.round(s.bytes / 1024)}KB  bpc×${s.bpcRatio} sib×${s.sibRatio} (+${s.excessKB}KB)  "${s.text.slice(0, 48)}"`)
  }
  if (!suspects.length) console.log('  (none)')
}
