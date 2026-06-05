import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { playItem, speak } from '../lib/audio'
import ItemVisual from '../components/ItemVisual.jsx'
import './LearningScreen.css'

export default function LearningScreen() {
  const world = useStore((s) => s.currentWorld())
  const item = useStore((s) => s.currentItem())
  const itemIndex = useStore((s) => s.itemIndex)
  const goHome = useStore((s) => s.goHome)
  const next = useStore((s) => s.next)
  const prev = useStore((s) => s.prev)
  const recordHeard = useStore((s) => s.recordHeard)

  if (!world || !item) return null

  return (
    <div className="learn">
      <header className="learn-header">
        <button className="icon-btn" onClick={goHome} aria-label="Back to home">
          ‹
        </button>
        <span className="learn-badge" style={{ background: world.grad }}>
          {world.name}
        </span>
        <span className="learn-count" aria-hidden="true">
          {itemIndex + 1}/{world.items.length}
        </span>
      </header>

      <main className="learn-main">
        <ItemVisual key={item.word} item={item} kind="stage" />

        <h2 className="learn-word">{item.word}</h2>
        {item.ipa ? <p className="learn-ipa">{item.ipa}</p> : null}

        <PlayButton item={item} worldId={world.id} onPlayed={() => recordHeard(item, world.id)} />

        <Ladder phrases={item.expand} />
      </main>

      <nav className="learn-nav">
        <button className="nav-btn" onClick={prev} aria-label="Previous">
          ‹ Prev
        </button>
        <button className="nav-btn nav-next" onClick={next} aria-label="Next">
          Next ›
        </button>
      </nav>
    </div>
  )
}

function PlayButton({ item, worldId, onPlayed }) {
  const [pressed, setPressed] = useState(false)

  // Speak the word shortly after it appears (we arrived via a tap, so audio is unlocked).
  useEffect(() => {
    const t = setTimeout(() => {
      playItem(item)
      onPlayed()
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.word])

  const handle = () => {
    setPressed(true)
    playItem(item)
    onPlayed()
    setTimeout(() => setPressed(false), 300)
  }

  return (
    <button
      className={`play-btn ${pressed ? 'is-pressed' : ''}`}
      onClick={handle}
      aria-label={`Hear ${item.word}`}
    >
      <span className="play-dot" aria-hidden="true" />
      <span className="play-label">{item.soundLabel || `Say "${item.word}"`}</span>
    </button>
  )
}

/* v4 Language Ladder: tap a phrase to hear it spoken (word → sentence). */
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
            style={{ animationDelay: `${i * 70}ms` }}
            onClick={() => speak(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </section>
  )
}
