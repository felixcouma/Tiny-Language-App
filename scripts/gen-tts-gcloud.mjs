/*
 * Cloud Text-to-Speech backend (Google Cloud, NOT AI Studio).
 *
 * Same warm Gemini-TTS voices (Aoede / Leda / Sulafat) as scripts/gen-audio.mjs +
 * gen-phrases.mjs, but billed through Google Cloud — a separate path from the
 * depleted AI Studio prepayment credits. Cloud TTS returns MP3 directly, so this
 * needs no lamejs/PCM step.
 *
 * One-time setup (see docs/TTS_GCLOUD_SETUP.md):
 *   gcloud auth application-default login
 *   gcloud auth application-default set-quota-project YOUR_PROJECT
 *   gcloud services enable texttospeech.googleapis.com
 *
 * Run (resumable, skips existing):
 *   node scripts/gen-tts-gcloud.mjs                 # voice clips: counting+family FIRST, then the rest
 *   node scripts/gen-tts-gcloud.mjs --kind phrases  # the phrase backlog (single Aoede folder)
 *   node scripts/gen-tts-gcloud.mjs --voices aoede  # one voice only
 *   node scripts/gen-tts-gcloud.mjs --force         # regenerate existing
 *
 * Env: TTS_MODEL (default gemini-2.5-flash-tts), PACE_MS (default 600),
 *      GOOGLE_TTS_MODE=chirp to use the FREE Chirp 3 HD voices instead (different
 *      voice → pair with --force to re-record a folder).
 */
import { GoogleAuth } from 'google-auth-library'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { WORLDS, PRAISE } from '../src/data/content.js'
import { WORDS, PHRASES, CORE_BOARD } from '../src/data/phraseContent.js'
import { ABC_SONGS, abcKey } from '../src/data/abcSongs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOUNDS = path.join(__dirname, '..', 'public', 'sounds')

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const KIND = args.includes('--kind') ? args[args.indexOf('--kind') + 1] : 'voices'
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const MATCH = args.includes('--match') ? args[args.indexOf('--match') + 1] : null // substring filter on key
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : 0
const VOICES = (args.includes('--voices') ? args[args.indexOf('--voices') + 1] : 'aoede,leda,sulafat')
  .split(',').map((v) => v.trim()).filter(Boolean)

const MODEL = process.env.TTS_MODEL || 'gemini-2.5-flash-tts'
const PACE_MS = Number(process.env.PACE_MS || 600) // Cloud TTS has no 10-req/min cap; stay polite
const MODE = process.env.GOOGLE_TTS_MODE || 'gemini' // 'gemini' (Aoede, paid) | 'chirp' (free, new voice)
const ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

// Capitalised Gemini-TTS voice name for the API (folders stay lower-case).
const apiVoice = (v) => v.charAt(0).toUpperCase() + v.slice(1)
// Free Chirp 3 HD stand-ins, one per persona folder (used only when MODE=chirp).
const CHIRP_VOICE = { aoede: 'en-US-Chirp3-HD-Aoede', leda: 'en-US-Chirp3-HD-Leda', sulafat: 'en-US-Chirp3-HD-Sulafat' }

// NO style prompt. The Gemini-TTS `input.prompt` is a delivery instruction that is
// supposed to be silent, but it bled into the spoken audio (heard on the counting
// cards and in Twin Mode). The Aoede/Leda/Sulafat voices are warm by default, so we
// send ONLY the text — guaranteeing nothing can be vocalised. (See docs/Observations.md.)

const slugify = (t) =>
  String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/* ---- voice-clip rows (mirror gen-audio.mjs) ---- */
function voiceRows() {
  const rows = new Map()
  for (const world of WORLDS) {
    for (const item of world.items) {
      const key = item.sound
      const text = item.say || item.word
      if (!key || !text || rows.has(key)) continue
      rows.set(key, { key, text })
    }
  }
  let items = [...rows.values()]
  if (ONLY) { const set = new Set(ONLY.split(',').map((s) => s.trim())); items = items.filter((r) => set.has(r.key)) }
  // Re-records first: counting (number-*) + family (home-*).
  const PRIORITY = /^(number-|home-)/
  items.sort((a, b) => (PRIORITY.test(b.key) ? 1 : 0) - (PRIORITY.test(a.key) ? 1 : 0))
  return items
}

