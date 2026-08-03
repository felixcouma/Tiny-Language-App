/*
 * Which items have a real recorded sound at public/sounds/fx/<key>.mp3 (the file
 * already bakes a coherent 3–4x repeat). Shared by audio.js (playback), the game
 * screens (prompt wording), and the clip scripts — plain data, no browser deps.
 *
 * Snake/butterfly/turtle/fish have NO fx file (no clean CC sound / reads poorly on
 * phone speakers) → they keep a short spoken cue in the prompt instead.
 */
export const FX_KEYS = new Set([
  'dog', 'cat', 'cow', 'sheep', 'bird', 'frog', 'monkey', 'lion', 'bear', 'duck',
  'zebra', 'horse', 'pig', 'chicken', 'rooster', 'elephant', 'bee',
  'owl', 'wolf', 'goose', 'crow',
])

export const hasFx = (key) => FX_KEYS.has(key)
