import { useEffect, useState } from 'react'
import { ACTION_ANIMATIONS } from '../data/actionAnimations'
import './ActionAnimation.css'

const BASE = import.meta.env.BASE_URL || '/'

/*
 * A "Things I Do" verb, animated. Loops the action's key frames on a fixed interval
 * (no audio to sync to — a verb just needs to MOVE). A verb's motion IS the content — it
 * demonstrates the word — so under prefers-reduced-motion we don't FREEZE it (that made it
 * look broken on phones/tablets that have Reduce Motion on); we just play it slower and
 * gentler. Config: data/actionAnimations.js.
 *
 * `paused` freezes the loop on the calm base frame (frame 0) — used when Auto Play reaches
 * the end of a world so the last verb settles to rest instead of moving forever.
 */
export default function ActionAnimation({ soundKey, paused = false }) {
  const cfg = ACTION_ANIMATIONS[soundKey]
  const [i, setI] = useState(0)

  useEffect(() => {
    setI(0)
    if (paused || !cfg || cfg.frames.length < 2) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Reduced motion → keep the (informative) loop, but calm it to a gentle >=1s cadence.
    const ms = reduce ? Math.max(cfg.ms || 600, 1000) : cfg.ms || 600
    const id = setInterval(() => setI((n) => (n + 1) % cfg.frames.length), ms)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundKey, paused])

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
