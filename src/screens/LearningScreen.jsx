import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { playItem, stopSpeaking, voice } from '../lib/audio'
import TactileStage from '../components/TactileStage.jsx'
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
  const openChant = useStore((s) => s.openChant)
  const stage = useStore((s) => s.stage())
  // Optional therapy "expectant pause": wait a few seconds before auto-speaking so
  // the child gets a communicative opportunity to name the picture first (per child).
  const expectantPause = useStore((s) => s.activeProfile()?.expectantPause || false)
  // Tracks which word's audio has finished, so Auto Play waits for the full clip
  // (word + animal sound) before advancing instead of cutting it off.
  const [playedWord, setPlayedWord] = useState(null)
  // Whether this word has been spoken yet (via the pause timer OR a manual tap) —
  // so a tap during the expectant pause doesn't get doubled by the pending timer.
  const spokeRef = useRef(false)

  // Speak each word as it appears; mark it played once its audio finishes.
  useEffect(() => {
    if (!item) return
    spokeRef.current = false
    let cancelled = false
    // Auto Play stays snappy; the expectant pause applies to hands-on play only.
    const delay = expectantPause && !autoPlay ? 4000 : 350
    const t = setTimeout(async () => {
      if (cancelled || spokeRef.current) return
      spokeRef.current = true
      recordHeard(item, world.id)
      await playItem(item)
      if (!cancelled) setPlayedWord(item.word)
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item && item.word])

  // Auto-play: advance only AFTER the current word's audio has finished, plus a
  // short gentle gap — so the sound is never cut short.
  useEffect(() => {
    if (!autoPlay || !item || playedWord !== item.word) return
    const t = setTimeout(() => next(), 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, playedWord, item && item.word])

  if (!world || !item) return null

  const wordColor = isLight(item.color) ? '#2C3E50' : item.color

  const sayNow = () => {
    spokeRef.current = true // a tap satisfies the expectant pause (no doubled speak)
    playItem(item)
    recordHeard(item, world.id)
    setPlayedWord(item.word)
  }

  const onAutoPlay = () => {
    // No immediate replay — the word is already spoken when it appears, and
    // auto-advance waits for the clip to finish, so toggling never cuts audio.
    if (autoPlay) stopSpeaking()
    toggleAutoPlay()
  }

  return (
    <div className="scene learn2">
      <div className="scene-globe" />

      <header className="l2-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <button className="round-btn l2-sing" onClick={openChant} aria-label="Sing along">
          ♪
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
        <div className="tv-card l2-card">
          <TactileStage item={item} onTap={sayNow} />
          <button className="l2-word-btn" onClick={sayNow} aria-label={`Hear ${item.word}`}>
            <h2 className="l2-word" style={{ color: wordColor }}>
              {item.word}
            </h2>
          </button>
        </div>

        <button
          className="l2-letter"
          onClick={() => voice(item.word[0])}
          aria-label={`Starts with ${item.word[0]}`}
        >
          starts with <b>{item.word[0].toUpperCase()}</b>
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
