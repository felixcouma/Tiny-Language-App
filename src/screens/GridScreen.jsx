import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { voice, voiceSeq, stopSpeaking, slugify } from '../lib/audio'
import { WORDS, CATEGORIES, wordsInCategory, imageKeyFor } from '../data/phraseContent'
import { HomeIcon } from '../components/Icons.jsx'
import './GridScreen.css'

const BASE = import.meta.env.BASE_URL || '/'

// Word Board — a therapist-style AAC communication board. It starts BLANK; tapping
// an empty cell reveals a random word from the chosen category (or any, on "All"),
// speaks it, and adds it to the message strip. Tapping a filled cell repeats it.
// CLEAR empties the message AND blanks the whole board. Picture symbols come from our
// real WebP art (content images, or generated symbol icons named by slug).
const BOARD = 20
const MAX_MSG = 8

const pickRandom = (pool, taken) => {
  const avail = pool.filter((w) => !taken.has(w.word))
  if (!avail.length) return null
  return avail[Math.floor(Math.random() * avail.length)]
}

// Image candidate for a word: a content illustration if mapped, else a symbol named
// by slug (e.g. images/go.webp). Missing files just fail to load and we hide the img.
const imageSrc = (word) => `${BASE}images/${imageKeyFor(word) || slugify(word)}.webp`

export default function GridScreen() {
  const child = useStore((s) => s.activeProfile())
  const goHome = useStore((s) => s.goHome)
  const recordWord = useStore((s) => s.recordPracticeWord)
  const recordPhrase = useStore((s) => s.recordPhrase)

  const [cat, setCat] = useState('All')
  const pool = useMemo(() => (cat === 'All' ? WORDS : wordsInCategory(cat)), [cat])
  const [board, setBoard] = useState(() => Array(BOARD).fill(null)) // null = blank
  const [hi, setHi] = useState(null)
  const [message, setMessage] = useState([])

  const blankBoard = () => setBoard(Array(BOARD).fill(null))

  const say = (word) => {
    stopSpeaking()
    voice(word)
    recordWord(word)
    setHi(word)
    setTimeout(() => setHi((cur) => (cur === word ? null : cur)), 600)
    setMessage((m) => (m.length >= MAX_MSG ? m : [...m, word]))
  }

  const tap = (idx) => {
    const cell = board[idx]
    if (cell) {
      say(cell.word)
      return
    }
    const taken = new Set(board.filter(Boolean).map((w) => w.word))
    const fresh = pickRandom(pool, taken)
    if (!fresh) return
    setBoard((b) => b.map((c, i) => (i === idx ? fresh : c)))
    say(fresh.word)
  }

  const pickCat = (c) => {
    stopSpeaking()
    setCat(c)
    blankBoard() // new set → fresh blank board to reveal from
    setHi(null)
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
    blankBoard() // CLEAR resets the message AND the board
    setHi(null)
  }

  return (
    <div className="wb">
      <header className="wb-bar">
        <button className="wb-bar-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={22} />
        </button>
        <span className="wb-bar-title">Vocab{child ? ` · ${child.name}` : ''}</span>
        <span className="wb-bar-btn wb-bar-spacer" aria-hidden="true" />
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
            <span className="wb-strip-empty">Tap a box to find a word…</span>
          )}
        </button>
        <button className="wb-clear" onClick={clear} disabled={!message.length && board.every((c) => !c)}>
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
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={`wb-cell ${cell ? 'is-filled' : 'is-blank'} ${cell && hi === cell.word ? 'is-hi' : ''}`}
            onClick={() => tap(idx)}
            aria-label={cell ? `Say ${cell.word}` : 'Find a word'}
          >
            {cell && (
              <>
                <img
                  className="wb-cell-img"
                  src={imageSrc(cell.word)}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden'
                  }}
                />
                <span className="wb-cell-word">{cell.word}</span>
              </>
            )}
          </button>
        ))}
      </main>
    </div>
  )
}
