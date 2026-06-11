import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { ABC_SONGS } from '../data/abcSongs'
import { playAbcSong, stopSpeaking } from '../lib/audio'
import { HomeIcon } from '../components/Icons.jsx'
import WordPic from '../components/WordPic.jsx'
import Mascot from '../components/Mascot.jsx'
import { isLetterMastered } from '../lib/mastery'
import './ABCSongScreen.css'

// Alphabet Friends — tap a letter to hear its warm phonics song (the sound + a word,
// not the letter name). The big card shows the current letter + its picture; the A–Z
// grid lets a toddler pick any letter. Sound-first; no scores, no emoji.
export default function ABCSongScreen() {
  const goHome = useStore((s) => s.goHome)
  const recordABC = useStore((s) => s.recordABCLetter)
  const abcSeen = useStore((s) => s.progress.abcSeen || {})

  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [auto, setAuto] = useState(false)
  const autoRef = useRef(false) // read after the await; kept in sync synchronously
  const cur = ABC_SONGS[idx]

  const play = async (i = idx) => {
    const song = ABC_SONGS[i]
    stopSpeaking()
    setIdx(i)
    setPlaying(true)
    recordABC(song.letter)
    await playAbcSong(song.letter)
    setPlaying(false)
    // Auto Play: when on, roll to the next letter; stop after Z.
    if (autoRef.current) {
      if (i + 1 < ABC_SONGS.length) {
        setTimeout(() => { if (autoRef.current) play(i + 1) }, 650)
      } else {
        autoRef.current = false
        setAuto(false)
      }
    }
  }
  const go = (d) => play((idx + d + ABC_SONGS.length) % ABC_SONGS.length)

  const toggleAuto = () => {
    const next = !auto
    autoRef.current = next
    setAuto(next)
    if (next) {
      if (!playing) play(idx) // kick off the A→Z roll from the current letter
    } else {
      stopSpeaking()
    }
  }

  // Stop the auto-roll if the screen unmounts (e.g. Home).
  useEffect(() => () => { autoRef.current = false; stopSpeaking() }, [])

  return (
    <div className="abc">
      <header className="abc-bar">
        <button className="round-btn" onClick={() => { stopSpeaking(); goHome() }} aria-label="Home">
          <HomeIcon size={22} />
        </button>
        <span className="abc-title">Alphabet Friends</span>
        <span className="abc-bar-spacer" aria-hidden="true" />
      </header>

      <section className="abc-stage">
        <div className="abc-greet">
          <div className="speech-bubble">{cur.sound}… {cur.word}!</div>
          <Mascot size={52} />
        </div>
        <div className={`abc-letter ${playing ? 'is-playing' : ''}`}>{cur.letter}</div>
        <div className="abc-pic">
          <WordPic key={cur.word} word={cur.word} variant="card" />
        </div>
        <div className="abc-word">{cur.letter} is for {cur.word}</div>
        <div className="abc-actions">
          <button className={`chunky abc-play ${playing ? 'is-playing' : ''}`} onClick={() => play()} disabled={playing && !auto}>
            {playing ? 'Singing…' : '▶ Hear the song'}
          </button>
          <button
            className={`chunky abc-auto ${auto ? 'is-on' : ''}`}
            onClick={toggleAuto}
            aria-pressed={auto}
          >
            {auto ? '⏸ Stop' : '▶▶ Auto Play'}
          </button>
        </div>
        <div className="abc-nav">
          <button className="round-btn" onClick={() => go(-1)} aria-label="Previous letter">‹</button>
          <span className="abc-count">{idx + 1} / {ABC_SONGS.length}</span>
          <button className="round-btn" onClick={() => go(1)} aria-label="Next letter">›</button>
        </div>
      </section>

      <main className="abc-grid" aria-label="Letters A to Z">
        {ABC_SONGS.map((s, i) => (
          <button
            key={s.letter}
            className={`abc-cell ${i === idx ? 'is-active' : ''} ${isLetterMastered({ abcSeen }, s.letter) ? 'is-mastered' : ''}`}
            onClick={() => play(i)}
            aria-label={`${s.letter}, is for ${s.word}`}
          >
            {s.letter}
          </button>
        ))}
      </main>
    </div>
  )
}
