// Per-song animation configs (the rollout format — see docs/LEFT_TO_DO.md §6).
// Each song lists:
//   poses   image keys → public/images/song-<key>.webp ('ready' is shared)
//   lines   karaoke / closed-caption line per section
//   seq     the sung sequence: [poseKey, lineIndex, phraseEnd?] — phrase-ends are
//           held longer + followed by a gap (models a slow choir "drag")
//   timing  seconds: intro (before first word), word (base step), hold (extra on
//           a phrase-end), gap (breath between lines) — tuned by ear per recording
// Adding a song = generate its poses (gen-song-poses.mjs) + add a config here +
// set `animated: true` in src/data/songs.js.

const build = (cfg) => {
  const cues = []
  let t = 0
  for (const [pose, line, end] of cfg.seq) {
    cues.push({ t, pose, line })
    t += cfg.timing.word + (end ? cfg.timing.hold + cfg.timing.gap : 0)
  }
  return { ...cfg, cues, cycle: t }
}

// "Bingo" is a clap game: each verse replaces one more LEADING letter with a single
// clap (round 1 = B-I-N-G-O all sung, round 2 = clap-I-N-G-O, … round 6 = 5 claps).
// The caption is the closed-caption: sung letters show as letters, a clapped slot
// shows the word "clap"; the puppy hits the clap pose on exactly those beats. Every
// letter/clap is its own beat (timing.word) so the hardest-to-sync song stays on the
// tune — tune `word`/`hold`/`gap` by ear; drop trailing verses if the record is shorter.
const bingoAnim = () => {
  const LETTERS = ['B', 'I', 'N', 'G', 'O']
  const lines = []
  const seq = []
  const line = (text) => (lines.push(text), lines.length - 1)
  for (let claps = 0; claps <= 5; claps++) {
    const intro = line('There was a farmer had a dog')
    const nameo = line('And Bingo was his name-o')
    const spell = line(LETTERS.map((l, i) => (i < claps ? 'clap' : l)).join(' – '))
    seq.push(['bingo-dog', intro, true])
    seq.push(['bingo-bark', nameo, true])
    for (let rep = 0; rep < 3; rep++)
      for (let i = 0; i < 5; i++)
        seq.push([i < claps ? 'bingo-clap' : 'bingo-bark', spell, i === 4])
    seq.push(['bingo-wag', nameo, true])
  }
  return { poses: ['bingo-dog', 'bingo-bark', 'bingo-clap', 'bingo-wag'], lines, seq,
    timing: { intro: 0.4, word: 0.52, hold: 0.5, gap: 0.32 } }
}

