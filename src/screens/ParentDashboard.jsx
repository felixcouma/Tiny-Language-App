import { useEffect, useState } from 'react'
import { useStore, getWorld } from '../store'
import {
  listVoices,
  getVoiceURI,
  setVoice,
  speak,
  STORYBOOK_VOICES,
  getStorybookVoice,
  setStorybookVoice,
  playStorybookSample,
} from '../lib/audio'
import './ParentDashboard.css'

export default function ParentDashboard() {
  const goHome = useStore((s) => s.goHome)
  const p = useStore((s) => s.progress)
  const resetProgress = useStore((s) => s.resetProgress)

  const uniqueWords = Object.keys(p.seen || {}).length
  const favWorldId = Object.entries(p.byWorld || {}).sort((a, b) => b[1] - a[1])[0]?.[0]
  const favWorld = favWorldId ? getWorld(favWorldId)?.name : '—'
  const topWords = Object.entries(p.seen || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w)
  const days = Math.max(1, Math.ceil((Date.now() - (p.firstUse || Date.now())) / 86400000))
  const accuracy = p.gamesPlayed ? Math.round((p.correct / p.gamesPlayed) * 100) : null

  return (
    <div className="parent">
      <header className="parent-header">
        <button className="icon-btn" onClick={goHome} aria-label="Back to home">
          ‹
        </button>
        <h2 className="parent-title">For Grown-Ups</h2>
        <span style={{ minWidth: 44 }} />
      </header>

      <main className="parent-main">
        <p className="parent-intro">
          A gentle window into play — no scores, no pressure. Every word heard is progress.
        </p>

        <div className="stat-grid">
          <Stat big value={p.wordsHeard || 0} label="words heard" />
          <Stat big value={uniqueWords} label="different words" />
          <Stat value={favWorld} label="favourite world" />
          <Stat value={days} label={days === 1 ? 'day of play' : 'days of play'} />
          <Stat value={p.gamesPlayed || 0} label="game taps" />
          <Stat value={accuracy == null ? '—' : `${accuracy}%`} label="found first try" />
        </div>

        {topWords.length > 0 && (
          <section className="parent-section">
            <h3 className="parent-h3">Words they love most</h3>
            <div className="word-chips">
              {topWords.map((w) => (
                <span key={w} className="word-chip">
                  {w}
                </span>
              ))}
            </div>
          </section>
        )}

        <StorybookVoicePicker />

        <VoicePicker />

        <section className="parent-section">
          <h3 className="parent-h3">A tip for today</h3>
          <p className="parent-tip">
            Sit together and copy the “Say it together” phrases aloud. Hearing <em>you</em> say
            “big brown cow” is the most powerful part — the app just gets the conversation started.
          </p>
        </section>

        <button className="reset-btn" onClick={resetProgress}>
          Reset progress
        </button>
      </main>
    </div>
  )
}

function StorybookVoicePicker() {
  const [voice, setV] = useState(getStorybookVoice())

  const choose = (id) => {
    setV(id)
    setStorybookVoice(id)
    playStorybookSample(id)
  }

  return (
    <section className="parent-section">
      <h3 className="parent-h3">Storybook voice</h3>
      <p className="voice-hint">
        The warm voice that reads each word aloud. Tap one to hear it.
      </p>
      <div className="voice-options">
        {STORYBOOK_VOICES.map((v) => (
          <button
            key={v.id}
            className={`voice-option ${voice === v.id ? 'is-active' : ''}`}
            onClick={() => choose(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function VoicePicker() {
  const [voices, setVoices] = useState(listVoices())
  const [uri, setUri] = useState(getVoiceURI())

  useEffect(() => {
    // Voices often load a moment after page start.
    const grab = () => setVoices(listVoices())
    grab()
    const t = setTimeout(grab, 400)
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = grab
    return () => clearTimeout(t)
  }, [])

  const choose = (value) => {
    setUri(value)
    setVoice(value)
    speak('Hi! I am Pip. Let us learn together!')
  }

  return (
    <section className="parent-section">
      <h3 className="parent-h3">Device voice (backup)</h3>
      <p className="voice-hint">
        Used only if a storybook clip hasn’t loaded. Pick the friendliest voice on this device,
        then tap a name to hear it.
      </p>
      {voices.length === 0 ? (
        <p className="voice-hint">No selectable voices on this device — the default will be used.</p>
      ) : (
        <select className="voice-select" value={uri} onChange={(e) => choose(e.target.value)}>
          <option value="">Best automatic</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      )}
      <button className="voice-test" onClick={() => speak('Hello! Can you say cow? Mooooo!')}>
        Hear a sample
      </button>
    </section>
  )
}

function Stat({ value, label, big }) {
  return (
    <div className={`stat ${big ? 'stat-big' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
