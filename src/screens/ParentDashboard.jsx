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
import { signInWithEmail, signOut, deleteCloudData } from '../lib/cloud'
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

        <TrialBanner />

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

        <Children />

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

        <AccountSection />

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

// Children setup: choose one child or two (two unlocks Twin Mode), and rename each
// child. Names start as generic placeholders ("Child 1") on a fresh device.
function Children() {
  const profiles = useStore((s) => s.profiles)
  const childCount = useStore((s) => s.childCount)
  const setChildCount = useStore((s) => s.setChildCount)
  const count = childCount || 1
  const kids = profiles.filter((p) => !p.guest).slice(0, count)

  return (
    <section className="parent-section">
      <h3 className="parent-h3">Children</h3>
      <p className="voice-hint">
        Using TinyVoice with one child or two? Two children unlocks <b>Twin Mode</b>{' '}
        turn-taking. Switching is safe — no progress is ever deleted.
      </p>
      <div className="voice-options">
        {[1, 2].map((n) => (
          <button
            key={n}
            className={`voice-option ${count === n ? 'is-active' : ''}`}
            onClick={() => setChildCount(n)}
          >
            {n === 1 ? 'One child' : 'Two children'}
          </button>
        ))}
      </div>
      <div className="children-list">
        {kids.map((k) => (
          <ChildNameRow key={k.id} child={k} />
        ))}
      </div>
    </section>
  )
}

function ChildNameRow({ child }) {
  const renameProfile = useStore((s) => s.renameProfile)
  const [name, setName] = useState(child.name)
  const save = () => {
    const n = name.trim()
    if (n && n !== child.name) renameProfile(child.id, n)
    else setName(child.name)
  }
  return (
    <div className="child-edit">
      <span className="child-badge" style={{ background: child.color }}>
        {child.initials || child.name[0]?.toUpperCase()}
      </span>
      <input
        className="child-name-input"
        value={name}
        maxLength={12}
        onChange={(e) => setName(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label={`Name for ${child.name}`}
      />
    </div>
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

// Whole days left in the trial (>=0), or null when there's no trial account.
function trialDaysLeft(account) {
  if (!account?.trial_ends_at) return null
  const ms = new Date(account.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

// Soft trial gate: a parent-only banner. Child play is never blocked (pilot).
function TrialBanner() {
  const account = useStore((s) => s.account)
  const session = useStore((s) => s.session)
  if (!session || !account || account.plan === 'active') return null
  const days = trialDaysLeft(account)
  const ended = account.plan !== 'active' && days === 0
  return (
    <div className={`trial-banner ${ended ? 'is-ended' : ''}`}>
      {ended ? (
        <>
          <b>Your free trial has ended.</b> Your child can keep playing — sign-in just
          saves and syncs progress. Subscriptions are coming soon.
        </>
      ) : (
        <>
          <b>{days} {days === 1 ? 'day' : 'days'} left</b> in your free trial. Progress is
          backed up and synced across devices.
        </>
      )}
    </div>
  )
}

// Optional parent account: magic-link sign-in → cloud backup + sync + trial.
// Hidden entirely when Supabase isn't configured (app stays fully local).
function AccountSection() {
  const configured = useStore((s) => s.cloudConfigured)
  const session = useStore((s) => s.session)
  const status = useStore((s) => s.cloudStatus)
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [confirmDelete, setConfirmDelete] = useState(false)
  if (!configured) return null

  const send = async () => {
    const e = email.trim()
    if (!e) return
    setPhase('sending')
    try {
      const { error } = await signInWithEmail(e)
      setPhase(error ? 'error' : 'sent')
    } catch {
      setPhase('error')
    }
  }

  if (session?.user) {
    const synced = status === 'synced' ? 'Synced ✓' : status === 'syncing' ? 'Syncing…' : status === 'error' ? 'Sync error' : ''
    return (
      <section className="parent-section account-section">
        <h3 className="parent-h3">Account</h3>
        <p className="voice-hint">
          Signed in as <b>{session.user.email}</b>. {synced && <span className="sync-state">{synced}</span>}
        </p>
        <div className="account-actions">
          <button className="account-btn" onClick={() => signOut()}>
            Sign out
          </button>
          {confirmDelete ? (
            <button className="account-btn danger" onClick={() => deleteCloudData()}>
              Tap again to permanently delete
            </button>
          ) : (
            <button className="account-btn danger-ghost" onClick={() => setConfirmDelete(true)}>
              Delete my data
            </button>
          )}
        </div>
        <p className="voice-hint" style={{ marginTop: 'var(--space-sm)' }}>
          Deleting removes your synced children and progress from the cloud. Play on this
          device is unaffected.
        </p>
      </section>
    )
  }

  return (
    <section className="parent-section account-section">
      <h3 className="parent-h3">Save &amp; sync progress</h3>
      <p className="voice-hint">
        Optional: sign in to back up your children&rsquo;s progress and use TinyVoice on more
        than one device. We&rsquo;ll email you a one-tap sign-in link — no password.
      </p>
      {phase === 'sent' ? (
        <p className="account-sent">
          ✉️ Check <b>{email.trim()}</b> for your sign-in link, then tap it on this device.
        </p>
      ) : (
        <div className="account-form">
          <input
            className="account-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="account-btn primary" onClick={send} disabled={phase === 'sending'}>
            {phase === 'sending' ? 'Sending…' : 'Email me a link'}
          </button>
        </div>
      )}
      {phase === 'error' && (
        <p className="voice-hint" style={{ color: 'var(--accent-red, #d4534f)' }}>
          Something went wrong sending the link. Check the email and try again.
        </p>
      )}
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
