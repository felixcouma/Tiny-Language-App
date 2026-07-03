import './SongAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

// Our-own-style key-pose frames (generated + anchor-conditioned → one consistent
// toddler). `ready` = idle. See docs/SONG_ANIMATIONS_SCOPE.md.
const POSES = ['ready', 'head', 'shoulders', 'knees', 'toes', 'eyes', 'ears', 'mouth', 'nose']

// "Head, Shoulders, Knees and Toes" — one entry per sung word, in order:
//   Head, shoulders, knees and toes, knees and toes  (×2)
//   And eyes and ears and mouth and nose
//   Head, shoulders, knees and toes, knees and toes
const V = [
  ['head', 'Head!'], ['shoulders', 'Shoulders!'], ['knees', 'Knees!'], ['toes', 'Toes!'],
  ['knees', 'Knees!'], ['toes', 'Toes!'],
]
const FACE = [['eyes', 'Eyes!'], ['ears', 'Ears!'], ['mouth', 'Mouth!'], ['nose', 'Nose!']]
const PATTERN = [...V, ...V, ...FACE, ...V]

// Tuned to the recording (public/sounds/songs/head-shoulders-knees-and-toes.mp3).
// INTRO = seconds before the first "Head"; BEAT = seconds per sung word. These two
// numbers are the whole sync knob — adjust by ear if it drifts.
const INTRO = 0.4
const BEAT = 0.58

/*
 * Pose animation driven by the ACTUAL audio position (`currentTime` from the
 * <audio> element), so it can't drift from the tune — it always maps the current
 * playback second to the right sung word. Self-consistent: the on-screen word
 * matches the on-screen pose. prefers-reduced-motion handled in CSS.
 */
export default function SongAnimation({ playing, currentTime = 0 }) {
  let cur = { pose: 'ready', label: '' }
  if (playing && currentTime > INTRO) {
    const [pose, label] = PATTERN[Math.floor((currentTime - INTRO) / BEAT) % PATTERN.length]
    cur = { pose, label }
  }
  return (
    <div className="song-anim">
      <div className="song-anim-stage">
        {POSES.map((p) => (
          <img
            key={p}
            src={`${BASE}images/song-${p}.webp`}
            alt=""
            aria-hidden="true"
            className={`song-anim-pose ${cur.pose === p ? 'is-on' : ''}`}
          />
        ))}
      </div>
      <div className="song-anim-label" key={`${cur.label}-${Math.floor((currentTime - INTRO) / BEAT)}`}>
        {cur.label}
      </div>
    </div>
  )
}
