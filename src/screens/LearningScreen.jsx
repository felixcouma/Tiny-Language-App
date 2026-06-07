import { useEffect } from 'react'
import { useStore } from '../store'
import { playItem, stopSpeaking } from '../lib/audio'
import ItemVisual from '../components/ItemVisual.jsx'
import Ladder from '../components/Ladder.jsx'
import Mascot from '../components/Mascot.jsx'
import {
  HomeIcon,
  ReplayIcon,
  SpeakerIcon,
  SpeakerMuteIcon,
  PlayIcon,
  StopIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '../components/Icons.jsx'
import './LearningScreen.css'

export default function LearningScreen() {
  const world = useStore((s) => s.currentWorld())
  const item = useStore((s) => s.currentItem())
  const itemIndex = useStore((s) => s.itemIndex)
  const goHome = useStore((s) => s.goHome)
  const next = useStore((s) => s.next)
  const prev = useStore((s) => s.prev)
  const recordHeard = useStore((s) => s.recordHeard)
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)
  const autoPlay = useStore((s) => s.autoPlay)
  const toggleAutoPlay = useStore((s) => s.toggleAutoPlay)
  const stage = useStore((s) => s.stage())

  // Speak each word as it appears.
  useEffect(() => {
    if (!item) return
    const t = setTimeout(() => {
      playItem(item)
      recordHeard(item, world.id)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item && item.word])

  // Auto-play: gently advance through the world.
  useEffect(() => {
    if (!autoPlay || !item) return
    const t = setTimeout(() => next(), 3600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, item && item.word])

  if (!world || !item) return null

  const wordColor = isLight(item.color) ? '#2C3E50' : item.color

  const sayNow = () => {
    playItem(item)
    recordHeard(item, world.id)
  }

  const onAutoPlay = () => {
    if (!autoPlay) sayNow() // start speaking immediately
    else stopSpeaking()
    toggleAutoPlay()
  }

  return (
    <div className="scene learn2">
      <div className="scene-globe" />

      <header className="l2-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <div className="l2-spacer" />
        <button className="round-btn" onClick={sayNow} aria-label="Say it again">
          <ReplayIcon size={24} />
        </button>
        <button
          className={`round-btn ${muted ? 'is-off' : ''}`}
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <SpeakerMuteIcon size={24} /> : <SpeakerIcon size={24} />}
        </button>
      </header>

      <div className="l2-mascot">
        <div className="speech-bubble">{world.name.replace(/^My /, '')}</div>
        <Mascot size={76} />
      </div>

      <main className="l2-main">
        <button className="tv-card l2-card" onClick={sayNow} aria-label={`Hear ${item.word}`}>
          <div className="l2-stage-wrap">
            <ItemVisual key={item.word} item={item} kind="stage" />
            <span className="card-speaker" aria-hidden="true">
              <SpeakerIcon size={22} />
            </span>
          </div>
          <h2 className="l2-word" style={{ color: wordColor }}>
            {item.word}
          </h2>
        </button>

        {world.id === 'music-forest' && item.soundLabel && (
          <button className="music-badge" style={{ background: item.color }} onClick={sayNow}>
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {item.soundLabel}
          </button>
        )}

        <Ladder phrases={item.expand} stage={stage} />
      </main>

      <nav className="l2-playbar">
        <button className="chunky arrow" onClick={prev} aria-label="Previous">
          <ArrowLeftIcon size={26} />
        </button>
        <button className="chunky l2-auto" onClick={onAutoPlay} aria-label="Auto play">
          {autoPlay ? <StopIcon size={22} /> : <PlayIcon size={22} />}
          <span>Auto Play</span>
        </button>
        <button className="chunky arrow" onClick={next} aria-label="Next">
          <ArrowRightIcon size={26} />
        </button>
      </nav>
    </div>
  )
}

// Returns true for very light colours (so the word label stays readable).
function isLight(hex) {
  if (!hex || hex[0] !== '#' || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.8
}
