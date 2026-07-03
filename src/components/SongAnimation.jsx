import './SongAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

// Our-own-style key-pose frames (generated + anchor-conditioned → one consistent
// toddler). `ready` = idle. See docs/SONG_ANIMATIONS_SCOPE.md.
const POSES = ['ready', 'head', 'shoulders', 'knees', 'toes', 'eyes', 'ears', 'mouth', 'nose']

// One pose per sung word, in the song's order:
//   Head, shoulders, knees and toes, knees and toes   (×2)
//   And eyes and ears and mouth and nose
//   Head, shoulders, knees and toes, knees and toes
const V = ['head', 'shoulders', 'knees', 'toes', 'knees', 'toes']
const FACE = ['eyes', 'ears', 'mouth', 'nose']
const PATTERN = [...V, ...V, ...FACE, ...V] // 22 beats

// Karaoke / closed-caption line for each section (beat index → line).
const LINES = [
  'Head, shoulders, knees and toes, knees and toes',
  'Head, shoulders, knees and toes, knees and toes',
  'And eyes and ears and mouth and nose',
  'Head, shoulders, knees and toes, knees and toes',
]
const lineFor = (i) => (i < 6 ? 0 : i < 12 ? 1 : i < 16 ? 2 : 3)

// Tuned to the recording (a slow, choir-style rendition that drags a little).
// INTRO = seconds before the first "Head"; BEAT = seconds per sung word. These
// two numbers are the whole sync knob — adjust by ear.
const INTRO = 0.4
const BEAT = 0.95

/*
 * Pose + karaoke caption driven by the ACTUAL audio position (`currentTime`), so
 * it can't drift from the tune. The caption shows the sung line (closed caption)
 * while the character acts out each word; both come off the same beat grid.
 * prefers-reduced-motion handled in CSS.
 */
export default function SongAnimation({ playing, currentTime = 0 }) {
  const active = playing && currentTime > INTRO
  const idx = active ? Math.floor((currentTime - INTRO) / BEAT) % PATTERN.length : -1
  const pose = idx >= 0 ? PATTERN[idx] : 'ready'
  const line = idx >= 0 ? LINES[lineFor(idx)] : ''

  return (
    <div className="song-anim">
      <div className="song-anim-stage">
        {POSES.map((p) => (
          <img
            key={p}
            src={`${BASE}images/song-${p}.webp`}
            alt=""
            aria-hidden="true"
            className={`song-anim-pose ${pose === p ? 'is-on' : ''}`}
          />
        ))}
      </div>
      <div className="song-anim-caption">{line}</div>
    </div>
  )
}
