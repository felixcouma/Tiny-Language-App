/*
 * Generate "Things I Do" action-animation key poses with the Vertex image model.
 * Unlike the songs, an action has NO soundtrack to sync against — the renderer just
 * loops a couple of key frames, so an action only needs 2–3 poses. Each frame is
 * anchor-conditioned on ONE consistent toddler so the child never changes between
 * frames:
 *   • BOY  = the existing Head/Shoulders / Sing-with-Pip child (song-ready.webp)
 *   • GIRL = a fresh base (act-girl-ready, anchor:null) so families with a daughter
 *            see themselves; later girl frames anchor on it.
 * A few naturally-social verbs (Hugging, Dancing…) show BOTH children together.
 *
 *   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/scripts/gcloud-sa-key.json"
 *   export VERTEX_PROJECT="gen-lang-client-0993546173"
 *   node scripts/gen-action-poses.mjs --action anchors        # draw the girl base first
 *   node scripts/gen-action-poses.mjs --action bike,bubbles,hug
 *   node scripts/gen-action-poses.mjs --action bubbles --only act-bubbles-float --force
 *
 * Adding an action = add an entry to ACTIONS here (base/anchor poses first), then a
 * config in src/data/actionAnimations.js keyed by the item's `sound` (e.g. do-jumping),
 * and — if it's a new verb — an item in src/data/content.js `doing[]`.
 */
import { GoogleGenAI } from '@google/genai'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.join(__dirname, '..', 'public', 'images')
const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const which = args.includes('--action') ? args[args.indexOf('--action') + 1].split(',') : ['anchors']
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

// Shared look — matches the song poses so actions and songs feel like one world.
const STYLE =
  'Thick dark outlines, flat-vector children’s-book illustration style, bright cheerful ' +
  'colours, the whole subject centered with a little headroom, no captions or written words.'
const BG = 'on a plain solid off-white background'

// The two children. The BOY is defined by his reference image (song-ready); the GIRL is
// drawn fresh once, then reused as an anchor. GIRL_DESC also lets the "both" scenes add
// her next to the anchored boy.
const GIRL_DESC =
  'a cute cartoon toddler GIRL: dark brown hair in two little pigtails tied with small ' +
  'bows, big happy eyes, rosy cheeks, wearing a cheerful coral-pink short-sleeve dress ' +
  'and little shoes'

