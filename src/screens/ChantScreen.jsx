import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { playItem, stopSpeaking, playChime } from '../lib/audio'
import ItemVisual from '../components/ItemVisual.jsx'
import { HomeIcon, PlayIcon, StopIcon, ReplayIcon } from '../components/Icons.jsx'
import './Chant.css'

const GAP_MS = 700 // gentle pause between words, AFTER each clip finishes

/* Sing-along: a rhythmic playthrough of a world's words, reusing the warm word
   clips + animal sounds with a strong visual beat. A song "moment" with no new
   audio needed. */
export default function ChantScreen() {
  const world = useStore((s) => s.currentWorld())
  const goHome = useStore((s) => s.goHome)
  const openWorld = useStore((s) => s.openWorld)
  const recordHeard = useStore((s) => s.recordHeard)
  const muted = useStore((s) => s.muted)
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const cardRef = useRef(null)
  // The sing-along loops forever; only count each word once per session so
  // repetition doesn't inflate mastery/the sticker book.
  const heardRef = useRef(new Set())

  const item = world?.items[i]

  useEffect(() => {
    if (!playing || !item) return
    let cancelled = false
    let t
    if (!heardRef.current.has(item.word)) {
      heardRef.current.add(item.word)
      recordHeard(item, world.id)
    }
    cardRef.current?.animate(
      [
        { transform: 'scale(0.9)' },
        { transform: 'scale(1.06)', offset: 0.35 },
        { transform: 'scale(1)' },
      ],
      { duration: 520, easing: 'cubic-bezier(0.34,1.56,0.64,1)' },
    )
    // Advance only once the clip (word + animal sound) has fully played.
    playItem(item).then(() => {
      if (!cancelled) t = setTimeout(() => setI((p) => (p + 1) % world.items.length), GAP_MS)
    })
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, playing])

  if (!world || !item) return null

  const toggle = () => {
    if (playing) stopSpeaking()
    else if (!muted) playChime('beat')
    setPlaying((p) => !p)
  }
  const restart = () => {
    stopSpeaking()
    heardRef.current = new Set()
    setI(0)
    setPlaying(true)
  }
  const exit = () => {
    stopSpeaking()
    openWorld(world.id)
  }

  const wordColor = isLight(item.color) ? '#2C3E50' : item.color

  return (
    <div
      className="scene chant"
      style={{ background: `linear-gradient(180deg, ${item.color}cc 0%, #b9e7f6 70%, #d9f3fb 100%)` }}
    >
      <header className="chant-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <span className="chant-title">♪ Sing along ♪</span>
        <button className="round-btn" onClick={restart} aria-label="Start over">
          <ReplayIcon size={24} />
        </button>
      </header>

      <div className="chant-notes" aria-hidden="true">
        <span>♪</span>
        <span>♫</span>
        <span>♪</span>
      </div>

      <main className="chant-main">
        <div className="chant-card" ref={cardRef}>
          <ItemVisual key={item.word} item={item} kind="stage" />
        </div>
        <h2 className="chant-word" style={{ color: wordColor }}>
          {item.word}
        </h2>
        {item.soundLabel && <p className="chant-sound">{item.soundLabel}!</p>}
      </main>

      <nav className="chant-bar">
        <button className="chunky chant-play" onClick={toggle}>
          {playing ? <StopIcon size={22} /> : <PlayIcon size={22} />}
          <span>{playing ? 'Pause' : 'Play'}</span>
        </button>
        <button className="chunky chant-exit" onClick={exit}>
          Done
        </button>
      </nav>
    </div>
  )
}

function isLight(hex) {
  if (!hex || hex[0] !== '#' || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.8
}
