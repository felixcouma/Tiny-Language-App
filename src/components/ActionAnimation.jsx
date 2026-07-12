import { useEffect, useState } from 'react'
import { ACTION_ANIMATIONS } from '../data/actionAnimations'
import './ActionAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

/*
 * A "Things I Do" verb, animated. Loops the action's key frames on a fixed interval
 * (no audio to sync to — a verb just needs to MOVE), cross-fading between them. Honours
 * prefers-reduced-motion by freezing on the first frame. Config: data/actionAnimations.js.
 */
export default function ActionAnimation({ soundKey }) {
  const cfg = ACTION_ANIMATIONS[soundKey]
  const [i, setI] = useState(0)

  useEffect(() => {
    setI(0)
    if (!cfg || cfg.frames.length < 2) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % cfg.frames.length), cfg.ms || 600)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundKey])

  if (!cfg) return null

  return (
    <div className="act-anim">
      {cfg.frames.map((f, idx) => (
        <img
          key={f}
          src={`${BASE}images/${f}.webp`}
          alt=""
          aria-hidden="true"
          className={`act-anim-frame ${i === idx ? 'is-on' : ''}`}
        />
      ))}
    </div>
  )
}
