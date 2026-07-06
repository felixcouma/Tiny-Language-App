import { SONG_ANIMATIONS } from '../data/songAnimations'
import './SongAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

/*
 * Config-driven song animation. For an `animated` song, plays our-own-style
 * key-pose frames (generated + anchor-conditioned → one consistent toddler) that
 * act out the lyrics, plus a karaoke caption — all driven by the ACTUAL audio
 * position (`currentTime`) via a per-word cue timeline, so it can't drift from the
 * tune. Per-song data lives in src/data/songAnimations.js. Reduced-motion in CSS.
 */
export default function SongAnimation({ song, playing, currentTime = 0 }) {
  const cfg = SONG_ANIMATIONS[song]
  if (!cfg) return null

  let pose = cfg.poses[0]
  let line = ''
  if (playing && currentTime > cfg.timing.intro) {
    const rel = (currentTime - cfg.timing.intro) % cfg.cycle
    let cue = cfg.cues[0]
    for (const c of cfg.cues) {
      if (c.t <= rel) cue = c
      else break
    }
    pose = cue.pose
    line = cfg.lines[cue.line]
  }

  return (
    <div className="song-anim">
      <div className="song-anim-stage">
        {cfg.poses.map((p) => (
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
