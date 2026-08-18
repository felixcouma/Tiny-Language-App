import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { PRAISE_TEMPLATES, PRAISE_LIGHT, RETRY_AGAIN, RETRY_MODEL } from '../data/content'
import { playCelebration, playChime, voice, voiceSeq, playFx, stopSpeaking, canSpeakName, SETTLE_MS } from '../lib/audio'
import { hasFx } from '../data/fxKeys.js'
import ItemVisual from './ItemVisual.jsx'
import Confetti from './Confetti.jsx'
import TodayProgressLine from './TodayProgressLine.jsx'
import Mascot from './Mascot.jsx'
import { HomeIcon } from './Icons.jsx'
import './ChoiceGame.css'

// Twin Mode turn audio: speak the child's name when we have a clip, otherwise a
// warm generic "Your turn!" cue (never a chime/device voice for an unknown name).
// null for solo games (no players) → just the prompt.
const nameCue = (name) => (name ? (canSpeakName(name) ? name : 'Your turn!') : null)

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
  const [narrowTo, setNarrow] = useState(null) // errorless: after 3 misses, keep only 2 bright
  const locked = useRef(false)
  const answered = useRef(false) // record at most one outcome per round (true "first try")
  const attempts = useRef(0) // wrong taps this round → drives the errorless retry ladder
  const praiseIdx = useRef(Math.floor(Math.random() * PRAISE_TEMPLATES.length)) // rotate praise, varied start

  const player = players ? players[round % players.length] : null

  // Speak a round's prompt: (twin name) → the REAL animal sound (fx-animals, so the
  // child hears the actual trumpet/oink, not a spelled-out onomatopoeia) → the question.
  const speakPrompt = async (item, namePart, roundIdx) => {
    const name = nameCue(namePart)
    if (name) await voice(name)
    if (hasFx(item.sound)) await playFx(item.sound)
    await voice(buildPrompt(item, { round: roundIdx }))
  }

  const deal = useCallback(
    (roundIdx) => {
      const t = pool[Math.floor(Math.random() * pool.length)]
      // Homonym guard (§1.8): never put a food next to its same-named animal in one round
      // (Chicken leg / Chicken, Fish fillet / Fish) — they'd say the same word. Keyed off the
      // `food-` sound prefix, so only those pairs collide.
      const hkey = (it) => String(it.sound || '').replace(/^food-/, '') || it.word.toLowerCase()
      const distractors = pickDistractors
        ? pickDistractors(t, pool, choices - 1)
        : shuffle(pool.filter((p) => p.word !== t.word && hkey(p) !== hkey(t))).slice(0, choices - 1)
      setTarget(t)
      setTiles(shuffle([t, ...distractors]))
      setWrongWord(null)
      setRightWord(null)
      setNarrow(null)
      locked.current = false
      answered.current = false
      attempts.current = 0
      const namePart = players ? players[roundIdx % players.length] : null
      setTimeout(() => speakPrompt(t, namePart, roundIdx), 450)
    },
    [pool, choices, buildPrompt, players, pickDistractors],
  )

  useEffect(() => {
    deal(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Correct answer — or a MODELLED answer after repeated misses — celebrates + advances.
  const finish = (isModel) => {
    locked.current = true
    setRightWord(target.word)
    setNarrow(null)
    if (!isModel) {
      setConfettiKey(Date.now())
      playCelebration()
    }
    const nextRound = round + 1
    const advance = () => {
      if (nextRound >= rounds) {
        setDone(true)
        setConfettiKey(Date.now()) // a second burst for the finale
        // Twin Mode → a shared, no-winner finale that names BOTH children.
        const spokenNames = players ? players.slice(0, 2).filter(canSpeakName) : []
        setTimeout(() => voiceSeq([...spokenNames, 'All done! Wonderful listening!']), 300)
      } else {
        setRound(nextRound)
        deal(nextRound)
      }
    }
    // Model → "Here — cow!"; otherwise labelled praise ("You found the" + "cow!"),
    // with a light interjection ~1 in 4. Chained to audio completion + a settle beat
    // so the word never gets cut off (a learner's pace, not a race).
    let parts
    if (isModel) {
      parts = [RETRY_MODEL, `${target.word}!`]
    } else {
      const i = praiseIdx.current++
      parts =
        i % 4 === 3
          ? [PRAISE_LIGHT[Math.floor(i / 4) % PRAISE_LIGHT.length]]
          : [PRAISE_TEMPLATES[i % PRAISE_TEMPLATES.length], `${target.word}!`]
    }
    setTimeout(() => voiceSeq(parts).then(() => setTimeout(advance, SETTLE_MS)), isModel ? 200 : 250)
  }

  const onPick = (item) => {
    if (locked.current) return
    // A dimmed tile (after narrowing) is inert — errorless, never a wrong "buzz".
    if (narrowTo && !narrowTo.has(item.word)) return
    // Stop any still-playing prompt (esp. the longer real-fx one) so the praise/word
    // that follows plays cleanly and never gets clipped by leftover prompt audio.
    stopSpeaking()
    const correct = item.word === target.word
    // Record the round's outcome once, on the FIRST tap ("found first try").
    if (!answered.current) {
      answered.current = true
      recordGame(correct)
    }
    if (correct) {
      finish(false)
      return
    }
    // Errorless retry ladder: help escalates, then we MODEL the answer and accept it
    // as success — the child is never stuck and never "fails".
    attempts.current += 1
    const n = attempts.current
    setWrongWord(item.word)
    playChime(item.word)
    if (n >= 4) {
      finish(true) // model + accept
      return
    }
    if (n === 3) setNarrow(new Set([target.word, item.word])) // narrow to 2 choices
    // n1: a gentle "Try again."; n2/n3: repeat the prompt (real sound cue included).
    if (n === 1) setTimeout(() => voice(RETRY_AGAIN), 200)
    else setTimeout(() => speakPrompt(target, null, round), 200)
    setTimeout(() => setWrongWord(null), 600)
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
          onClick={() => target && speakPrompt(target, player, round)}
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
            } ${narrowTo && !narrowTo.has(item.word) ? 'is-dim' : ''}`}
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
