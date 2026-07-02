import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { PRAISE } from '../data/content'
import { playCelebration, playChime, voice, voiceSeq, hasNameClip } from '../lib/audio'
import ItemVisual from './ItemVisual.jsx'
import Confetti from './Confetti.jsx'
import TodayProgressLine from './TodayProgressLine.jsx'
import Mascot from './Mascot.jsx'
import { HomeIcon } from './Icons.jsx'
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
  pickDistractors = null, // (target, pool, count) => items
  promptBadge = null, // (target) => node, shown in the prompt area
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
  const answered = useRef(false) // record at most one outcome per round (true "first try")
  const praiseIdx = useRef(Math.floor(Math.random() * PRAISE.length)) // rotate praise, varied start

  const player = players ? players[round % players.length] : null

  const deal = useCallback(
    (roundIdx) => {
      const t = pool[Math.floor(Math.random() * pool.length)]
      const distractors = pickDistractors
        ? pickDistractors(t, pool, choices - 1)
        : shuffle(pool.filter((p) => p.word !== t.word)).slice(0, choices - 1)
      setTarget(t)
      setTiles(shuffle([t, ...distractors]))
      setWrongWord(null)
      setRightWord(null)
      locked.current = false
      answered.current = false
      const namePart = players ? players[roundIdx % players.length] : null
      // Speak the name only when we have a clip for it; otherwise the pill still
      // shows it but we go straight to the prompt (no chime for an unknown name).
      setTimeout(() => voiceSeq([hasNameClip(namePart) ? namePart : null, buildPrompt(t, { round: roundIdx })]), 450)
    },
    [pool, choices, buildPrompt, players, pickDistractors],
  )

  useEffect(() => {
    deal(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPick = (item) => {
    if (locked.current) return
    const correct = item.word === target.word
    // Record the round's outcome once, on the FIRST tap, so the parent
    // dashboard's "found first try" reflects reality (not one row per wrong tap).
    if (!answered.current) {
      answered.current = true
      recordGame(correct)
    }
    if (correct) {
      locked.current = true
      setRightWord(item.word)
      setConfettiKey(Date.now())
      playCelebration()
      // Rotating warm praise ("Awesome!" …) then the word — both pre-rendered clips.
      const praise = PRAISE[praiseIdx.current++ % PRAISE.length]
      setTimeout(() => voiceSeq([praise, `${target.word}!`]), 250)
      const nextRound = round + 1
      setTimeout(() => {
        if (nextRound >= rounds) {
          setDone(true)
          setConfettiKey(Date.now()) // a second burst for the finale
          // Twin Mode → a shared, no-winner finale that names BOTH children
          // (uses their existing name clips + the celebration line; no new audio).
          // Say the names we have clips for, then the celebration (no chime for
          // unknown names — they still appear on the screen).
          const spokenNames = players ? players.slice(0, 2).filter(hasNameClip) : []
          setTimeout(() => voiceSeq([...spokenNames, 'All done! Wonderful listening!']), 300)
        } else {
          setRound(nextRound)
          deal(nextRound)
        }
      }, 1900)
    } else {
      setWrongWord(item.word)
      playChime(item.word)
      const retry = target.action
        ? `Try again. Which one is ${target.word.toLowerCase()}?`
        : `Try again. Find the ${target.word.toLowerCase()}.`
      setTimeout(() => voice(retry), 200)
      setTimeout(() => setWrongWord(null), 600)
    }
  }

  const replay = () => {
    setRound(0)
    setDone(false)
    deal(0)
  }

  if (done) {
    const twin = players && players.length >= 2
    return (
      <div className="game">
        <Header title={title} grad={grad} onExit={goHome} />
        <div className={`game-done ${twin ? 'is-twin' : ''}`}>
          <Confetti fireKey={confettiKey} />
          {twin ? (
            <>
              <div className="done-team">
                <Mascot size={76} />
              </div>
              <h2 className="done-title">You did it together!</h2>
              <p className="done-sub">
                {players.slice(0, 2).join(' & ')} found all {rounds} — great teamwork!
              </p>
            </>
          ) : (
            <>
              <h2 className="done-title">Wonderful listening!</h2>
              <p className="done-sub">You found {rounds} of them.</p>
            </>
          )}
          <TodayProgressLine />
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
        {promptBadge && target && promptBadge(target)}
        {player && <div className="turn-pill">{player}&rsquo;s turn</div>}
        <button
          className="hint-btn"
          onClick={() => target && voiceSeq([hasNameClip(player) ? player : null, buildPrompt(target, { round })])}
        >
          Listen again
        </button>
      </div>

      <div className="choice-grid" style={{ gridTemplateColumns: `repeat(${choices === 3 ? 3 : 2}, 1fr)` }}>
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
      <button className="round-btn" onClick={onExit} aria-label="Back to home">
        <HomeIcon size={26} />
      </button>
      <span className="learn-badge" style={{ background: grad }}>
        {title}
      </span>
      <span style={{ minWidth: 54 }} />
    </header>
  )
}
