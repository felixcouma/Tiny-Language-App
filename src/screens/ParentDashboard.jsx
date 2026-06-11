import { useState } from 'react'
import { useStore, getWorld, STAGES, WORLDS } from '../store'
import {
  STORYBOOK_VOICES,
  getStorybookVoice,
  setStorybookVoice,
  playStorybookSample,
} from '../lib/audio'
import { masteredCount } from '../lib/mastery'
import { getUsedToday, LIMIT_OPTIONS, BEDTIME_OPTIONS } from '../lib/screentime'
import { PHRASE_LEVELS, PHRASE_READY_AT, distinctWordsHeard } from '../data/phraseContent'
import './ParentDashboard.css'

const TOTAL_WORDS = WORLDS.reduce((n, w) => n + w.items.length, 0)

export default function ParentDashboard() {
  const goHome = useStore((s) => s.goHome)
  const p = useStore((s) => s.progress)
  const resetProgress = useStore((s) => s.resetProgress)

  const uniqueWords = Object.keys(p.seen || {}).length
  const mastered = masteredCount(p)
  const toDiscover = Math.max(0, TOTAL_WORDS - uniqueWords)
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
          <Stat big value={uniqueWords} label="different words" />
          <Stat big value={mastered} label="words mastered" />
          <Stat value={p.wordsHeard || 0} label="words heard" />
          <Stat value={favWorld} label="favourite world" />
          <Stat value={days} label={days === 1 ? 'day of play' : 'days of play'} />
          <Stat value={accuracy == null ? '—' : `${accuracy}%`} label="found first try" />
        </div>
        <p className="parent-next">
          {toDiscover > 0 ? (
            <>
              <b>{toDiscover}</b> new words still to discover together.
            </>
          ) : (
            <>Every word discovered — wonderful! Keep revisiting to master them.</>
          )}
        </p>

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

        <ChildStage />

        <SpeechLevel />

        <ScreenTime />

        <StorybookVoicePicker />

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

function ScreenTime() {
  const child = useStore((s) => s.activeProfile())
  const setLimit = useStore((s) => s.setLimit)
  const setBedtime = useStore((s) => s.setBedtime)
  if (!child) return null
  const limit = child.limit || 0
  const used = getUsedToday(child.id)
  const bedFrom = child.bedtime?.from ?? null
  return (
    <section className="parent-section">
      <h3 className="parent-h3">Daily play time</h3>
      <p className="voice-hint">
        For {child.name} — when it&rsquo;s used up, Pip suggests a rest.{' '}
        {limit > 0 ? `${used} of ${limit} min today.` : 'No limit set.'}
      </p>
      <div className="limit-options">
        {LIMIT_OPTIONS.map((min) => (
          <button
            key={min}
            className={`voice-option ${limit === min ? 'is-active' : ''}`}
            onClick={() => setLimit(min)}
          >
            {min === 0 ? 'Off' : `${min} min`}
          </button>
        ))}
      </div>
      <h3 className="parent-h3" style={{ marginTop: 'var(--space-md)' }}>
        Quiet hours
      </h3>
      <p className="voice-hint">A calm wind-down from bedtime until the morning.</p>
      <div className="limit-options">
        {BEDTIME_OPTIONS.map((o) => (
          <button
            key={o.id}
            className={`voice-option ${bedFrom === o.from ? 'is-active' : ''}`}
            onClick={() => setBedtime(o.from == null ? null : { from: o.from, to: 7 })}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function ChildStage() {
  const child = useStore((s) => s.activeProfile())
  const setStage = useStore((s) => s.setStage)
  const openProfiles = useStore((s) => s.openProfiles)
  if (!child) return null
  return (
    <section className="parent-section">
      <h3 className="parent-h3">Child &amp; level</h3>
      <div className="child-row">
        <span className="child-badge" style={{ background: child.color }}>
          {child.initials || child.name[0]?.toUpperCase()}
        </span>
        <span className="child-name">{child.name}</span>
        <button className="child-switch" onClick={openProfiles}>
          Switch child
        </button>
      </div>
      <div className="voice-options" style={{ marginTop: 'var(--space-sm)' }}>
        {STAGES.map((st) => (
          <button
            key={st.id}
            className={`voice-option ${child.stage === st.id ? 'is-active' : ''}`}
            onClick={() => setStage(st.id)}
          >
            {st.label}
            <span className="stage-hint">{st.hint}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function SpeechLevel() {
  const child = useStore((s) => s.activeProfile())
  const setPhraseLevel = useStore((s) => s.setPhraseLevel)
  const phrases = useStore((s) => s.progress.phrases) || {}
  const wordsHeard = useStore((s) => distinctWordsHeard(s.progress))
  if (!child) return null
  const level = child.phraseLevel || 1
  const phrasesExplored = Object.keys(phrases).length
  // Gentle, parent-confirmed progression: suggest Phrase Builder once they have a
  // working vocabulary. We never switch automatically — the grown-up decides.
  const suggestPhrases = level === 1 && wordsHeard >= PHRASE_READY_AT

  return (
    <section className="parent-section">
      <h3 className="parent-h3">Speech practice level</h3>
      <p className="voice-hint">
        For {child.name} — sets what “{level >= 2 ? 'Phrase Builder' : 'Word Practice'}” on
        the home screen shows. Advance levels when your speech therapist agrees.
      </p>

      {suggestPhrases && (
        <div className="phrase-suggest">
          <p className="phrase-suggest-text">
            {child.name} has heard <b>{wordsHeard}</b> different words — a lovely vocabulary
            base. When your therapist agrees, they may be ready for two-word phrases.
          </p>
          <button className="phrase-suggest-btn" onClick={() => setPhraseLevel(2)}>
            Move to Level 2 · Phrase Builder
          </button>
        </div>
      )}

      <div className="voice-options">
        {PHRASE_LEVELS.map((l) => (
          <button
            key={l.level}
            className={`voice-option ${level === l.level ? 'is-active' : ''}`}
            onClick={() => !l.soon && setPhraseLevel(l.level)}
            disabled={l.soon}
            aria-disabled={l.soon}
          >
            {l.label}
            <span className="stage-hint">{l.hint}</span>
          </button>
        ))}
      </div>

      <p className="voice-hint" style={{ marginTop: 'var(--space-sm)' }}>
        {child.name} has heard {wordsHeard} different words
        {phrasesExplored > 0 && ` · ${phrasesExplored} ${phrasesExplored === 1 ? 'phrase' : 'phrases'} explored`}.
      </p>
    </section>
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

function Stat({ value, label, big }) {
  return (
    <div className={`stat ${big ? 'stat-big' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