// Base/anchor first in each list; later poses anchor on it.
const ACTIONS = {
  // Girl base — a fresh full-body toddler girl, forward-facing, to anchor every girl frame.
  anchors: {
    subject: 'child', poses: [
      { key: 'act-girl-ready', anchor: null,
        action: `Draw ${GIRL_DESC}. Standing happily facing forward, both arms relaxed at her sides, a big warm smile.` },
    ],
  },

  // BOY solo — riding a bike (two pedal positions loop into a pedalling motion).
  bike: {
    subject: 'child', poses: [
      { key: 'act-bike-down', anchor: 'song-ready',
        action: 'The same child is riding a small colourful two-wheel bicycle with training wheels, seen from the side, leaning forward happily; the near pedal is pushed DOWN at the bottom with that foot low; a few little motion lines behind the wheels.' },
      { key: 'act-bike-up', anchor: 'act-bike-down',
        action: 'The exact same child on the exact same bicycle in the same position, but the legs have PEDALLED round: the near leg is now bent right UP with the knee high and the near foot lifted to the TOP of the pedal circle, while the far leg is pushed straight DOWN — clearly a different point in the pedalling motion. Still leaning forward and smiling, motion lines behind.' },
      // NOTE: a 4-frame full-circle loop (added mid-circle fwd/back poses) looked glitchy —
      // independently generated frames don't register pixel-for-pixel, so fast cutting made
      // the whole child jitter. Kept to the calm 2-frame up/down pedal instead.
    ],
  },

  // GIRL solo — blowing bubbles.
  bubbles: {
    subject: 'child', poses: [
      { key: 'act-bubbles-blow', anchor: 'act-girl-ready',
        action: 'The same girl holds a small bubble wand up near her mouth and blows through it, cheeks puffed, a few small round soap bubbles just starting to form at the wand.' },
      { key: 'act-bubbles-float', anchor: 'act-girl-ready',
        action: 'The same girl lowers the bubble wand and looks up delighted as several shiny round rainbow soap bubbles float up into the air all around her.' },
    ],
  },

  // BOTH children together — a warm hug (models a boy-and-girl family).
  hug: {
    subject: 'two children', poses: [
      { key: 'act-hug-open', anchor: 'song-ready',
        action: `The same teal-shirt boy stands facing ${GIRL_DESC}; the two children face each other with both arms open wide, about to hug, big happy smiles.` },
      { key: 'act-hug-squeeze', anchor: 'act-hug-open',
        action: 'The exact same two children are now wrapped in a big warm hug, arms around each other, cheeks together and eyes happy, with a couple of little heart marks floating nearby.' },
    ],
  },

  // ---------- GIRL solo ----------
  wash: {
    subject: 'child', poses: [
      { key: 'act-wash-1', anchor: 'act-girl-ready',
        action: 'The same girl stands at a small sink and rubs her two soapy hands together, lots of white foamy bubbles on her hands, water running from the tap.' },
      { key: 'act-wash-2', anchor: 'act-wash-1',
        action: 'The exact same girl at the same sink now holds her hands apart under the running tap, rinsing them, a few water droplets and a little remaining foam, happy.' },
    ],
  },
  drink: {
    subject: 'child', poses: [
      { key: 'act-drink-1', anchor: 'act-girl-ready',
        action: 'The same girl holds a colourful cup up to her lips with both hands, about to drink.' },
      { key: 'act-drink-2', anchor: 'act-drink-1',
        action: 'The exact same girl tilts the same cup up to drink, head tipped back a little, eyes happy and cheeks full.' },
    ],
  },
  walk: {
    subject: 'child', poses: [
      { key: 'act-walk-1', anchor: 'act-girl-ready',
        action: 'The same girl is walking, seen from the side, mid-step with her near leg forward and far leg back, arms gently swinging, a couple of little motion lines.' },
      { key: 'act-walk-2', anchor: 'act-walk-1',
        action: 'The exact same girl mid-step the other way: near leg now back and far leg forward, arms swung the opposite way — a clear next step of walking.' },
    ],
  },
  jump: {
    subject: 'child', poses: [
      { key: 'act-jump-1', anchor: 'act-girl-ready',
        action: 'The same girl crouches down low with knees bent and arms back, getting ready to jump up, a big excited smile.' },
      { key: 'act-jump-2', anchor: 'act-jump-1',
        action: 'The exact same girl is now up in the air mid-jump: both feet off the ground and tucked up, both arms thrown up high, joyful, with little motion lines below her.' },
    ],
  },
  brush: {
    subject: 'child', poses: [
      { key: 'act-brush-1', anchor: 'act-girl-ready',
        action: 'The same girl holds a toothbrush to the LEFT side of her open smiling mouth, brushing, a little toothpaste foam and a sparkle.' },
      { key: 'act-brush-2', anchor: 'act-brush-1',
        action: 'The exact same girl now moves the same toothbrush to the RIGHT side of her mouth, still brushing, a bit more foam and a sparkle.' },
    ],
  },
  kick: {
    subject: 'child', poses: [
      { key: 'act-kick-1', anchor: 'act-girl-ready',
        action: 'The same girl stands beside a colourful ball on the ground, her near leg swung BACK in a wind-up ready to kick, arms out for balance.' },
      { key: 'act-kick-2', anchor: 'act-kick-1',
        action: 'The exact same girl swings her near leg FORWARD and kicks the ball, the ball now flying off to the side with a few motion lines, her happy and mid-follow-through.' },
    ],
  },
  wave: {
    subject: 'child', poses: [
      { key: 'act-wave-1', anchor: 'act-girl-ready',
        action: 'The same girl raises one hand up and waves it over to the LEFT, palm open, a big happy smile.' },
      { key: 'act-wave-2', anchor: 'act-wave-1',
        action: 'The exact same girl waves the same raised hand over to the RIGHT, a small motion arc showing the wave.' },
    ],
  },

  // ---------- BOY solo ----------
  eat: {
    subject: 'child', poses: [
      { key: 'act-eat-1', anchor: 'song-ready',
        action: 'The same boy holds a spoon up near his open mouth with a little food on it, about to take a bite, happy.' },
      { key: 'act-eat-2', anchor: 'act-eat-1',
        action: 'The exact same boy now has the spoon in his mouth taking the bite, cheeks full and eyes happy, yum.' },
    ],
  },
  sleep: {
    subject: 'child', poses: [
      { key: 'act-sleep-1', anchor: 'song-ready',
        action: 'The same boy is lying down curled up asleep under a soft blanket, eyes closed, a calm peaceful smile, head on a little pillow.' },
      { key: 'act-sleep-2', anchor: 'act-sleep-1',
        action: 'The exact same sleeping boy under the same blanket, now with a few little "z z z" sleep marks floating above him and the blanket risen a touch as if breathing deeply.' },
    ],
  },
  run: {
    subject: 'child', poses: [
      { key: 'act-run-1', anchor: 'song-ready',
        action: 'The same boy is running, seen from the side, mid-stride with one knee lifted high and arms pumping, a couple of motion lines behind him.' },
      { key: 'act-run-2', anchor: 'act-run-1',
        action: 'The exact same boy mid-stride the other way: the opposite knee now lifted and arms swapped, leaning forward, more motion lines — clearly running fast.' },
    ],
  },
  clap: {
    subject: 'child', poses: [
      { key: 'act-clap-1', anchor: 'song-ready',
        action: 'The same boy holds both hands apart out to the sides, ready to clap, a big happy smile.' },
      { key: 'act-clap-2', anchor: 'act-clap-1',
        action: 'The exact same boy brings both hands together in a clap in front of him, a little sparkle burst between his palms.' },
    ],
  },
  climb: {
    subject: 'child', poses: [
      { key: 'act-climb-1', anchor: 'song-ready',
        action: 'The same boy is climbing a short flight of stairs, seen from the side, one foot up on the first step and a hand on a railing, looking up.' },
      { key: 'act-climb-2', anchor: 'act-climb-1',
        action: 'The exact same boy on the same stairs now one step HIGHER, lifting the other foot up to the next step, still climbing up happily.' },
    ],
  },
  read: {
    subject: 'child', poses: [
      { key: 'act-read-1', anchor: 'song-ready',
        action: 'The same boy sits holding an open picture book in both hands, looking down at the pages, smiling.' },
      { key: 'act-read-2', anchor: 'act-read-1',
        action: 'The exact same boy with the same open book now points at a picture on the page with one finger, delighted, as if turning a page.' },
    ],
  },
  swim: {
    subject: 'child', poses: [
      { key: 'act-swim-1', anchor: 'song-ready',
        action: 'The same boy is swimming in a little pool of blue water up to his chest, one arm reaching forward in a swimming stroke, splashes around him, happy.' },
      { key: 'act-swim-2', anchor: 'act-swim-1',
        action: 'The exact same boy in the same blue water now with the other arm reaching forward in the swimming stroke, a few more splashes — clearly mid-swim.' },
    ],
  },

  // ---------- BOTH children together (social verbs) ----------
  dance: {
    subject: 'two children', poses: [
      { key: 'act-dance-1', anchor: 'song-ready',
        action: `The same teal-shirt boy dances next to ${GIRL_DESC}; both children have their arms up to one side, hips leaning, big happy smiles, a couple of little music notes nearby.` },
      { key: 'act-dance-2', anchor: 'act-dance-1',
        action: 'The exact same two children dancing, now with their arms swung up to the OTHER side and leaning the other way, a twirl feel, more little music notes.' },
    ],
  },
  laugh: {
    subject: 'two children', poses: [
      { key: 'act-laugh-1', anchor: 'song-ready',
        action: `The same teal-shirt boy and ${GIRL_DESC} stand together giggling, hands near their tummies, smiling wide.` },
      { key: 'act-laugh-2', anchor: 'act-laugh-1',
        action: 'The exact same two children now laughing harder, heads tipped back with big open happy laughs, a few little "ha ha" marks and laughter lines around them.' },
    ],
  },
  play: {
    subject: 'two children', poses: [
      { key: 'act-play-1', anchor: 'song-ready',
        action: `The same teal-shirt boy and ${GIRL_DESC} kneel on the floor together building with colourful toy blocks, a small stack of blocks between them, happy and focused.` },
      { key: 'act-play-2', anchor: 'act-play-1',
        action: 'The exact same two children with the same blocks, the stack now TALLER, one child placing another block on top and both grinning proudly, a couple of loose toys nearby.' },
    ],
  },

  // ---------- Round 2: 5 more useful verbs ----------
  // GIRL solo — crying (the emotion counterpart to Laughing).
  cry: {
    subject: 'child', poses: [
      { key: 'act-cry-1', anchor: 'act-girl-ready',
        action: 'The same girl has a sad crying face: mouth turned down, eyebrows up, big shiny tears welling in her eyes and a couple of tear drops on her cheeks.' },
      { key: 'act-cry-2', anchor: 'act-cry-1',
        action: 'The exact same sad girl now rubs one eye with her little fist, still crying, a few more tear drops falling — clearly mid-cry.' },
    ],
  },
  // GIRL solo — painting (fine-motor / creative).
  paint: {
    subject: 'child', poses: [
      { key: 'act-paint-1', anchor: 'act-girl-ready',
        action: 'The same girl stands at a little easel holding a paintbrush to the paper, making a colourful brush stroke, a small paint palette in her other hand, happy.' },
      { key: 'act-paint-2', anchor: 'act-paint-1',
        action: 'The exact same girl at the same easel lifts the brush with a dab of bright paint, having added another colourful mark to the picture, delighted.' },
    ],
  },
  // BOY solo — throwing a ball (gross-motor pair to Kicking).
  throw: {
    subject: 'child', poses: [
      { key: 'act-throw-1', anchor: 'song-ready',
        action: 'The same boy stands holding a colourful ball, his throwing arm cocked BACK behind his head, ready to throw, leaning back a little.' },
      { key: 'act-throw-2', anchor: 'act-throw-1',
        action: 'The exact same boy swings his arm FORWARD and lets go — the ball now flying off ahead of him with a few motion lines, mid-follow-through, happy.' },
    ],
  },
  // BOY solo — cooking (pretend-play routine).
  cook: {
    subject: 'child', poses: [
      { key: 'act-cook-1', anchor: 'song-ready',
        action: 'The same boy stands at a little toy stove stirring a pot with a big spoon, a curl of steam rising, wearing a small apron, happy and focused.' },
      { key: 'act-cook-2', anchor: 'act-cook-1',
        action: 'The exact same boy at the same pot now lifts the spoon up near his mouth to taste, a little more steam, cheeks happy — yum.' },
    ],
  },
  // BOTH children — peekaboo (classic toddler social game).
  peekaboo: {
    subject: 'two children', poses: [
      { key: 'act-peek-1', anchor: 'song-ready',
        action: `The same teal-shirt boy and ${GIRL_DESC} stand side by side, each covering their own face with both hands, hiding, as if playing peekaboo.` },
      { key: 'act-peek-2', anchor: 'act-peek-1',
        action: 'The exact same two children now pull their hands away from their faces, revealing big surprised delighted grins, hands out to the sides — "peekaboo!"' },
    ],
  },
}

for (const actKey of which) {
  const act = ACTIONS[actKey]
  if (!act) { console.log(`? unknown action "${actKey}" — known: ${Object.keys(ACTIONS).join(', ')}`); continue }
  console.log(`\n=== ${actKey} ===`)
  for (const { key, anchor, action } of act.poses) {
    if (only && !only.includes(key)) continue
    if (!force && existsSync(path.join(IMG, `${key}.webp`))) { console.log(`· ${key} exists (--force to redo)`); continue }
    const parts = []
    if (anchor) {
      const ref = anchorOf(anchor)
      if (!ref) { console.log(`✗ ${key} — anchor ${anchor} missing (generate it first); skipped`); continue }
      parts.push({ inlineData: ref })
    }
    const lead = anchor ? `Use the EXACT SAME child character in the reference image, same face, hair, clothes, colours and style. ` : ''
    parts.push({ text: `${lead}${action} ${STYLE} ${BG}. Change only what is described; keep everything else identical.` })
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
    await sleep(Number(process.env.PACE_MS || 20000))
  }
}
console.log('\ndone')
