/*
 * Generate song-animation key poses with the Vertex image model. Each animated song
 * has ONE consistent character/scene that acts out its lyrics: a base pose is drawn
 * fresh (no anchor), then the action poses are anchored on that base so every frame
 * is the same character. Toddlers see the thing the song is ABOUT (a teapot, a star,
 * a mouse, a lamb) — not a child role-playing it.
 *
 *   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/scripts/gcloud-sa-key.json"
 *   export VERTEX_PROJECT="gen-lang-client-0993546173"
 *   node scripts/gen-song-poses.mjs --song teapot            # one song's poses
 *   node scripts/gen-song-poses.mjs --song star,clock,lamb   # several
 *   node scripts/gen-song-poses.mjs --song clock --only song-clock-one --force
 *
 * Adding a song = add an entry to SONGS here (base pose has anchor:null, first in the
 * list), then a config in src/data/songAnimations.js + `animated:true` in songs.js.
 * Head/Shoulders lives in the older toddler-anchor flow, not here.
 */
import { GoogleGenAI } from '@google/genai'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.join(__dirname, '..', 'public', 'images')
const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const which = args.includes('--song') ? args[args.indexOf('--song') + 1].split(',') : ['teapot']
const force = args.includes('--force')
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.VERTEX_PROJECT,
  location: process.env.VERTEX_LOCATION || 'global',
})
const extract = (r) => (r?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data)?.inlineData?.data
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const anchorOf = (key) => {
  // Prefer a freshly written PNG (this run), else the committed WebP. Returns null if
  // neither exists (e.g. the base pose failed) so the caller can skip, not crash.
  const png = path.join(IMG, `${key}.png`)
  if (existsSync(png)) return { mimeType: 'image/png', data: readFileSync(png).toString('base64') }
  const webp = path.join(IMG, `${key}.webp`)
  if (existsSync(webp)) return { mimeType: 'image/webp', data: readFileSync(webp).toString('base64') }
  return null
}

// Shared look. Backgrounds live per-song (some want a night sky / grass), so they're
// NOT baked in here. "no captions or written words" avoids the model lettering the art.
const STYLE =
  'Thick dark outlines, flat-vector children’s-book illustration style, bright cheerful ' +
  'colours, the whole subject centered with a little headroom, no captions or written words.'

// Character descriptions reused across a song's poses so the base + actions match.
const TEAPOT =
  'a cute friendly cartoon TEAPOT character in a warm cheerful ORANGE colour: a round ' +
  'orange pot body with a big smiling face on the front (two round eyes, rosy cheeks), a ' +
  'small lid with a knob on top, a curved handle on the LEFT side and a pouring spout on ' +
  'the RIGHT side, and two little cartoon stick arms'
const STAR =
  'a cute friendly cartoon STAR character: a plump five-pointed golden-yellow star with a ' +
  'big smiling face — two round eyes and rosy cheeks — and two little cartoon stick arms'
const MOUSE =
  'a cute little grey cartoon MOUSE with big round ears, a friendly smile and a long thin ' +
  'tail, beside a tall brown wooden grandfather (long-case pendulum) CLOCK with a round ' +
  'white clock face'
const LAMB =
  'a cute fluffy white cartoon LAMB with a soft curly woolly coat, a happy smiling face, ' +
  'little dark legs, ears and hooves'
const DOG =
  'a cute cartoon puppy DOG named Bingo: brown and white with big floppy ears, a friendly ' +
  'smile, a little black nose and a waggy tail'
const OWL =
  'a cute cartoon baby OWL: round and fluffy with big friendly eyes, small wings, sitting ' +
  'happily and singing with a few little music notes nearby'
const BABY =
  'a cute cartoon sleepy BABY wrapped snugly in a soft pastel blanket, calm and cozy with ' +
  'gently closing eyes'
const BEAR =
  'a cute cartoon brown BEAR wearing a soft nightcap, sleepy and gentle'
const SLEIGH =
  'a cheerful red horse-drawn SLEIGH with one happy bundled-up child riding in it and a ' +
  'friendly brown horse pulling it, gliding over snow'

// Songs that REUSE the existing Head/Shoulders toddler (public/images/song-ready.webp)
// as the anchor — every pose conditions on that same child, no fresh base drawn.
const CHILD_ANCHOR = 'song-ready'