/* ---- phrase rows (mirror gen-phrases.mjs) ---- */
const POOL_IDS = ['safari-island', 'things-i-do', 'my-body', 'home-village']
// MUST mirror SoundGameScreen/TwinModeScreen buildPrompt (same strings → same clips).
const PROMPT_CUE = { Zebra: 'Black and white stripes', Butterfly: 'Pretty wings', Turtle: 'Slow and steady', Elephant: 'Errrrrr' }
function gamePrompts(item) {
  const w = item.word.toLowerCase()
  const out = []
  if (item.soundLabel) out.push(`${PROMPT_CUE[item.word] || item.soundLabel}! Where's the ${w}?`)
  else if (item.action) out.push(item.word === 'Peekaboo' ? "Who's playing peekaboo?" : `Who's ${w}?`)
  else out.push(`Where's the ${w}?`)
  out.push(`Yes! ${item.word}!`)
  out.push(item.action ? `Try again. Which one is ${w}?` : `Try again. Find the ${w}.`)
  return out
}
function phraseRows() {
  const bySlug = new Map()
  const add = (t) => { const s = slugify(t); if (s && !bySlug.has(s)) bySlug.set(s, { key: s, text: t }) }
  for (const w of WORDS) add(w.word)
  for (const w of CORE_BOARD) add(w) // AAC core board words (some aren't in WORDS)
  for (const size of Object.keys(PHRASES)) for (const e of PHRASES[size]) add(e.phrase)
  for (const world of WORLDS) for (const item of world.items) (item.expand || []).forEach(add)
  for (const world of WORLDS) {
    if (!POOL_IDS.includes(world.id)) continue
    for (const item of world.items) if (!item.portrait) gamePrompts(item).forEach(add)
  }
  // Twin Mode: per-child name clips (spoken before a turn), the generic "Your turn!"
  // cue for children without a name clip, and the shared finale line.
  ;['Audrey,', 'Adriel,', 'Ezra,', 'Leila,', 'Ethan,', 'Your turn!', 'All done! Wonderful listening!'].forEach(add)
  PRAISE.forEach(add) // rotating praise words spoken on a correct answer
  // Single letters (Learning + Word Practice "starts with X" buttons play voice(letter)).
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(add)
  // Phonics prompts ("Which one starts with D? Find the dog!") — mirror PhonicsGameScreen.
  for (const world of WORLDS) {
    if (!POOL_IDS.includes(world.id)) continue
    for (const item of world.items) if (!item.portrait) {
      add(`Which one starts with ${item.word[0].toUpperCase()}? Where's the ${item.word.toLowerCase()}?`)
    }
  }
  return [...bySlug.values()]
}

/* ---- ABC song rows (one warm clip per letter) ---- */
function abcRows() {
  let rows = ABC_SONGS.map((s) => ({ key: abcKey(s.letter), text: s.lyric }))
  if (ONLY) { const set = new Set(ONLY.split(',').map((x) => x.trim().toLowerCase())); rows = rows.filter((r) => set.has(r.key)) }
  return rows
}

/* ---- Cloud TTS call ---- */
const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' })
let client
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function synth(voiceFolder, text, key) {
  const voice =
    MODE === 'chirp'
      ? { languageCode: 'en-US', name: CHIRP_VOICE[voiceFolder] || CHIRP_VOICE.aoede }
      : { languageCode: 'en-US', name: apiVoice(voiceFolder), model_name: MODEL }
  // Text only — no style prompt (it leaked into the audio). Warmth is inherent to the voice.
  const input = { text }
  const resp = await client.request({
    url: ENDPOINT,
    method: 'POST',
    data: { input, voice, audioConfig: { audioEncoding: 'MP3' } },
  })
  const b64 = resp?.data?.audioContent
  return b64 ? Buffer.from(b64, 'base64') : null
}

