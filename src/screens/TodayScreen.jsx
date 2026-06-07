import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { playItem, playCelebration, stopSpeaking, voice } from '../lib/audio'
import { buildTodaySession } from '../lib/today'
import TactileStage from '../components/TactileStage.jsx'
import Ladder from '../components/Ladder.jsx'
import Mascot from '../components/Mascot.jsx'
import { HomeIcon, ArrowRightIcon } from '../components/Icons.jsx'
import './Today.css'

export default function TodayScreen() {
  const goHome = useStore((s) => s.goHome)
  const openGame = useStore((s) => s.openGame)
  const stage = useStore((s) => s.stage())
  const child = useStore((s) => s.activeProfile())
  const recordHeard = useStore((s) => s.recordHeard)

  const build = () => buildTodaySession(useStore.getState().progress, useStore.getState().stage())
  const [queue, setQueue] = useState(build)
  const [idx, setIdx] = useState(0)
  const item = queue[idx]
  const done = idx >= queue.length

  // Speak each card as it appears.
  useEffect(() => {
    if (!item) return
    const t = setTimeout(() => {
      playItem(item)
      recordHeard(item, item.worldId)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Celebrate at the end.
  useEffect(() => {
    if (!done) return
    playCelebration()
    const t = setTimeout(() => voice(`Great learning, ${child?.name || 'friend'}!`), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const sayNow = () => {
    if (item) {
      playItem(item)
      recordHeard(item, item.worldId)
    }
  }
  const advance = () => {
    stopSpeaking()
    setIdx((i) => i + 1)
  }
  const again = () => {
    stopSpeaking()
    setQueue(build())
    setIdx(0)
  }

  if (done) {
    return (
      <div className="scene today">
        <div className="today-done">
          <Mascot size={96} />
          <h2 className="today-done-title">Great learning{child ? `, ${child.name}` : ''}!</h2>
          <p className="today-done-sub">You practised {queue.length} words with Pip.</p>
          <div className="today-done-actions">
            <button className="chunky today-cta" onClick={again}>
              Again
            </button>
            <button className="chunky today-cta today-game" onClick={openGame}>
              Play a game
            </button>
            <button className="chunky today-cta today-home" onClick={goHome}>
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null
  const wordColor = isLight(item.color) ? '#2C3E50' : item.color

  return (
    <div className="scene today">
      <header className="today-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <div className="today-progress" aria-label={`${idx + 1} of ${queue.length}`}>
          {queue.map((_, i) => (
            <span key={i} className={`today-pip ${i < idx ? 'on' : ''} ${i === idx ? 'now' : ''}`} />
          ))}
        </div>
        <Mascot size={48} />
      </header>

      <div className="today-bubble-row">
        <div className="speech-bubble">Today with Pip</div>
      </div>

      <main className="today-main">
        <div className="tv-card today-card">
          <TactileStage item={item} onTap={sayNow} />
          <button className="l2-word-btn" onClick={sayNow} aria-label={`Hear ${item.word}`}>
            <h2 className="l2-word" style={{ color: wordColor }}>
              {item.word}
            </h2>
          </button>
        </div>
        <Ladder phrases={item.expand} stage={stage} />
      </main>

      <nav className="today-playbar">
        <button className="chunky today-next" onClick={advance} aria-label="Next">
          <span>{idx + 1 === queue.length ? 'Finish' : 'Next'}</span>
          <ArrowRightIcon size={24} />
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