// Per-song pose lists. Base pose (anchor:null) MUST be first; later poses anchor on it.
const SONGS = {
  teapot: {
    subject: 'teapot', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-teapot-body', anchor: null,
        action: `Draw ${TEAPOT}. Standing upright and happy, both arms relaxed, singing with a cheerful open smile.` },
      { key: 'song-teapot-handle', anchor: 'song-teapot-body',
        action: 'The teapot points at its own curved HANDLE with its little left arm, smiling proudly.' },
      { key: 'song-teapot-spout', anchor: 'song-teapot-body',
        action: 'The teapot points at its own SPOUT with its little right arm, smiling proudly.' },
      { key: 'song-teapot-steam', anchor: 'song-teapot-body',
        action: 'The teapot is all steamed up: fluffy white steam puffs rising from the tip of the spout, cheeks a bit rosier, mouth open singing excitedly.' },
      { key: 'song-teapot-tip', anchor: 'song-teapot-body',
        action: 'The teapot is tipping over to one side, leaning so the spout tilts downward with a gentle stream of tea pouring out of it, still smiling happily.' },
    ],
  },

  star: {
    subject: 'star', bg: 'on a soft deep-blue night-sky background with a few tiny faraway stars',
    poses: [
      { key: 'song-star-twinkle', anchor: null,
        action: `Draw ${STAR}. Floating happily, a few little sparkle marks twinkling around it.` },
      { key: 'song-star-wonder', anchor: 'song-star-twinkle',
        action: 'The star tilts its head with a curious, wondering look, one little arm up to its cheek as if it is wondering.' },
      { key: 'song-star-high', anchor: 'song-star-twinkle',
        action: 'The same star is way up high near the top of the sky, with tiny rolling green hills and a small quiet town far, far below it.' },
      { key: 'song-star-diamond', anchor: 'song-star-twinkle',
        action: 'The same star is sparkling brightly like a shiny cut diamond: extra bright shine lines and sparkles all around it.' },
    ],
  },

  clock: {
    subject: 'mouse and clock', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-clock-dock', anchor: null,
        action: `Draw ${MOUSE}. The little mouse stands on the floor beside the tall grandfather clock, smiling and waving one paw.` },
      { key: 'song-clock-up', anchor: 'song-clock-dock',
        action: 'The same little mouse is climbing UP the side of the tall grandfather clock, about halfway, looking up eagerly.' },
      { key: 'song-clock-one', anchor: 'song-clock-dock',
        action: 'The same mouse is up at the TOP of the tall grandfather clock; the round clock face clearly reads one o’clock (long hand pointing up to 12, short hand pointing to 1); a couple of little "ding" sound marks show it striking.' },
      { key: 'song-clock-down', anchor: 'song-clock-dock',
        action: 'The same little mouse is scurrying back DOWN the side of the tall grandfather clock toward the floor, looking down.' },
    ],
  },

  lamb: {
    subject: 'lamb', bg: 'on a soft light-green grassy meadow with a pale blue sky',
    poses: [
      { key: 'song-lamb-lamb', anchor: null,
        action: `Draw ${LAMB}. Standing happily on the grass, smiling.` },
      { key: 'song-lamb-fleece', anchor: 'song-lamb-lamb',
        action: 'The same lamb shows off its extra-fluffy snow-white woolly fleece, with a few little white snowflake sparkles around it.' },
      { key: 'song-lamb-follow', anchor: 'song-lamb-lamb',
        action: 'The same lamb is trotting along happily as if following someone, one front hoof lifted mid-step.' },
      { key: 'song-lamb-go', anchor: 'song-lamb-lamb',
        action: 'The same lamb skips eagerly forward with a big happy smile, glancing back over its shoulder, ready to go.' },
    ],
  },

  bingo: {
    subject: 'puppy dog', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-bingo-dog', anchor: null,
        action: `Draw ${DOG}. Sitting happily, singing with a cheerful open smile.` },
      { key: 'song-bingo-bark', anchor: 'song-bingo-dog',
        action: 'The same puppy tips its head up singing out happily, mouth open, a few little music notes around it.' },
      { key: 'song-bingo-clap', anchor: 'song-bingo-dog',
        action: 'The same puppy is up on its hind legs clapping its two front paws together, delighted.' },
      { key: 'song-bingo-wag', anchor: 'song-bingo-dog',
        action: 'The same puppy bounces happily with its tail wagging, one paw raised in a little wave.' },
    ],
  },

  abc: {
    subject: 'owl', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-abc-sing', anchor: null,
        action: `Draw ${OWL}. Singing sweetly, wings relaxed.` },
      { key: 'song-abc-wings', anchor: 'song-abc-sing',
        action: 'The same owl lifts both little wings up joyfully as it sings.' },
      { key: 'song-abc-clap', anchor: 'song-abc-sing',
        action: 'The same owl claps its two wing-tips together happily.' },
      { key: 'song-abc-proud', anchor: 'song-abc-sing',
        action: 'The same owl looks proud and pleased, one wing raised in a cheerful flourish.' },
    ],
  },

  count: {
    subject: 'child', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-count-shoe', anchor: CHILD_ANCHOR,
        action: 'The child is bending down to buckle up their shoe, smiling.' },
      { key: 'song-count-door', anchor: CHILD_ANCHOR,
        action: 'The child is knocking on a wooden door with one hand.' },
      { key: 'song-count-sticks', anchor: CHILD_ANCHOR,
        action: 'The child is bending to pick up a few small sticks from the ground.' },
      { key: 'song-count-hen', anchor: CHILD_ANCHOR,
        action: 'The child is happily holding a big plump friendly hen (a chubby cartoon chicken) in their arms.' },
    ],
  },

  hokey: {
    subject: 'child', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-hokey-in', anchor: CHILD_ANCHOR,
        action: 'The child stretches their right arm and hand straight out in FRONT of them, smiling.' },
      { key: 'song-hokey-out', anchor: CHILD_ANCHOR,
        action: 'The child pulls their right arm back and OUT to the side, away from the body.' },
      { key: 'song-hokey-shake', anchor: CHILD_ANCHOR,
        action: 'The child shakes their right hand with wiggly motion lines, giggling.' },
      { key: 'song-hokey-turn', anchor: CHILD_ANCHOR,
        action: 'The child is turning themselves around in a happy spin, both arms out, mid-twirl.' },
    ],
  },

  happy: {
    subject: 'child', bg: 'on a plain solid off-white background',
    poses: [
      { key: 'song-happy-clap', anchor: CHILD_ANCHOR,
        action: 'The child claps both hands together with a big happy smile.' },
      { key: 'song-happy-stomp', anchor: CHILD_ANCHOR,
        action: 'The child stomps one foot, lifting the knee, grinning.' },
      { key: 'song-happy-hooray', anchor: CHILD_ANCHOR,
        action: 'The child throws both arms up in the air cheering hooray, beaming.' },
    ],
  },

  sleep: {
    subject: 'bear', bg: 'on a soft night-time bedroom background in gentle blues',
    poses: [
      { key: 'song-sleep-sleep', anchor: null,
        action: `Draw ${BEAR}. Curled up peacefully asleep, eyes closed, a calm smile.` },
      { key: 'song-sleep-wake', anchor: 'song-sleep-sleep',
        action: 'The same bear is waking up, sitting up and stretching with a little yawn, rubbing one eye.' },
      { key: 'song-sleep-bells', anchor: 'song-sleep-sleep',
        action: 'The same bear cheerfully rings a shiny golden hand bell, awake and smiling.' },
      { key: 'song-sleep-ding', anchor: 'song-sleep-sleep',
        action: 'The same bear stands happily beside a big golden morning bell that is ringing, a few little ring marks around it.' },
    ],
  },

  hush: {
    subject: 'baby', bg: 'on a soft dark-blue night nursery background with a few tiny stars',
    poses: [
      { key: 'song-hush-baby', anchor: null,
        action: `Draw ${BABY}. Snuggled and calm, being gently soothed to sleep.` },
      { key: 'song-hush-bird', anchor: 'song-hush-baby',
        action: 'The same sleepy baby scene, with a little brown mockingbird softly singing on a branch beside the baby.' },
      { key: 'song-hush-ring', anchor: 'song-hush-baby',
        action: 'The same sleepy baby scene, with a sparkly little diamond ring glinting gently nearby.' },
    ],
  },

  river: {
    subject: 'horse and sleigh', bg: 'on a snowy winter background with pine trees',
    poses: [
      { key: 'song-river-ride', anchor: null,
        action: `Draw ${SLEIGH}. Gliding happily across a little snowy river bridge.` },
      { key: 'song-river-house', anchor: 'song-river-ride',
        action: 'The same horse and sleigh arriving at a cozy little grandmother’s house with warm glowing windows in the snow.' },
      { key: 'song-river-woods', anchor: 'song-river-ride',
        action: 'The same horse and sleigh travelling through a stand of tall snowy pine woods.' },
      { key: 'song-river-snow', anchor: 'song-river-ride',
        action: 'The same horse and sleigh gliding through gently falling snow, the child laughing with joy.' },
    ],
  },
}