export const SONG_ANIMATIONS = {
  'head-shoulders-knees-and-toes': build({
    poses: ['ready', 'head', 'shoulders', 'knees', 'toes', 'eyes', 'ears', 'mouth', 'nose'],
    lines: [
      'Head, shoulders, knees and toes, knees and toes',
      'Head, shoulders, knees and toes, knees and toes',
      'And eyes and ears and mouth and nose',
      'Head, shoulders, knees and toes, knees and toes',
    ],
    seq: [
      ['head', 0], ['shoulders', 0], ['knees', 0], ['toes', 0], ['knees', 0], ['toes', 0, true],
      ['head', 1], ['shoulders', 1], ['knees', 1], ['toes', 1], ['knees', 1], ['toes', 1, true],
      ['eyes', 2], ['ears', 2], ['mouth', 2], ['nose', 2, true],
      ['head', 3], ['shoulders', 3], ['knees', 3], ['toes', 3], ['knees', 3], ['toes', 3, true],
    ],
    timing: { intro: 0.4, word: 0.85, hold: 0.8, gap: 0.45 },
  }),

  'im-a-little-teapot': build({
    // A cute cartoon teapot character (NOT a child role-playing) — toddlers know the
    // teapot IS the singer. 'teapot-body' is the idle/base pose (poses[0]).
    poses: ['teapot-body', 'teapot-handle', 'teapot-spout', 'teapot-steam', 'teapot-tip'],
    lines: [
      "I'm a little teapot, short and stout",
      'Here is my handle, here is my spout',
      'When I get all steamed up, hear me shout',
      'Tip me over and pour me out!',
    ],
    // body → handle → spout → (steam) → tip-and-pour. Sung slowly.
    seq: [
      ['teapot-body', 0, true],
      ['teapot-handle', 1], ['teapot-spout', 1, true],
      ['teapot-steam', 2, true],
      ['teapot-tip', 3, true],
    ],
    timing: { intro: 0.5, word: 1.6, hold: 0.9, gap: 0.5 },
  }),

  // NOTE: timings below are sensible first-pass defaults — the poses/captions are the
  // reviewable part; the per-word sync still wants an ear-pass against each recording.
  'twinkle-twinkle-little-star': build({
    // A cute star character: twinkle → wonder → up high → diamond.
    poses: ['star-twinkle', 'star-wonder', 'star-high', 'star-diamond'],
    lines: [
      'Twinkle, twinkle, little star',
      'How I wonder what you are',
      'Up above the world so high',
      'Like a diamond in the sky',
      'Twinkle, twinkle, little star',
      'How I wonder what you are',
    ],
    seq: [
      ['star-twinkle', 0, true],
      ['star-wonder', 1, true],
      ['star-high', 2, true],
      ['star-diamond', 3, true],
      ['star-twinkle', 4, true],
      ['star-wonder', 5, true],
    ],
    timing: { intro: 0.5, word: 1.4, hold: 0.7, gap: 0.4 },
  }),

  'hickory-dickory-dock': build({
    // A mouse + grandfather clock: dock → up → strikes one → down.
    poses: ['clock-dock', 'clock-up', 'clock-one', 'clock-down'],
    lines: [
      'Hickory dickory dock',
      'The mouse ran up the clock',
      'The clock struck one',
      'The mouse ran down',
      'Hickory dickory dock',
    ],
    seq: [
      ['clock-dock', 0, true],
      ['clock-up', 1, true],
      ['clock-one', 2, true],
      ['clock-down', 3, true],
      ['clock-dock', 4, true],
    ],
    timing: { intro: 0.4, word: 1.0, hold: 0.6, gap: 0.4 },
  }),

  'mary-had-a-little-lamb': build({
    // A fluffy lamb: lamb → fleece (snow) → follow → go.
    poses: ['lamb-lamb', 'lamb-fleece', 'lamb-follow', 'lamb-go'],
    lines: [
      'Mary had a little lamb',
      'Its fleece was white as snow',
      'And everywhere that Mary went',
      'The lamb was sure to go',
    ],
    seq: [
      ['lamb-lamb', 0, true],
      ['lamb-fleece', 1, true],
      ['lamb-follow', 2, true],
      ['lamb-go', 3, true],
    ],
    timing: { intro: 0.5, word: 1.3, hold: 0.7, gap: 0.4 },
  }),

  bingo: build(bingoAnim()),

  'the-alphabet-song': build({
    // Singing owl; the LETTERS live in the caption (image models garble drawn text).
    poses: ['abc-sing', 'abc-wings', 'abc-clap', 'abc-proud'],
    lines: [
      'A B C D E F G',
      'H I J K L M N O P',
      'Q R S, T U V',
      'W X, Y and Z',
      'Now I know my ABCs',
      "Next time won't you sing with me?",
    ],
    seq: [
      ['abc-sing', 0, true],
      ['abc-wings', 1, true],
      ['abc-clap', 2, true],
      ['abc-wings', 3, true],
      ['abc-proud', 4, true],
      ['abc-sing', 5, true],
    ],
    timing: { intro: 0.4, word: 1.2, hold: 0.6, gap: 0.35 },
  }),

  'one-two-buckle-my-shoe': build({
    // Reuses the Head/Shoulders child acting out the counting rhyme.
    poses: ['count-shoe', 'count-door', 'count-sticks', 'count-hen'],
    lines: [
      'One, two, buckle my shoe',
      'Three, four, knock at the door',
      'Five, six, pick up sticks',
      'Seven, eight, lay them straight',
      'Nine, ten, a big fat hen',
    ],
    seq: [
      ['count-shoe', 0, true],
      ['count-door', 1, true],
      ['count-sticks', 2, true],
      ['count-sticks', 3, true],
      ['count-hen', 4, true],
    ],
    timing: { intro: 0.4, word: 1.2, hold: 0.6, gap: 0.4 },
  }),

  'hokey-pokey': build({
    // Reuses the child: hand in → out → shake → turn around.
    poses: ['hokey-in', 'hokey-out', 'hokey-shake', 'hokey-turn'],
    lines: [
      'You put your right hand in',
      'You put your right hand out',
      'You put your right hand in, and you shake it all about',
      'You do the hokey pokey and you turn yourself around',
      "That's what it's all about!",
    ],
    seq: [
      ['hokey-in', 0, true],
      ['hokey-out', 1, true],
      ['hokey-shake', 2, true],
      ['hokey-turn', 3, true],
      ['hokey-turn', 4, true],
    ],
    timing: { intro: 0.4, word: 1.15, hold: 0.6, gap: 0.4 },
  }),

  // NOTE: "The Happy Song" lyrics are a best-guess "If You're Happy and You Know It" —
  // confirm against the recording; captions are trivial to fix without re-generating art.
  'the-happy-song': build({
    poses: ['happy-clap', 'happy-stomp', 'happy-hooray'],
    lines: [
      "If you're happy and you know it, clap your hands",
      "If you're happy and you know it, stomp your feet",
      "If you're happy and you know it, shout hooray!",
    ],
    seq: [
      ['happy-clap', 0, true],
      ['happy-stomp', 1, true],
      ['happy-hooray', 2, true],
    ],
    timing: { intro: 0.4, word: 1.2, hold: 0.6, gap: 0.4 },
  }),

  'are-you-sleeping': build({
    // A sleepy bear: sleep → wake → ring the morning bells → ding dang dong.
    poses: ['sleep-sleep', 'sleep-wake', 'sleep-bells', 'sleep-ding'],
    lines: [
      'Are you sleeping? Are you sleeping?',
      'Brother John, Brother John',
      'Morning bells are ringing, morning bells are ringing',
      'Ding, dang, dong. Ding, dang, dong.',
    ],
    seq: [
      ['sleep-sleep', 0, true],
      ['sleep-wake', 1, true],
      ['sleep-bells', 2, true],
      ['sleep-ding', 3, true],
    ],
    timing: { intro: 0.5, word: 1.3, hold: 0.7, gap: 0.45 },
  }),

  'hush-little-baby': build({
    // Gentle lullaby: baby → mockingbird → diamond ring. Slow tempo.
    poses: ['hush-baby', 'hush-bird', 'hush-ring'],
    lines: [
      'Hush, little baby, don’t say a word',
      'Papa’s gonna buy you a mockingbird',
      'And if that mockingbird won’t sing',
      'Papa’s gonna buy you a diamond ring',
    ],
    seq: [
      ['hush-baby', 0, true],
      ['hush-bird', 1, true],
      ['hush-bird', 2, true],
      ['hush-ring', 3, true],
    ],
    timing: { intro: 0.6, word: 1.6, hold: 0.9, gap: 0.5 },
  }),

  'over-the-river-and-through-the-woods': build({
    // Horse & sleigh: over the river → to grandma's → through the woods → the snow.
    poses: ['river-ride', 'river-house', 'river-woods', 'river-snow'],
    lines: [
      'Over the river and through the woods',
      "To grandmother's house we go",
      'The horse knows the way to carry the sleigh',
      'Through the white and drifted snow',
    ],
    seq: [
      ['river-ride', 0, true],
      ['river-house', 1, true],
      ['river-woods', 2, true],
      ['river-snow', 3, true],
    ],
    timing: { intro: 0.5, word: 1.3, hold: 0.7, gap: 0.4 },
  }),
}
