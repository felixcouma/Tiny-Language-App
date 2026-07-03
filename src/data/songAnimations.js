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
    poses: ['ready', 'teapot-handle', 'teapot-spout', 'teapot-tip'],
    lines: [
      "I'm a little teapot, short and stout",
      'Here is my handle, here is my spout',
      'When I get all steamed up, hear me shout',
      'Tip me over and pour me out!',
    ],
    // stout → handle, spout → (steamed) → tip. Sung slowly.
    seq: [
      ['ready', 0, true],
      ['teapot-handle', 1], ['teapot-spout', 1, true],
      ['ready', 2, true],
      ['teapot-tip', 3, true],
    ],
    timing: { intro: 0.5, word: 1.6, hold: 0.9, gap: 0.5 },
  }),
}
