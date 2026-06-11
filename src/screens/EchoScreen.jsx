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
// The app says a word (+ its animal sound), then asks the child to say it back. There
// is NO microphone and NO detection: the *turn itself* is the win, so every attempt is
// celebrated and nothing can read as failure — exactly what a non-verbal or speech-
// delayed toddler needs. (A future opt-in mic could only ADD an "I heard you!" bonus;
// it must never gate the praise — see the note in `cheer()`.)
const ECHO_WAIT_MS = 3200 // the "now you say it" window before we celebrate the turn

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
  const [fire, setFire] = useState(0)
  const praiseIdx = useRef(Math.floor(Math.random() * PRAISE.length))
  const item = queue[idx]
  const done = idx >= queue.length

  // Say the word (and animal sound), then open the "your turn" window.
  useEffect(() => {
    if (!item) return
    let cancelled = false
    setPhase('listen')
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

  // No mic: after a gentle pause, celebrate the turn and move on.
  useEffect(() => {
    if (phase !== 'yourturn') return
    const t = setTimeout(() => cheer(), ECHO_WAIT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx])

  // Celebrate the attempt — ALWAYS positive. (Future mic: detection may swap the
  // praise line for an "I heard you!" bonus, but must never withhold celebration.)
  function cheer() {
    setPhase((cur) => {
      if (cur === 'cheer') return cur
      const praise = PRAISE[praiseIdx.current++ % PRAISE.length]
      stopSpeaking()
      voice(praise)
      playCelebration()
      setFire((f) => f + 1)
      setTimeout(() => setIdx((i) => i + 1), 1500)
      return 'cheer'
    })
  }

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
          <span className="echo-word">{item.word}</span>
          {phase === 'yourturn' && <span className="echo-ring" aria-hidden="true" />}
        </button>

        {phase === 'listen' && (
          <button className="chunky echo-replay" onClick={replay}>
            <SpeakerIcon size={22} /> Hear it
          </button>
        )}
        {phase === 'yourturn' && (
          <button className="chunky echo-said" onClick={cheer}>
            I said it!
          </button>
        )}
      </main>
    </div>
  )
}
