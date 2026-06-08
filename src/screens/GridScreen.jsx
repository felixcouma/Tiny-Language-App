import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { voice, voiceSeq, stopSpeaking } from '../lib/audio'
import { WORDS, CATEGORIES, wordsInCategory, imageKeyFor } from '../data/phraseContent'
import { HomeIcon, ReplayIcon } from '../components/Icons.jsx'
import './GridScreen.css'

const BASE = import.meta.env.BASE_URL || '/'

// Word Board — a therapist-style AAC vocabulary board. A clean white lattice of
// picture+word cells; tap a cell to hear the word and add it to the message strip,
// then tap the strip to speak the whole message. CLEAR empties it. A category
// filter swaps the vocabulary set; "new words" reshuffles. Pulls the full bank.
const BOARD = 20 // cells shown at once (lattice fills more on wider screens)
const MAX_MSG = 8

const sample = (arr, n) => {
  const pool = [...arr]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

export default function GridScreen() {
  const child = useStore((s) => s.activeProfile())
  const goHome = useStore((s) => s.goHome)
  const recordWord = useStore((s) => s.recordPracticeWord)
  const recordPhrase = useStore((s) => s.recordPhrase)

  const [cat, setCat] = useState('All')
  const pool = useMemo(() => (cat === 'All' ? WORDS : wordsInCategory(cat)), [cat])
  const [board, setBoard] = useState(() => sample(WORDS, BOARD))
  const [hi, setHi] = useState(null)
  const [message, setMessage] = useState([])

  const rebuild = (nextCat) => {
    stopSpeaking()
    const c = nextCat ?? cat
    setBoard(sample(c === 'All' ? WORDS : wordsInCategory(c), BOARD))
    setHi(null)
  }
  const pickCat = (c) => {
    setCat(c)
    rebuild(c)
  }
  const tap = (w) => {
    stopSpeaking()
    voice(w.word)
    recordWord(w.word)
    setHi(w.word)
    setTimeout(() => setHi((cur) => (cur === w.word ? null : cur)), 600)
    setMessage((m) => (m.length >= MAX_MSG ? m : [...m, w.word]))
  }
  const sayMessage = () => {
    if (!message.length) return
    stopSpeaking()
    voiceSeq(message)
    if (message.length > 1) recordPhrase(message.join(' '))
  }
  const clear = () => {
    stopSpeaking()
    setMessage([])
  }

  return (
    <div className="wb">
      <header className="wb-bar">
        <button className="wb-bar-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={22} />
        </button>
        <span className="wb-bar-title">Vocab{child ? ` · ${child.name}` : ''}</span>
        <button className="wb-bar-btn" onClick={() => rebuild()} aria-label="New words">
          <ReplayIcon size={20} />
        </button>
      </header>

      <div className="wb-strip">
        <button
          className="wb-strip-msg"
          onClick={sayMessage}
          aria-label={message.length ? `Say ${message.join(' ')}` : 'Message bar'}
        >
          {message.length ? (
            message.map((m, i) => (
              <span key={i} className="wb-chip">
                {m}
              </span>
            ))
          ) : (
            <span className="wb-strip-empty">Tap words to build a message…</span>
          )}
        </button>
        <button className="wb-clear" onClick={clear} disabled={!message.length}>
          CLEAR
        </button>
      </div>

      <div className="wb-cats" role="tablist" aria-label="Word groups">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            className={`wb-cat ${c === cat ? 'is-active' : ''}`}
            onClick={() => pickCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <main className="wb-board">
        {board.map((w, idx) => {
          const img = imageKeyFor(w.word)
          return (
            <button
              key={`${w.word}-${idx}`}
              className={`wb-cell ${hi === w.word ? 'is-hi' : ''}`}
              onClick={() => tap(w)}
              aria-label={`Add ${w.word}`}
            >
              {img ? (
                <img
                  className="wb-cell-img"
                  src={`${BASE}images/${img}.webp`}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="wb-cell-spacer" aria-hidden="true" />
              )}
              <span className="wb-cell-word">{w.word}</span>
            </button>
          )
        })}
      </main>
    </div>
  )
}
