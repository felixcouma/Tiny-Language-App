import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { playItem, playCelebration, playChime, voice } from '../lib/audio'
import ItemVisual from './ItemVisual.jsx'
import Confetti from './Confetti.jsx'
import './ChoiceGame.css'

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/*
 * Shared listen-and-tap game. No pressure: wrong taps just wobble and invite a
 * retry; every correct tap celebrates. Used by Sound Game and Twin Mode.
 *
 * props:
 *   pool        items to draw from (should resolve to photos)
 *   title       header label
 *   grad        header gradient
 *   rounds      how many correct answers = a finished session
 *   choices     tiles per round (default 4)
 *   buildPrompt (item, ctx) => spoken prompt string
 *   players     optional [names]; when set, shows "<name>'s turn" and cycles
 */
export default function ChoiceGame({
  pool,
  title,
  grad,
  rounds = 8,
  choices = 4,
  buildPrompt,
  players = null,
}) {
  const goHome = useStore((s) => s.goHome)
  const recordGame = useStore((s) => s.recordGame)

  const [round, setRound] = useState(0) // completed rounds
  const [target, setTarget] = useState(null)
  const [tiles, setTiles] = useState([])
  const [wrongWord, setWrongWord] = useState(null)
  const [rightWord, setRightWord] = useState(null)
  const [confettiKey, setConfettiKey] = useState(null)
  const [done, setDone] = useState(false)
  const locked = useRef(false)

  const player = players ? players[round % players.length] : null

  const deal = useCallback(
    (roundIdx) => {
      const t = pool[Math.floor(Math.random() * pool.length)]
      const distractors = shuffle(pool.filter((p) => p.word !== t.word)).slice(0, choices - 1)
      setTarget(t)
      setTiles(shuffle([t, ...distractors]))
      setWrongWord(null)
      setRightWord(null)
      locked.current = false
      const intro = players ? `${players[roundIdx % players.length]}, ` : ''
      setTimeout(() => voice(intro + buildPrompt(t, { round: roundIdx })), 450)
    },
    [pool, choices, buildPrompt, players],
  )

  useEffect(() => {
    deal(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPick = (item) => {
    if (locked.current) return
    if (item.word === target.word) {
      locked.current = true
      setRightWord(item.word)
      setConfettiKey(Date.now())
      playCelebration()
      setTimeout(() => playItem({ say: `Yes! ${target.word}!`, word: target.word }), 250)
      recordGame(true)
      const nextRound = round + 1
      setTimeout(() => {
        if (nextRound >= rounds) {
          setDone(true)
          setTimeout(() => voice('All done! Wonderful listening!'), 300)
        } else {
          setRound(nextRound)
          deal(nextRound)
        }
      }, 1900)
    } else {
      setWrongWord(item.word)
      playChime(item.word)
      recordGame(false)
      setTimeout(() => voice(`Try again. Find the ${target.word.toLowerCase()}.`), 200)
      setTimeout(() => setWrongWord(null), 600)
    }
  }

  const replay = () => {
    setRound(0)
    setDone(false)
    deal(0)
  }

  if (done) {
    return (
      <div className="game">
        <Header title={title} grad={grad} onExit={goHome} />
        <div className="game-done">
          <Confetti fireKey={confettiKey} />
          <h2 className="done-title">Wonderful listening!</h2>
          <p className="done-sub">You found {rounds} of them.</p>
          <div className="done-actions">
            <button className="big-btn primary" onClick={replay}>
              Play again
            </button>
            <button className="big-btn" onClick={goHome}>
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game">
      <Header title={title} grad={grad} onExit={goHome} />
      <Confetti fireKey={confettiKey} />

      <div className="game-prompt">
        {player && <div className="turn-pill">{player}&rsquo;s turn</div>}
        <button
          className="hint-btn"
          onClick={() => target && voice((player ? `${player}, ` : '') + buildPrompt(target, { round }))}
        >
          Listen again
        </button>
      </div>

      <div className="choice-grid" style={{ gridTemplateColumns: `repeat(${choices === 2 ? 2 : 2}, 1fr)` }}>
        {tiles.map((item) => (
          <button
            key={item.word}
            className={`choice ${rightWord === item.word ? 'is-right' : ''} ${
              wrongWord === item.word ? 'is-wrong' : ''
            }`}
            onClick={() => onPick(item)}
            aria-label={item.word}
          >
            <ItemVisual item={item} kind="choice" />
          </button>
        ))}
      </div>

      <div className="progress" aria-label={`${round} of ${rounds}`}>
        {Array.from({ length: rounds }).map((_, i) => (
          <span key={i} className={`pip ${i < round ? 'on' : ''}`} />
        ))}
      </div>
    </div>
  )
}

function Header({ title, grad, onExit }) {
  return (
    <header className="game-header">
      <button className="icon-btn" onClick={onExit} aria-label="Back to home">
        ‹
      </button>
      <span className="learn-badge" style={{ background: grad }}>
        {title}
      </span>
      <span style={{ minWidth: 40 }} />
    </header>
  )
}
