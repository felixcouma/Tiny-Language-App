import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { voice, voiceSeq, playChime, stopSpeaking } from '../lib/audio'
import { WORDS, CATEGORIES, wordsInCategory, CORE_BOARD } from '../data/phraseContent'
import { PRAISE } from '../data/content'
import { HomeIcon } from '../components/Icons.jsx'
import WordPic from '../components/WordPic.jsx'
import './GridScreen.css'

// Word Board — two modes the parent toggles:
//  • Board: a real AAC communication board. Symbol positions are STABLE — the Core page
//    is a fixed layout (never shuffles, always the landing view) and each category is a
//    position-stable fringe page. Tapping a cell speaks the word + adds it to the message
//    strip. CLEAR empties the message strip only; it never blanks the board.
//  • Find (word-focus, for a tracker): ONE target word appears in a random cell; tapping
//    it speaks it with warm praise, then it hops to a new cell to track & find. After 5
//    finds it moves to a new word. A separate activity — NOT the communication board.
const BOARD = 24 // Find-mode grid (4 cols × 6 rows)
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
  const [page, setPage] = useState('Core') // 'Core' (fixed core board) | a category (fringe page)

  // Board pages are position-stable: the Core page is a fixed layout constant; each
  // fringe page is its category's words in the bank's deterministic order. No reveal,
  // no shuffle — the same word always sits in the same cell.
  const pageWords = useMemo(
    () => (page === 'Core' ? CORE_BOARD : wordsInCategory(page).map((w) => w.word)),
    [page]
  )

  // Focus words of the week (grown-up-set): in Find mode the target rotates through
  // THESE instead of the page pool, turning Find into targeted homework.
  const focus = useStore((s) => s.activeProfile()?.focusWords || [])
  const focusPool = useMemo(
    () => focus.map((fw) => WORDS.find((w) => w.word === fw)).filter(Boolean),
    [focus]
  )
  // Find needs picturable targets, so on the Core page (abstract words) draw from the
  // whole bank; on a fringe page, from that category.
  const findBase = useMemo(() => (page === 'Core' ? WORDS : wordsInCategory(page)), [page])
  const findPool = mode === 'find' && focusPool.length ? focusPool : findBase

  const [hi, setHi] = useState(null)
  const [message, setMessage] = useState([])

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

  // ---- Find mode: announce a new target word & drop it in a random cell ----
  const newTarget = (avoidWord) => {
    const next = pickRandom(findPool, avoidWord ? new Set([avoidWord]) : new Set()) || findPool[0]
    setTarget(next)
    setFinds(0)
    setTargetCell(randCell(null))
    stopSpeaking()
    if (next) voice(next.word) // tell the child what to look for
  }

  // Entering Find (changing the page, or new focus words) starts a fresh word.
  useEffect(() => {
    if (mode === 'find') newTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, page, focus.join(',')])

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

  // Switch page — positions are stable, so this NEVER blanks or shuffles the board.
  const pickPage = (p) => {
    stopSpeaking()
    setPage(p)
    setHi(null)
  }

  const sayMessage = () => {
    if (!message.length) return
    stopSpeaking()
    voiceSeq(message)
    if (message.length > 1) recordPhrase(message.join(' '))
  }

  // CLEAR empties the message strip only — the board stays put (AAC stability).
  const clear = () => {
    stopSpeaking()
    setMessage([])
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
              <span className="wb-strip-empty">Tap words to build a message…</span>
            )}
          </button>
          <button className="wb-clear" onClick={clear} disabled={!message.length}>
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
            <span className="wb-find-label">{focusPool.length ? '★ This week · Find' : 'Find'}</span>
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
        {/* Numbers live in the Counting Mountain world, not the communication board. */}
        {['Core', ...CATEGORIES.filter((c) => c !== 'Numbers')].map((c) => (
          <button
            key={c}
            className={`wb-cat ${c === page ? 'is-active' : ''}`}
            onClick={() => pickPage(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <main className="wb-board">
        {mode === 'board'
          ? pageWords.map((word, idx) => (
              <button
                key={`${page}-${idx}-${word}`}
                className={`wb-cell is-filled ${hi === word ? 'is-hi' : ''}`}
                onClick={() => say(word)}
                aria-label={`Say ${word}`}
              >
                <WordPic key={word} word={word} variant="cell" />
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

      {mode === 'board' && (
        <p className="wb-hint">
          Tap words yourself while you talk — children learn the board by watching you use it.
        </p>
      )}
    </div>
  )
}
