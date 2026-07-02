import { useEffect, useRef, useState } from 'react'
import './SongAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

// "Head, Shoulders, Knees and Toes" benchmark: our-own-style key-pose frames
// (generated via the app's Vertex image pipeline → consistent with all other art).
// The character cycles through the four actions while the real song plays; the
// on-screen word names the part in sync with the pose (self-consistent — the label
// matches the pose regardless of the recording's exact timing). See
// docs/SONG_ANIMATIONS_SCOPE.md. Exact lyric-lock timing is the follow-up (P1).
const POSES = ['ready', 'head', 'shoulders', 'knees', 'toes']
const CYCLE = [
  { pose: 'head', label: 'Head!' },
  { pose: 'shoulders', label: 'Shoulders!' },
  { pose: 'knees', label: 'Knees!' },
  { pose: 'toes', label: 'Toes!' },
]
const STEP_MS = 650

export default function SongAnimation({ playing }) {
  const [idx, setIdx] = useState(-1) // -1 → the "ready" pose (paused/idle)
  const timer = useRef(null)

  useEffect(() => {
    clearInterval(timer.current)
    if (!playing) {
      setIdx(-1)
      return
    }
    setIdx(0)
    timer.current = setInterval(() => setIdx((i) => (i + 1) % CYCLE.length), STEP_MS)
    return () => clearInterval(timer.current)
  }, [playing])

  const cur = idx < 0 ? { pose: 'ready', label: '' } : CYCLE[idx]

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
      <div className="song-anim-label" key={cur.label || 'ready'}>
        {cur.label}
      </div>
    </div>
  )
}
