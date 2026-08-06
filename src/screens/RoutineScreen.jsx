import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { ROUTINES } from '../data/routines'
import {
  voice,
  voiceSeq,
  playCelebration,
  playChime,
  stopSpeaking,
  slugify,
  SETTLE_MS,
} from '../lib/audio'
import { imageKeyFor } from '../data/phraseContent'
import Mascot from '../components/Mascot.jsx'
import Confetti from '../components/Confetti.jsx'
import ActionAnimation from '../components/ActionAnimation.jsx'
import { HomeIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/Icons.jsx'
import './RoutineScreen.css'

const BASE = import.meta.env.BASE_URL || '/'
// A step's picture: an explicit scene/summary override (`img`), else the tap word's image.
const stepImg = (step) => `${BASE}images/${step.img || imageKeyFor(step.tap) || slugify(step.tap)}.webp`
const hideOnError = (e) => {
  e.currentTarget.style.display = 'none'
}

// Unrushed but responsive: 4s to act, then one gentle re-say, then drift onward.
const WAIT_MS = 4000 // glow + wait after the line, then one gentle re-say
const NUDGE_MS = 4000 // a little more time after the re-say, then drift onward

// Every Day with Pip — a calm guided picture-story that models connected language
// inside a daily routine. Tap-along + no-fail generous auto-advance.
export default function RoutineScreen() {
  const goHome = useStore((s) => s.goHome)
  const [routine, setRoutine] = useState(null)
  return routine ? (
    <Player routine={routine} onExit={() => setRoutine(null)} onHome={goHome} />
  ) : (
    <Picker onPick={setRoutine} onExit={goHome} />
  )
}

/* ----------------------------- routine picker ----------------------------- */
function Picker({ onPick, onExit }) {
  return (
    <div className="scene routine">
      <div className="scene-globe" />
      <header className="rt-top">
        <button className="round-btn" onClick={onExit} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <div className="rt-title">
          <span className="rt-title-main">Every Day with Pip</span>
        </div>
        <span className="rt-spacer" />
      </header>

      <div className="rt-greet">
        <span className="speech-bubble">Let&rsquo;s do it together!</span>
        <Mascot size={64} />
      </div>

      <main className="rt-picker">
        {ROUTINES.map((r) => (
          <button
            key={r.id}
            className="rt-card"
            style={{ background: r.grad }}
            onClick={() => {
              playChime('routines')
              onPick(r)
            }}
            aria-label={`${r.name}. ${r.tagline}.`}
          >
            <span className="rt-card-name">{r.name}</span>
            <span className="rt-card-tag">{r.tagline}</span>
          </button>
        ))}
      </main>
    </div>
  )
}

/* ------------------------------ routine player ---------------------------- */
function Player({ routine, onExit, onHome }) {
  const muted = useStore((s) => s.muted)
  const steps = routine.steps
  const [idx, setIdx] = useState(0)
  const [tapped, setTapped] = useState(false)
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(null)
  const timers = useRef([])
  const step = steps[idx]

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }

  const advance = () => {
    clearTimers()
    stopSpeaking()
    setTapped(false)
    if (idx + 1 >= steps.length) {
      setDone(true)
      setBurst(Date.now())
      if (!muted) playCelebration()
      setTimeout(() => voiceSeq(['All done!', 'Great job!']), 250)
    } else {
      setIdx(idx + 1)
    }
  }

  // Each step: Pip narrates → target glows → generous wait → one gentle re-say → drift on.
  useEffect(() => {
    if (done) return
    clearTimers()
    setTapped(false)
    if (!muted) later(() => voice(step.say), 350)
    later(() => {
      if (!muted) voice(step.say)
    }, WAIT_MS)
    later(advance, WAIT_MS + NUDGE_MS)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done])

  const onTap = () => {
    if (tapped) return
    stopSpeaking()
    clearTimers()
    setTapped(true)
    setBurst(Date.now())
    voice(step.tap)
    later(advance, SETTLE_MS + 300)
  }

  if (done) {
    return (
      <div className="scene routine">
        <div className="scene-globe" />
        <Header grad={routine.grad} onExit={onHome} />
        <Confetti fireKey={burst} />
        <div className="rt-done">
          <Mascot size={84} />
          <h2 className="rt-done-title">All done!</h2>
          <p className="rt-done-sub">{routine.name} with Pip — great job!</p>
          <div className="rt-done-actions">
            <button className="big-btn primary" onClick={onExit}>
              Another routine
            </button>
            <button className="big-btn" onClick={onHome}>
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="scene routine">
      <div className="scene-globe" />
      <Header grad={routine.grad} onExit={onExit} title={routine.name} />
      <Confetti fireKey={burst} />

      <div className="rt-dots" aria-label={`Step ${idx + 1} of ${steps.length}`}>
        {steps.map((_, i) => (
          <span key={i} className={`rt-dot ${i < idx ? 'on' : ''} ${i === idx ? 'cur' : ''}`} />
        ))}
      </div>

      <div className="rt-greet">
        <span className="speech-bubble">{step.say}</span>
        <Mascot size={58} />
      </div>

      <button
        className={`rt-target ${tapped ? 'is-tapped' : 'is-glow'}`}
        onClick={onTap}
        aria-label={`Tap ${step.tap}`}
      >
        {step.anim ? (
          <div className="rt-target-anim">
            <ActionAnimation soundKey={step.anim} />
          </div>
        ) : (
          <img key={step.tap + (step.img || '')} className="rt-target-img" src={stepImg(step)} alt="" onError={hideOnError} />
        )}
        <span className="rt-word">{step.tap}</span>
      </button>

      <div className="rt-nav">
        <button
          className="chunky arrow"
          onClick={() => {
            clearTimers()
            stopSpeaking()
            setIdx((n) => Math.max(0, n - 1))
          }}
          disabled={idx === 0}
          aria-label="Previous step"
        >
          <ArrowLeftIcon size={26} />
        </button>
        <button className="rt-next" onClick={advance} aria-label="Next step">
          Next <ArrowRightIcon size={22} />
        </button>
      </div>
    </div>
  )
}

function Header({ grad, onExit, title }) {
  return (
    <header className="rt-top">
      <button className="round-btn" onClick={onExit} aria-label="Back">
        <HomeIcon size={26} />
      </button>
      {title && (
        <span className="rt-badge" style={{ background: grad }}>
          {title}
        </span>
      )}
      <span className="rt-spacer" />
    </header>
  )
}
