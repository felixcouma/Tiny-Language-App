import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { voice, voiceSeq, playChime, stopSpeaking } from '../lib/audio'
import { WORDS, CATEGORIES, wordsInCategory } from '../data/phraseContent'
import { PRAISE } from '../data/content'
import { HomeIcon } from '../components/Icons.jsx'
import WordPic from '../components/WordPic.jsx'
import './GridScreen.css'

// Word Board — two modes the parent toggles:
//  • Board: a therapist-style AAC board. Starts BLANK; tapping an empty cell reveals
//    a random word, speaks it, and adds it to the message strip. CLEAR resets both.
//  • Find (word-focus, for Adriel): ONE target word appears in a random cell; tapping
//    it speaks it with warm praise, then it hops to a new cell so he tracks & finds it.
//    After 5 finds it moves on to a new word. Toggle back to Board anytime.
const BOARD = 24 // 4 cols × 6 rows
const MAX_MSG = 8
const FIND_GOAL = 5

const pickRandom = (pool, taken) => {
  const avail = pool.filter((w) => !taken.has(w.word))
  if (!avail.length) return null
  return avail[Math.floor(Math.random() * avail.length)]
}
const randCell = (avoid) => {
  let i = Math.floor(Math.random() * BOARD)
  while (avoid != null && i === avoid) i = Math.floor(Math.random() * BOARD)
  return i
}

export default function GridScreen() {
  const child = useStore((s) => s.activeProfile())
  const goHome = useStore((s) => s.goHome)
  const recordWord = useStore((s) => s.recordPracticeWord)
  const recordPhrase = useStore((s) => s.recordPhrase)

  const [mode, setMode] = useState('board') // 'board' | 'find'
  const [cat, setCat] = useState('All')
  const pool = useMemo(() => (cat === 'All' ? WORDS : wordsInCategory(cat)), [cat])

  // Board mode
  const [board, setBoard] = useState(() => Array(BOARD).fill(null))
  const [hi, setHi] = useState(null)
  const [message, setMessage] = useState([])
  const blankBoard = () => setBoard(Array(BOARD).fill(null))

  // Find mode
  const [target, setTarget] = useState(null)
  const [targetCell, setTargetCell] = useState(0)
  const [finds, setFinds] = useState(0)
  const [foundFlash, setFoundFlash] = useState(false)
  const praiseIdx = useRef(Math.floor(Math.random() * PRAISE.length))

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

  // ---- Find mode: announce a new target word & drop it in a random cell ----
  const newTarget = (avoidWord) => {
    const next = pickRandom(pool, avoidWord ? new Set([avoidWord]) : new Set()) || pool[0]
    setTarget(next)
    setFinds(0)
    setTargetCell(randCell(null))
    stopSpeaking()
    if (next) voice(next.word) // tell the child what to look for
  }

  // Entering Find (or changing the category while in Find) starts a fresh word.
  useEffect(() => {
    if (mode === 'find') newTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cat])

  const onFindTap = (idx) => {
    if (!target) return
    if (idx !== targetCell) {
      playChime('find-miss') // tapped a blank cell — gentle, never a penalty
      return
    }
    const praise = PRAISE[praiseIdx.current++ % PRAISE.length]
    stopSpeaking()
    voiceSeq([praise, target.word])
    recordWord(target.word)
    setFoundFlash(true)
    setTimeout(() => setFoundFlash(false), 350)
    const n = finds + 1
    if (n >= FIND_GOAL) {
      setTimeout(() => newTarget(target.word), 950) // mastered → next word
    } else {
      setFinds(n)
      setTargetCell((c) => randCell(c)) // hop to a new spot to track & find
    }
  }

  const pickCat = (c) => {
    stopSpeaking()
    setCat(c)
    setHi(null)
    if (mode === 'board') blankBoard() // new set → fresh blank board (Find resets via effect)
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
    blankBoard()
    setHi(null)
  }

  return (
    <div className="wb">
      <header className="wb-bar">
        <button className="wb-bar-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={22} />
        </button>
        <span className="wb-bar-title">Vocab{child ? ` · ${child.name}` : ''}</span>
        <div className="wb-modes" role="tablist" aria-label="Board mode">
          <button
            className={`wb-mode ${mode === 'board' ? 'is-active' : ''}`}
            onClick={() => setMode('board')}
          >
            Board
          </button>
          <button
            className={`wb-mode ${mode === 'find' ? 'is-active' : ''}`}
            onClick={() => setMode('find')}
          >
            Find
          </button>
        </div>
      </header>

      {mode === 'board' ? (
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
      ) : (
        <div className="wb-find">
          <button
            className="wb-find-word"
            onClick={() => target && voice(target.word)}
            aria-label={target ? `Find ${target.word}. Tap to hear it again.` : 'Find a word'}
          >
            <span className="wb-find-label">Find</span>
            <span className="wb-find-target">{target ? target.word : '…'}</span>
          </button>
          <div className="wb-find-progress" aria-label={`${finds} of ${FIND_GOAL} found`}>
            {Array.from({ length: FIND_GOAL }, (_, i) => (
              <span key={i} className={`wb-dot ${i < finds ? 'is-on' : ''}`} />
            ))}
          </div>
        </div>
      )}

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
        {mode === 'board'
          ? board.map((cell, idx) => (
              <button
                key={idx}
                className={`wb-cell ${cell ? 'is-filled' : 'is-blank'} ${cell && hi === cell.word ? 'is-hi' : ''}`}
                onClick={() => tap(idx)}
                aria-label={cell ? `Say ${cell.word}` : 'Find a word'}
              >
                {cell && <WordPic key={cell.word} word={cell.word} variant="cell" />}
              </button>
            ))
          : Array.from({ length: BOARD }, (_, idx) => {
              const here = target && idx === targetCell
              return (
                <button
                  key={idx}
                  className={`wb-cell ${here ? 'is-filled' : 'is-blank'} ${here && foundFlash ? 'is-hi' : ''}`}
                  onClick={() => onFindTap(idx)}
                  aria-label={here ? `Tap the ${target.word}` : 'Empty'}
                >
                  {here && <WordPic key={target.word} word={target.word} variant="cell" />}
                </button>
              )
            })}
      </main>
    </div>
  )
}
