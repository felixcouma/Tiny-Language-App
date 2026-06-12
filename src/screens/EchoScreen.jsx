import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { playItem, voice, playCelebration, stopSpeaking } from '../lib/audio'
import { buildTodaySession } from '../lib/today'
import { PRAISE } from '../data/content'
import WordPic from '../components/WordPic.jsx'
import Mascot from '../components/Mascot.jsx'
import Confetti from '../components/Confetti.jsx'
import { HomeIcon, SpeakerIcon } from '../components/Icons.jsx'
import './EchoScreen.css'

// Say It With Me — gentle turn-taking vocalization practice (speech-therapy "echo").
// The app says a word (+ its animal sound), then asks the child to say it back.
//
// Praise is tied to a REAL attempt: it fires only when the grown-up/child taps
// "I said it!" — never on a timer — so a "Hooray!" never lands when no word was
// said. The "your turn" wait is open-ended (Pip just listens, no countdown). If
// nobody confirms an attempt within PATIENT_MS, we QUIETLY move to the next word
// with NO celebration — so silence is never punished and never gets fake praise,
// and the activity never gets stuck. (NO microphone — a future opt-in mic could
// auto-detect a vocalization to trigger the same praise, but must never withhold
// it from a quiet attempt.)
const PATIENT_MS = 9000 // open-ended wait; no "I said it!" → gently advance, no praise

export default function EchoScreen() {
  const goHome = useStore((s) => s.goHome)
  const recordHeard = useStore((s) => s.recordHeard)
  const child = useStore((s) => s.activeProfile())

  const build = () =>
    buildTodaySession(
      useStore.getState().progress,
      useStore.getState().stage(),
      useStore.getState().focusWords()
    )
  const [queue, setQueue] = useState(build)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('listen') // 'listen' | 'yourturn' | 'cheer'
  const [fire, setFire] = useState(null) // null → no confetti until a real celebration
  const praiseIdx = useRef(Math.floor(Math.random() * PRAISE.length))
  const turnHandled = useRef(false) // one outcome per card (a tap-praise or a quiet advance)
  const item = queue[idx]
  const done = idx >= queue.length

  // Say the word (and animal sound), then open the "your turn" window.
  useEffect(() => {
    if (!item) return
    let cancelled = false
    setPhase('listen')
    turnHandled.current = false // fresh card — a new attempt can be confirmed
    const t = setTimeout(async () => {
      recordHeard(item, item.worldId)
      await playItem(item)
      if (!cancelled) setPhase('yourturn')
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Patient fallback ONLY — praise is never auto-fired. If no one confirms an attempt
  // within PATIENT_MS, quietly advance to the next word (no celebration).
  useEffect(() => {
    if (phase !== 'yourturn') return
    const t = setTimeout(() => gentleNext(), PATIENT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx])

  // Praise — fires ONLY from the "I said it!" tap, so it always follows a real attempt.
  function cheer() {
    if (turnHandled.current) return
    turnHandled.current = true
    setPhase('cheer')
    const praise = PRAISE[praiseIdx.current++ % PRAISE.length]
    stopSpeaking()
    voice(praise)
    playCelebration()
    setFire((f) => (f || 0) + 1)
    setTimeout(() => setIdx((i) => i + 1), 1500)
  }

  // Quiet move-on when no attempt was confirmed — NO praise, no failure framing.
  function gentleNext() {
    if (turnHandled.current) return
    turnHandled.current = true
    stopSpeaking()
    setPhase('listen')
    setIdx((i) => i + 1)
  }

  // A warm confetti + chime to round off the whole session.
  useEffect(() => {
    if (done) {
      playCelebration()
      setFire((f) => (f || 0) + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const again = () => {
    stopSpeaking()
    setQueue(build())
    setIdx(0)
    setPhase('listen')
  }
  const replay = () => item && playItem(item)

  if (done) {
    return (
      <div className="scene echo">
        <Confetti fireKey={fire} />
        <div className="echo-done">
          <Mascot size={96} />
          <h2 className="echo-done-title">You used your voice{child ? `, ${child.name}` : ''}!</h2>
          <p className="echo-done-sub">You said {queue.length} words with Pip.</p>
          <div className="echo-done-actions">
            <button className="chunky echo-cta" onClick={again}>Again</button>
            <button className="chunky echo-cta echo-home" onClick={goHome}>Home</button>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="scene echo">
      <Confetti fireKey={fire} />
      <header className="echo-top">
        <button className="round-btn" onClick={() => { stopSpeaking(); goHome() }} aria-label="Home">
          <HomeIcon size={24} />
        </button>
        <div className="echo-progress" aria-label={`${idx + 1} of ${queue.length}`}>
          {queue.map((_, i) => (
            <span key={i} className={`echo-pip ${i < idx ? 'on' : ''} ${i === idx ? 'now' : ''}`} />
          ))}
        </div>
        <Mascot size={46} />
      </header>

      <div className="echo-bubble-row">
        <div className="speech-bubble">
          {phase === 'listen' ? 'Listen…' : phase === 'yourturn' ? 'Now YOU say it!' : 'Hooray!'}
        </div>
      </div>

      <main className="echo-main">
        <button
          className={`echo-card ${phase}`}
          onClick={replay}
          aria-label={`Hear ${item.word} again`}
        >
          <WordPic key={item.word} word={item.word} variant="card" />
          {phase === 'yourturn' && <span className="echo-ring" aria-hidden="true" />}
        </button>
        <span className="echo-word">{item.word}</span>

        {phase === 'listen' && (
          <button className="chunky echo-replay" onClick={replay}>
            <SpeakerIcon size={22} /> Hear it
          </button>
        )}
        {phase === 'yourturn' && (
          <div className="echo-turn">
            <button className="chunky echo-said" onClick={cheer}>
              I said it!
            </button>
            <button className="echo-skip" onClick={gentleNext}>
              skip
            </button>
            <p className="echo-hint">Take your time — tap “I said it!” when they try.</p>
          </div>
        )}
      </main>
    </div>
  )
}
