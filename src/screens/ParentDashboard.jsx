import { useMemo, useState } from 'react'
import { useStore, getWorld, STAGES, WORLDS, FOCUS_MAX } from '../store'
import {
  STORYBOOK_VOICES,
  getStorybookVoice,
  setStorybookVoice,
  playStorybookSample,
} from '../lib/audio'
import { masteredCount } from '../lib/mastery'
import { getUsedToday, LIMIT_OPTIONS, BEDTIME_OPTIONS } from '../lib/screentime'
import { PHRASE_LEVELS, PHRASE_READY_AT, distinctWordsHeard, CATEGORIES, wordsInCategory } from '../data/phraseContent'
import './ParentDashboard.css'

const TOTAL_WORDS = WORLDS.reduce((n, w) => n + w.items.length, 0)

// Parent feedback form (Tally / Google Form). Set VITE_FEEDBACK_URL at build time to
// the real form; the link lives in the (gated) Parent area so only grown-ups see it.
// This is how we hear from families beyond our own during the pilot.
const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL || ''

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

        <FocusWords />

        <ScreenTime />

        <StorybookVoicePicker />

        <section className="parent-section">
          <h3 className="parent-h3">A tip for today</h3>
          <p className="parent-tip">
            Sit together and copy the “Say it together” phrases aloud. Hearing <em>you</em> say
            “big brown cow” is the most powerful part — the app just gets the conversation started.
          </p>
        </section>

        {FEEDBACK_URL && (
          <section className="parent-section feedback-section">
            <h3 className="parent-h3">Share your thoughts</h3>
            <p className="voice-hint">
              We’re testing TinyVoice with families like yours. Tell us what your little one
              loved — or what would help. It only takes a minute and it shapes what we build next.
            </p>
            <a
              className="feedback-btn"
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share feedback
            </a>
          </section>
        )}

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

function FocusWords() {
  const child = useStore((s) => s.activeProfile())
  const toggle = useStore((s) => s.toggleFocusWord)
  const clear = useStore((s) => s.clearFocusWords)
  const [cat, setCat] = useState(CATEGORIES[0])
  const words = useMemo(() => wordsInCategory(cat), [cat])
  if (!child) return null
  const focus = child.focusWords || []
  const atCap = focus.length >= FOCUS_MAX

  return (
    <section className="parent-section">
      <h3 className="parent-h3">Focus words this week</h3>
      <p className="voice-hint">
        Pin up to {FOCUS_MAX} words for {child.name} to practise — lovely for therapy homework.
        They lead the Word Board&rsquo;s <b>Find</b> game and Today with Pip.
      </p>

      <div className="focus-current">
        {focus.length ? (
          focus.map((w) => (
            <button
              key={w}
              className="focus-chip is-on"
              onClick={() => toggle(w)}
              aria-label={`Remove ${w}`}
            >
              ★ {w} <span className="focus-x" aria-hidden="true">×</span>
            </button>
          ))
        ) : (
          <span className="voice-hint">None yet — tap words below to pin them.</span>
        )}
        {focus.length > 0 && (
          <button className="focus-clear" onClick={clear}>
            Clear
          </button>
        )}
      </div>

      <div className="focus-cats" role="tablist" aria-label="Word groups">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`focus-cat ${c === cat ? 'is-active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="focus-picker">
        {words.map((w) => {
          const on = focus.includes(w.word)
          return (
            <button
              key={w.word}
              className={`focus-pick ${on ? 'is-on' : ''}`}
              onClick={() => toggle(w.word)}
              disabled={!on && atCap}
              aria-pressed={on}
            >
              {w.word}
            </button>
          )
        })}
      </div>
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
