import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { playSound } from '../lib/audio'
import './LearningScreen.css'

export default function LearningScreen() {
  const world = useStore((s) => s.currentWorld())
  const item = useStore((s) => s.currentItem())
  const itemIndex = useStore((s) => s.itemIndex)
  const goHome = useStore((s) => s.goHome)
  const next = useStore((s) => s.next)
  const prev = useStore((s) => s.prev)

  if (!world || !item) return null

  return (
    <div className="learn" style={{ '--accent': item.color || world.gradient }}>
      <header className="learn-header">
        <button className="icon-btn" onClick={goHome} aria-label="Back to home">
          ◄
        </button>
        <span className="learn-badge" style={{ background: world.gradient }}>
          {world.emoji} {world.name}
        </span>
        <span className="learn-count" aria-hidden="true">
          {itemIndex + 1}/{world.items.length}
        </span>
      </header>

      <main className="learn-main">
        <Stage item={item} key={item.word} />

        <h2 className="learn-word">{item.word}</h2>
        {item.ipa ? <p className="learn-ipa">{item.ipa}</p> : null}
        {item.script ? <p className="learn-script">{item.script}</p> : null}

        <PlayButton item={item} />

        <Ladder phrases={item.expand} />
      </main>

      <nav className="learn-nav">
        <button className="nav-btn" onClick={prev} aria-label="Previous">
          ◄ <span className="nav-label">Prev</span>
        </button>
        <button className="nav-btn nav-next" onClick={next} aria-label="Next">
          <span className="nav-label">Next</span> ►
        </button>
      </nav>
    </div>
  )
}

/* The big visual. Four variants: real photo / emoji, colour swatch, number count. */
function Stage({ item }) {
  const [imgOk, setImgOk] = useState(Boolean(item.image))

  // Number variant: big numeral + a row of countable objects
  if (item.numeral != null) {
    return (
      <div className="stage" aria-label={`Number ${item.numeral}`}>
        <div className="stage-numeral">{item.numeral}</div>
        <div className="stage-count">
          {Array.from({ length: item.count }).map((_, i) => (
            <span key={i} aria-hidden="true">
              {item.countEmoji}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Colour variant: large swatch with the example object on top
  if (item.swatch) {
    return (
      <div
        className="stage stage-color"
        style={{ background: item.swatch, borderColor: item.swatch }}
        aria-label={`${item.word} colour`}
      >
        <span className="stage-emoji" aria-hidden="true">
          {item.emoji}
        </span>
      </div>
    )
  }

  // Default: real photo if present & loads, otherwise the friendly emoji
  return (
    <div className="stage" aria-label={item.word}>
      {item.image && imgOk ? (
        <img
          className="stage-photo"
          src={item.image}
          alt={item.word}
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="stage-emoji" aria-hidden="true">
          {item.emoji}
        </span>
      )}
    </div>
  )
}

function PlayButton({ item }) {
  const [pulse, setPulse] = useState(false)
  const firstPlay = useRef(true)

  // Auto-play the sound when the item appears (blueprint timeline: ~0.3s after
  // the image). We arrived here via a tap, so audio is already unlocked.
  useEffect(() => {
    const t = setTimeout(() => {
      playSound(item.sound)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.sound])

  const handle = () => {
    firstPlay.current = false
    setPulse(true)
    playSound(item.sound)
    setTimeout(() => setPulse(false), 300)
  }

  return (
    <button
      className={`play-btn ${pulse ? 'is-pressed' : ''}`}
      onClick={handle}
      aria-label={`Play the sound for ${item.word}`}
    >
      <span className="play-icon" aria-hidden="true">
        🔊
      </span>
      <span className="play-label">{item.soundLabel}</span>
    </button>
  )
}

/* v4 Language Ladder: tappable 2-word and 3-word "say it together" phrases. */
function Ladder({ phrases }) {
  if (!phrases || !phrases.length) return null
  return (
    <section className="ladder" aria-label="Say it together">
      <h3 className="ladder-title">Say it together</h3>
      <div className="ladder-chips">
        {phrases.map((p, i) => (
          <button
            key={p}
            className="ladder-chip"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => playSound('')}
          >
            {p}
          </button>
        ))}
      </div>
    </section>
  )
}