for (const songKey of which) {
  const song = SONGS[songKey]
  if (!song) { console.log(`? unknown song "${songKey}" — known: ${Object.keys(SONGS).join(', ')}`); continue }
  console.log(`\n=== ${songKey} ===`)
  for (const { key, anchor, action } of song.poses) {
    if (only && !only.includes(key)) continue
    if (!force && existsSync(path.join(IMG, `${key}.webp`))) { console.log(`· ${key} exists (--force to redo)`); continue }
    const parts = []
    if (anchor) {
      const ref = anchorOf(anchor)
      if (!ref) { console.log(`✗ ${key} — anchor ${anchor} missing (generate it first); skipped`); continue }
      parts.push({ inlineData: ref })
    }
    const lead = anchor ? `Use the EXACT SAME ${song.subject} character in the reference image, same colours and style. ` : ''
    parts.push({ text: `${lead}${action} ${STYLE} ${song.bg}. Change only what is described; keep everything else identical.` })
    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts }],
        config: { responseModalities: ['IMAGE'] },
      })
      const d = extract(resp)
      if (!d) throw new Error('no image data')
      writeFileSync(path.join(IMG, `${key}.png`), Buffer.from(d, 'base64'))
      console.log(`✓ ${key}.png`)
    } catch (e) {
      console.log(`✗ ${key} — ${String(e.message || e).slice(0, 140)}`)
    }
    await sleep(Number(process.env.PACE_MS || 30000))
  }
}
console.log('\ndone')
