import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { SONGS, songById } from '../data/songs'
import Mascot from '../components/Mascot.jsx'
import SongAnimation from '../components/SongAnimation.jsx'
import { HomeIcon } from '../components/Icons.jsx'
import './SongScreen.css'

const BASE = import.meta.env.BASE_URL || '/'

function PlayPause({ playing }) {
  return playing ? (
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  )
}
const SkipBack = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M18 5.5v13l-9-6.5z" />
    <rect x="6" y="5.5" width="2.6" height="13" rx="1.1" />
  </svg>
)
const SkipFwd = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M6 5.5v13l9-6.5z" />
    <rect x="15.4" y="5.5" width="2.6" height="13" rx="1.1" />
  </svg>
)
const Shuffle = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const shuffled = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/*
 * "Sing with Pip" — a gentle songs shelf with a proper little player. Only the songs a
 * grown-up enabled for the active child show. The now-playing panel is a transport bar:
 * shuffle · previous · play/pause · next — and it AUTO-ADVANCES through the queue so you
 * don't tap each song. Plays through the (optionally shuffled) list and stops at the end
 * (no endless loop). One song at a time; leaving the screen stops it. No scores — just joy.
 */
export default function SongScreen() {
  const goHome = useStore((s) => s.goHome)
  const enabled = useStore((s) => s.activeProfile()?.enabledSongs || [])
  const list = useMemo(() => SONGS.filter((s) => enabled.includes(s.id)), [enabled])
  const ids = useMemo(() => list.map((s) => s.id), [list])

  const [currentId, setCurrentId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0) // seconds — drives SongAnimation sync
  const [shuffle, setShuffle] = useState(false)
  const [order, setOrder] = useState(ids) // play queue (shuffled when shuffle is on)
  const audioRef = useRef(null)

  // Rebuild the queue when the enabled list changes or shuffle is toggled. Playback
  // isn't touched here — the current song keeps playing; only "what's next" changes.
  useEffect(() => {
    setOrder(shuffle ? shuffled(ids) : ids)
  }, [ids, shuffle])

  // Load + play a specific song fresh. Stable (only touches refs/setters).
  const start = useCallback((id) => {
    const a = audioRef.current
    if (!a || !id) return
    a.src = `${BASE}sounds/songs/${id}.mp3`
    setCurrentId(id)
    setProgress(0)
    setCurrentTime(0)
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [])

  // Create the audio element once; track progress/time.
  useEffect(() => {
    const a = new Audio()
    a.preload = 'none'
    audioRef.current = a
    const onTime = () => {
      setProgress(a.duration ? a.currentTime / a.duration : 0)
      setCurrentTime(a.currentTime)
    }
    a.addEventListener('timeupdate', onTime)
    return () => {
      a.pause()
      a.removeAttribute('src')
      a.removeEventListener('timeupdate', onTime)
    }
  }, [])

  // Auto-advance: when a song ends, play the next in the queue; at the end, stop (don't
  // loop forever). Re-bound when the queue or current song changes so it always advances
  // to the right next track.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onEnd = () => {
      const i = order.indexOf(currentId)
      if (i !== -1 && i + 1 < order.length) start(order[i + 1])
      else {
        setPlaying(false)
        setProgress(0)
        setCurrentTime(0)
      }
    }
    a.addEventListener('ended', onEnd)
    return () => a.removeEventListener('ended', onEnd)
  }, [order, currentId, start])

  // Tap a song (or the same one again) → play / pause toggle.
  const toggle = (id) => {
    const a = audioRef.current
    if (!a) return
    if (currentId === id) {
      if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      else {
        a.pause()
        setPlaying(false)
      }
    } else start(id)
  }

  // Prev / Next skip within the queue (manual skips wrap around).
  const skip = (delta) => {
    if (!order.length) return
    const i = order.indexOf(currentId)
    const ni = i === -1 ? (delta > 0 ? 0 : order.length - 1) : (i + delta + order.length) % order.length
    start(order[ni])
  }

  // Big transport button: resume/pause the current song, or start the queue if none yet.
  const onMainPlay = () => (currentId ? toggle(currentId) : start(order[0]))

  const current = currentId ? songById(currentId) : null
  const purple = 'linear-gradient(135deg, #8e44ad 0%, #e84393 100%)'

  return (
    <div className="scene songs">
      <header className="songs-header">
        <button className="round-btn" onClick={goHome} aria-label="Back to home">
          <HomeIcon size={26} />
        </button>
        <span className="songs-badge">Sing with Pip</span>
        <span style={{ minWidth: 54 }} />
      </header>

      {list.length === 0 ? (
        <div className="songs-empty">
          <Mascot size={84} />
          <p className="songs-empty-text">
            No songs yet. A grown-up can switch songs on in the parent area
            (••• &rarr; Songs).
          </p>
        </div>
      ) : (
        <>
          <div
            className={`now-playing ${playing ? 'is-playing' : ''} ${current?.animated ? 'is-animated' : ''}`}
            style={{ background: current ? current.grad : purple }}
          >
            {current?.animated ? (
              <SongAnimation song={current.id} playing={playing} currentTime={currentTime} />
            ) : (
              <Mascot size={64} />
            )}
            <div className="np-meta">
              <div className="np-title">{current ? current.title : 'Press play to sing along!'}</div>
              <div className="np-tag">{current ? current.tag : `${list.length} song${list.length > 1 ? 's' : ''} ready`}</div>
            </div>

            <div className="np-transport">
              <button
                className={`np-ctrl ${shuffle ? 'is-on' : ''}`}
                onClick={() => setShuffle((v) => !v)}
                aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
                aria-pressed={shuffle}
              >
                <Shuffle />
              </button>
              <button className="np-ctrl" onClick={() => skip(-1)} aria-label="Previous song">
                <SkipBack />
              </button>
              <button
                className="np-play"
                onClick={onMainPlay}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                <PlayPause playing={playing} />
              </button>
              <button className="np-ctrl" onClick={() => skip(1)} aria-label="Next song">
                <SkipFwd />
              </button>
            </div>

            <div className="np-progress" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>

          <div className="songs-grid">
            {list.map((s) => {
              const active = s.id === currentId
              return (
                <button
                  key={s.id}
                  className={`song-card ${active ? 'is-active' : ''}`}
                  style={{ background: s.grad }}
                  onClick={() => toggle(s.id)}
                  aria-label={`${active && playing ? 'Pause' : 'Play'} ${s.title}`}
                >
                  <span className="song-ico">
                    <PlayPause playing={active && playing} />
                  </span>
                  <span className="song-title">{s.title}</span>
                  <span className="song-tag">{s.tag}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
