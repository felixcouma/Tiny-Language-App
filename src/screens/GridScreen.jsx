import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { voice, stopSpeaking } from '../lib/audio'
import { WORDS, CATEGORIES, wordsInCategory } from '../data/phraseContent'
import { HomeIcon, ReplayIcon } from '../components/Icons.jsx'
import './GridScreen.css'

// Grid Vocabulary — a therapist-style AAC board. A board of tappable words; tap to
// hear one, refresh a single cell (↻) once a child "gets" it so fresh vocabulary
// rotates in, or shuffle the whole board. Filter by category to focus a session.
const BOARD = 9 // 3 × 3 cells
const PALETTE = ['#3d7fb0', '#ff6a00', '#36a35a', '#8a3fd0', '#d6336c', '#0c8599', '#e8590c', '#5f3dc4']
const colorFor = (cats, cat) => PALETTE[Math.max(0, cats.indexOf(cat)) % PALETTE.length]

const sample = (arr, n, exclude = new Set()) => {
  const pool = arr.filter((w) => !exclude.has(w.word))
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

  const allCats = CATEGORIES
  const [cat, setCat] = useState('All')
  const pool = useMemo(() => (cat === 'All' ? WORDS : wordsInCategory(cat)), [cat])

  const [board, setBoard] = useState(() => sample(WORDS, BOARD))
  const [hi, setHi] = useState(null) // highlighted word

  const rebuild = (nextCat) => {
    stopSpeaking()
    const c = nextCat ?? cat
    const src = c === 'All' ? WORDS : wordsInCategory(c)
    setBoard(sample(src, BOARD))
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
    setTimeout(() => setHi((cur) => (cur === w.word ? null : cur)), 700)
  }
  const refreshCell = (idx) => {
    const exclude = new Set(board.map((w) => w.word))
    const [fresh] = sample(pool, 1, exclude)
    if (!fresh) return
    setBoard((b) => b.map((w, i) => (i === idx ? fresh : w)))
  }

  return (
    <div className="scene grid-scene">
      <div className="scene-globe" />
      <header className="gv-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <div className="gv-title">
          <span className="gv-title-main">Word Board</span>
          {child && <span className="gv-title-sub">for {child.name}</span>}
        </div>
        <button className="round-btn" onClick={() => rebuild()} aria-label="New words">
          <ReplayIcon size={24} />
        </button>
      </header>

      <div className="gv-cats" role="tablist" aria-label="Word groups">
        {['All', ...allCats].map((c) => (
          <button
            key={c}
            className={`gv-cat ${c === cat ? 'is-active' : ''}`}
            onClick={() => pickCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <main className="gv-board">
        {board.map((w, idx) => (
          <div
            key={`${w.word}-${idx}`}
            className={`gv-cell ${hi === w.word ? 'is-hi' : ''}`}
            style={{ '--cell': colorFor(allCats, w.category) }}
          >
            <button className="gv-cell-tap" onClick={() => tap(w)} aria-label={`Hear ${w.word}`}>
              {w.word}
            </button>
            <button
              className="gv-cell-refresh"
              onClick={() => refreshCell(idx)}
              aria-label={`New word in place of ${w.word}`}
            >
              <ReplayIcon size={16} />
            </button>
          </div>
        ))}
      </main>

      <p className="gv-hint">Tap a word to hear it · tap ↻ on a cell for a fresh word</p>
    </div>
  )
}
