import './SongAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

// Our-own-style key-pose frames (generated + anchor-conditioned → one consistent
// toddler). `ready` = idle. See docs/SONG_ANIMATIONS_SCOPE.md.
const POSES = ['ready', 'head', 'shoulders', 'knees', 'toes', 'eyes', 'ears', 'mouth', 'nose']

// Karaoke / closed-caption line per section.
const LINES = [
  'Head, shoulders, knees and toes, knees and toes',
  'Head, shoulders, knees and toes, knees and toes',
  'And eyes and ears and mouth and nose',
  'Head, shoulders, knees and toes, knees and toes',
]

// Sung sequence: [pose, lineIndex, isPhraseEnd]. Phrase-ends ("…toes", "…nose")
// are held longer + followed by a small gap — that's how the slow choir "drags".
const SEQ = [
  ['head', 0], ['shoulders', 0], ['knees', 0], ['toes', 0], ['knees', 0], ['toes', 0, true],
  ['head', 1], ['shoulders', 1], ['knees', 1], ['toes', 1], ['knees', 1], ['toes', 1, true],
  ['eyes', 2], ['ears', 2], ['mouth', 2], ['nose', 2, true],
  ['head', 3], ['shoulders', 3], ['knees', 3], ['toes', 3], ['knees', 3], ['toes', 3, true],
]

// Per-word timing (seconds). The four knobs, tuned by ear to the recording:
const INTRO = 0.4 // before the first "Head"
const WORD = 0.85 // base per sung word
const HOLD = 0.8 // extra on a phrase-final word (the drag)
const GAP = 0.45 // breath between lines

// Build the cue timeline once: each cue = { t (offset from INTRO), pose, line }.
const CUES = []
let CYCLE = 0
{
  let t = 0
  for (const [pose, line, end] of SEQ) {
    CUES.push({ t, pose, line })
    t += WORD + (end ? HOLD + GAP : 0)
  }
  CYCLE = t // duration of one full pass through the song
}

/*
 * Pose + karaoke caption driven by the ACTUAL audio position (`currentTime`), via
 * a per-word cue timeline (not a rigid beat) so held phrase-ends + line gaps match
 * the slow choir rendition. Loops each CYCLE. prefers-reduced-motion handled in CSS.
 */
export default function SongAnimation({ playing, currentTime = 0 }) {
  let pose = 'ready'
  let line = ''
  if (playing && currentTime > INTRO) {
    const rel = (currentTime - INTRO) % CYCLE
    let cue = CUES[0]
    for (const c of CUES) {
      if (c.t <= rel) cue = c
      else break
    }
    pose = cue.pose
    line = LINES[cue.line]
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
            className={`song-anim-pose ${pose === p ? 'is-on' : ''}`}
          />
        ))}
      </div>
      <div className="song-anim-caption">{line}</div>
    </div>
  )
}