/* ---- run ---- */
let items = KIND === 'phrases' ? phraseRows() : KIND === 'abc-songs' ? abcRows() : voiceRows()
// --only a,b : EXACT keys (works for every kind incl. phrases — regen just those clips).
if (ONLY) { const set = new Set(ONLY.split(',').map((s) => s.trim())); items = items.filter((it) => set.has(it.key)) }
if (MATCH) items = items.filter((it) => it.key.includes(MATCH)) // --match number- : targeted (re)gen
if (LIMIT) items = items.slice(0, LIMIT) // --limit N: generate only the first N (for a quick test)
// For phrases, Aoede lives in the flat sounds/phrases/ (the app default); the other voices get
// sounds/<voice>/phrases/ so the voice toggle can switch the WHOLE UI. Voice clips: sounds/<voice>/.
const targets =
  KIND === 'abc-songs' ? [{ folder: 'abc-songs', voice: 'aoede' }] // one warm clip per letter
  : KIND === 'phrases' ? VOICES.map((v) => ({ folder: v === 'aoede' ? 'phrases' : `${v}/phrases`, voice: v }))
  : VOICES.map((v) => ({ folder: v, voice: v }))
console.log(`kind=${KIND} mode=${MODE} model=${MODEL} folders=[${targets.map((t) => t.folder).join(', ')}] items=${items.length}`)

client = await auth.getClient()
const res = { ok: 0, skipped: 0, failed: [] }
let billHits = 0
let stop = false
for (const { folder, voice } of targets) {
  if (stop) break
  const dir = path.join(SOUNDS, folder)
  mkdirSync(dir, { recursive: true })
  console.log(`\n--- ${folder} ---`)
  for (let i = 0; i < items.length; i++) {
    const { key, text } = items[i]
    const out = path.join(dir, `${key}.mp3`)
    if (!FORCE && existsSync(out)) { res.skipped++; continue }
    try {
      let mp3 = await synth(voice, text, key)
      if (!mp3) { await sleep(1200); mp3 = await synth(voice, text, key) }
      if (!mp3) throw new Error('no audioContent (after retry)')
      writeFileSync(out, mp3)
      res.ok++
      billHits = 0
      console.log(`  (${i + 1}/${items.length}) ✓ ${folder}/${key}.mp3 (${Math.round(mp3.length / 1024)} KB)`)
    } catch (e) {
      const msg = String(e?.response?.data?.error?.message || e?.message || e)
      const fatal = /billing|credits|PERMISSION_DENIED|403|has not been used|disabled/i.test(msg)
      const perMinute = !fatal && /RESOURCE_EXHAUSTED|429|quota|per_minute|per-minute/i.test(msg)
      if (perMinute) {
        // Per-minute quota: wait for the window to reset and RETRY the same item, so one run
        // self-paces through the whole set. Bail only if it never recovers (likely a daily cap).
        if (++billHits > 14) { console.log('\nQuota not recovering (~8 min) — likely a daily cap. Stopping.'); stop = true; break }
        console.log(`  …per-minute quota, waiting 35s and retrying (${billHits})`)
        await sleep(35000)
        i-- // retry this same item
        continue
      }
      res.failed.push({ folder, key, err: msg.slice(0, 160) })
      console.log(`  (${i + 1}/${items.length}) ✗ ${folder}/${key} — ${msg.slice(0, 160)}`)
      if (fatal) { console.log('\nStopping — billing / permission / API-disabled. See docs/TTS_GCLOUD_SETUP.md.'); stop = true; break }
    }
    await sleep(PACE_MS)
  }
}
console.log(`\n=== SUMMARY ===\nok: ${res.ok}  skipped: ${res.skipped}  failed: ${res.failed.length}`)
if (res.failed.length) console.log('failed:', JSON.stringify(res.failed.slice(0, 20), null, 2))
