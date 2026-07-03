import { useEffect, useMemo, useRef, useState } from 'react'
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

/*
 * "Sing with Pip" — a gentle songs shelf. Only the songs a grown-up enabled for
 * the active child show here. Tap a song to play its real recording; the now-
 * playing panel shows Pip + a big play/pause + a progress bar. One song at a
 * time; leaving the screen stops it. No scores — just listening and joy.
 */
export default function SongScreen() {
  const goHome = useStore((s) => s.goHome)
  const enabled = useStore((s) => s.activeProfile()?.enabledSongs || [])
  const list = useMemo(() => SONGS.filter((s) => enabled.includes(s.id)), [enabled])

  const [currentId, setCurrentId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0) // seconds — drives SongAnimation sync
  const audioRef = useRef(null)

  useEffect(() => {
    const a = new Audio()
    a.preload = 'none'
    audioRef.current = a
    const onTime = () => {
      setProgress(a.duration ? a.currentTime / a.duration : 0)
      setCurrentTime(a.currentTime)
    }
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnd)
    return () => {
      a.pause()
      a.removeAttribute('src')
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnd)
    }
  }, [])

  const play = (id) => {
    const a = audioRef.current
    if (!a) return
    if (currentId === id) {
      // same song → toggle
      if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      else {
        a.pause()
        setPlaying(false)
      }
      return
    }
    a.src = `${BASE}sounds/songs/${id}.mp3`
    setCurrentId(id)
    setProgress(0)
    setCurrentTime(0)
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  const current = currentId ? songById(currentId) : null

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
            style={{ background: current ? current.grad : undefined }}
          >
            {current?.animated ? (
              <SongAnimation song={current.id} playing={playing} currentTime={currentTime} />
            ) : (
              <Mascot size={64} />
            )}
            <div className="np-meta">
              <div className="np-title">{current ? current.title : 'Pick a song to sing!'}</div>
              {current && <div className="np-tag">{current.tag}</div>}
            </div>
            {current && (
              <button
                className="np-play"
                onClick={() => play(current.id)}
                aria-label={playing ? `Pause ${current.title}` : `Play ${current.title}`}
              >
                <PlayPause playing={playing} />
              </button>
            )}
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
                  onClick={() => play(s.id)}
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
