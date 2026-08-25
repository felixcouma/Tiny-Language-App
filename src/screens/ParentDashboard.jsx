import { useMemo, useState } from 'react'
import { useStore, getWorld, weeklyFavWorld, STAGES, WORLDS, FOCUS_MAX } from '../store'
import {
  STORYBOOK_VOICES,
  getStorybookVoice,
  setStorybookVoice,
  playStorybookSample,
} from '../lib/audio'
import { masteredCount } from '../lib/mastery'
import Mascot from '../components/Mascot'
import { getUsedToday, LIMIT_OPTIONS, BEDTIME_OPTIONS } from '../lib/screentime'
import { PHRASE_LEVELS, PHRASE_READY_AT, distinctWordsHeard, CATEGORIES, wordsInCategory } from '../data/phraseContent'
import { signInWithEmail, signOut, deleteCloudData } from '../lib/cloud'
import { SONGS } from '../data/songs'
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
        <span style={{ flex: 1 }} />
      </header>

      <main className="parent-main">
        {/* Warm hero — Pip, greeting, and a live "Pip says" line tying the grown-up
            back into the same TinyVoice world the children play in. */}
        <div className="gu-hero">
          <Mascot size={64} />
          <div>
            <h1 className="gu-title">Grown-Ups</h1>
            <p className="gu-sub">See what they’re exploring. Help choose what comes next.</p>
          </div>
        </div>
        <PipSays />

        <WeekWithPip />

        <ActiveChild />

        <TrialBanner />

        <TwinNudge />

        <div className="stat-grid">
          <Stat value={uniqueWords} label="different words" tone="peach" />
          <Stat value={mastered} label="words mastered" tone="mint" />
          <Stat value={p.wordsHeard || 0} label="words heard" tone="sky" />
          <Stat value={favWorld} label="favourite world" tone="lav" />
          <Stat value={days} label={days === 1 ? 'day of play' : 'days of play'} tone="coral" />
          <Stat value={accuracy == null ? '—' : `${accuracy}%`} label="found first try" tone="tealtint" />
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

        <TipForToday />

        {/* Everyday controls — open by default. */}
        <Panel title="Learning Level" defaultOpen accent="var(--gu-purple)" tint="#f7f1ff">
          <LearningLevel />
        </Panel>
        <Panel title="Wait Time" defaultOpen accent="var(--gu-purple)" tint="#f7f1ff">
          <ExpectantPause />
        </Panel>
        <Panel title="Children Setup" defaultOpen accent="var(--gu-teal)" tint="#eef8f7">
          <Children />
        </Panel>
        <Panel title="Daily Play Time" defaultOpen accent="var(--gu-tangerine)" tint="#fff5ea">
          <ScreenTime />
        </Panel>

        {/* Longer / rarer settings — collapsed to a single row each. */}
        <hr className="panels-divider" />
        <p className="panels-divider-label">More settings</p>
        <Panel title="Focus Words This Week" accent="var(--gu-blue)" tint="#f2f8ff">
          <FocusWords />
        </Panel>
        <Panel title="Songs" accent="var(--gu-magenta)" tint="#fff0f7">
          <Songs />
        </Panel>
        <Panel title="Storybook Voice" accent="var(--gu-purple)" tint="#f7f1ff">
          <StorybookVoicePicker />
        </Panel>
        <AccountPanel />

        {/* Feedback stays a single-tap link, always visible (pilot). */}
        {FEEDBACK_URL && (
          <a
            className="feedback-btn feedback-btn-standalone"
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share your thoughts
          </a>
        )}

        <hr className="reset-sep" />
        <button className="reset-btn" onClick={resetProgress}>
          Reset progress
        </button>
      </main>
    </div>
  )
}

// Collapsible settings card. Everyday controls pass defaultOpen; longer/rarer groups
// stay collapsed to a single tappable row so the dashboard opens short. The body is
// only rendered when open (keeps the DOM — and the scroll — light). Each panel wears
// its section colour via accent (heading + left bar) over a soft tint background.
function Panel({ title, defaultOpen = false, accent, tint, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section
      className={`parent-panel ${open ? 'is-open' : ''}`}
      style={{ '--accent': accent, '--tint': tint }}
    >
      <button
        className="parent-panel-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="parent-panel-title">{title}</span>
        <svg
          className="parent-panel-chev"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="parent-panel-body">{children}</div>}
    </section>
  )
}

// Live "Pip says" line — connects the grown-up to the child's world with real data.
// A Tip for Today — resolves to ONE specific word + a warm micro-action, tied to real
// signals: the child's focus words first (parent-pinned therapy targets), else a word from
// the world they loved most this week. Rotates once per day. Falls back to the general
// modelling tip when there's no signal yet. Reinforces the "say it, then wait" strategy the
// whole app is built around (never a demand, never a score).
function TipForToday() {
  const child = useStore((s) => s.activeProfile())
  const progress = useStore((s) => s.progress)
  if (!child) return null
  const name = child.name
  const focus = (child.focusWords || []).filter(Boolean)
  const day = Math.floor(Date.now() / 86400000) // rotates daily, stable within the day

  let word = null
  if (focus.length) {
    word = focus[day % focus.length]
  } else {
    const fav = weeklyFavWorld(progress)
    const w = fav && getWorld(fav.id)
    const pool = (w?.items || []).map((i) => i.word).filter(Boolean)
    if (pool.length) word = pool[day % pool.length]
  }

  return (
    <div className="gu-tip">
      <p className="gu-tip-h">A Tip for Today</p>
      {word ? (
        <p className="gu-tip-p">
          Catch a real moment for <b>“{word}”</b> with {name} today — say it slowly, then{' '}
          <b>pause</b> and let them have a turn. Hearing <em>you</em> say it is the most powerful part.
        </p>
      ) : (
        <p className="gu-tip-p">
          Sit together and copy the “Say it together” phrases aloud. Hearing <em>you</em> say
          “big brown cow” is the most powerful part — the app just gets the conversation started.
        </p>
      )}
    </div>
  )
}

function PipSays() {
  const p = useStore((s) => s.progress)
  const child = useStore((s) => s.activeProfile())
  const childCount = useStore((s) => s.childCount)
  const profiles = useStore((s) => s.profiles)
  const progressFor = useStore((s) => s.progressFor)
  if (!child) return null

  let names, heard, verb
  if (childCount === 2) {
    const kids = profiles.filter((k) => !k.guest).slice(0, 2)
    names = kids.map((k) => k.name).join(' & ')
    heard = kids.reduce((n, k) => n + (progressFor(k.id)?.wordsHeard || 0), 0)
    verb = 'have'
  } else {
    names = child.name
    heard = p.wordsHeard || 0
    verb = 'has'
  }

  return (
    <p className="gu-pipsay">
      {heard > 0 ? (
        <>
          Pip says: <b>{names} {verb} heard {heard} {heard === 1 ? 'word' : 'words'}</b> so far!
        </>
      ) : (
        <>Pip says: pick a world together and let’s hear those first words!</>
      )}
    </p>
  )
}

// Weekly narrative (Phase 2 D): a warm plain-language line on what each child loved most
// this rolling week (from the local `week.byWorld` signal — counts only, never synced as a
// separate field; rides the existing progress sync). One line per child.
function WeekWithPip() {
  const child = useStore((s) => s.activeProfile())
  const childCount = useStore((s) => s.childCount)
  const profiles = useStore((s) => s.profiles)
  const progress = useStore((s) => s.progress)
  const progressFor = useStore((s) => s.progressFor)
  if (!child) return null

  const lineFor = (name, pr) => {
    const fav = weeklyFavWorld(pr)
    const world = fav && getWorld(fav.id)?.name
    return world ? { name, world } : null
  }
  const rows =
    childCount === 2
      ? profiles.filter((k) => !k.guest).slice(0, 2).map((k) => lineFor(k.name, progressFor(k.id) || {})).filter(Boolean)
      : [lineFor(child.name, progress)].filter(Boolean)

  return (
    <div className="gu-week">
      <div className="gu-week-title">This week with Pip</div>
      {rows.length ? (
        <ul className="gu-week-list">
          {rows.map((r, i) => (
            <li key={i}>
              <b>{r.name}</b> loved <b>{r.world}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="gu-week-empty">Play together this week and Pip will share what they loved most.</p>
      )}
    </div>
  )
}

// Which child these settings apply to — always shown so the grown-up has context
// (many hints below read "For {child.name}"). Switch child opens the profile picker.
function ActiveChild() {
  const child = useStore((s) => s.activeProfile())
  const openProfiles = useStore((s) => s.openProfiles)
  if (!child) return null
  return (
    <div className="active-child">
      <span className="child-badge" style={{ background: child.color }}>
        {child.initials || child.name[0]?.toUpperCase()}
      </span>
      <span className="child-name">{child.name}</span>
      <button className="child-switch" onClick={openProfiles}>
        Switch child
      </button>
    </div>
  )
}

// "Learning level" panel body = play stage + speech-practice level (two related dials).
function LearningLevel() {
  return (
    <>
      <StagePicker />
      <SpeechLevel />
    </>
  )
}

// Account is only meaningful when cloud sync is configured; hide the whole panel
// otherwise so local-only installs don't show an empty row.
function AccountPanel() {
  const configured = useStore((s) => s.cloudConfigured)
  if (!configured) return null
  return (
    <Panel title="Account" accent="var(--gu-teal)" tint="#eef8f7">
      <AccountSection />
    </Panel>
  )
}

// Twin insight (only with two children): a single, gentle, cooperative nudge derived
// from each child's saved progress — no scores, no ranking. It answers the anxious
// asymmetric-twin case (one late talker) that no competitor addresses: when one child
// has been exploring more this week, suggest a shared turn or a world the other hasn't
// visited yet. Reads BOTH children without switching the active profile.
function TwinNudge() {
  const childCount = useStore((s) => s.childCount)
  const profiles = useStore((s) => s.profiles)
  const progressFor = useStore((s) => s.progressFor)
  if (childCount !== 2) return null
  const kids = profiles.filter((p) => !p.guest).slice(0, 2)
  if (kids.length < 2) return null

  const WEEK = 7 * 86400000
  const now = Date.now()
  const stat = (id) => {
    const pr = progressFor(id) || {}
    const recent = Object.values(pr.lastSeen || {}).filter((t) => now - t < WEEK).length
    const worlds = new Set(Object.keys(pr.byWorld || {}).filter((w) => (pr.byWorld[w] || 0) > 0))
    return { recent, worlds }
  }
  const A = { ...kids[0], ...stat(kids[0].id) }
  const B = { ...kids[1], ...stat(kids[1].id) }
  const [lead, lag] = A.recent >= B.recent ? [A, B] : [B, A]
  const gapWorld = [...lead.worlds].find((w) => !lag.worlds.has(w))
  // Only surface when there's a real, gentle divergence worth a nudge.
  const enough = lead.recent >= 3
  const activityGap = lead.recent - lag.recent >= 4
  if (!enough || (!gapWorld && !activityGap)) return null
  const worldName = gapWorld ? getWorld(gapWorld)?.name || 'a new world' : null

  return (
    <div className="twin-nudge">
      <p className="twin-nudge-text">
        {worldName ? (
          <>
            <b>{lead.name}</b> explored <b>{worldName}</b> this week. <b>{lag.name}</b> hasn&rsquo;t
            been there yet — try it together next time.
          </>
        ) : (
          <>
            <b>{lead.name}</b> has been exploring a lot this week. Invite <b>{lag.name}</b> to a
            shared turn today — playing side by side keeps both talking.
          </>
        )}
      </p>
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
    <>
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
    </>
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
    <>
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
    </>
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

// Play stage picker — top half of the "Learning level" panel.
function StagePicker() {
  const child = useStore((s) => s.activeProfile())
  const setStage = useStore((s) => s.setStage)
  if (!child) return null
  return (
    <>
      <p className="voice-hint">How much language each screen shows for {child.name}.</p>
      <div className="voice-options">
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
    </>
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
    <>
      <h3 className="parent-h3" style={{ marginTop: 'var(--space-md)' }}>
        Speech practice level
      </h3>
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
    </>
  )
}

// Therapy responsiveness (Dunst & Trivette): optionally hold a beat before the
// Learning screen speaks, giving the child a chance to name the picture first.
function ExpectantPause() {
  const child = useStore((s) => s.activeProfile())
  const setExpectantPause = useStore((s) => s.setExpectantPause)
  if (!child) return null
  const on = !!child.expectantPause
  return (
    <>
      <p className="voice-hint">
        For {child.name} — when on, a picture appears quietly for a few seconds before Pip
        says the word, so they get a chance to try saying it first. Tapping the picture still
        speaks it right away. Leave off for the usual instant sound.
      </p>
      <p className="voice-why">
        Why: speech therapists call this <b>“wait time”</b> — the little silence is the
        invitation to talk. Try it during a calm moment together.
      </p>
      <div className="voice-options">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            className={`voice-option ${on === v ? 'is-active' : ''}`}
            onClick={() => setExpectantPause(v)}
          >
            {v ? 'On · pause first' : 'Off · speak right away'}
          </button>
        ))}
      </div>
    </>
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
    <>
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

      {focus.length > 0 && (
        <div className="home-tip">
          <h4 className="home-tip-h">Say it at home</h4>
          <p className="home-tip-p">
            This week you&rsquo;re practising <b>{focus.join(', ')}</b>. In the moment each one
            happens, say it slowly and clearly, then <b>pause</b> and give {child.name} a chance to
            try. A few times a day beats one long sitting — and Auto Play will lead with these.
          </p>
        </div>
      )}

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
    </>
  )
}

// Per-child song selection. All 13 public-domain songs are banked; the grown-up
// switches on the ones this child likes. They appear in "Sing with Pip" on Home.
function Songs() {
  const child = useStore((s) => s.activeProfile())
  const toggleSong = useStore((s) => s.toggleSong)
  if (!child) return null
  const on = child.enabledSongs || []
  return (
    <>
      <p className="voice-hint">
        Choose which songs {child.name} sees in <b>Sing with Pip</b>. Public-domain
        children&rsquo;s songs (U.S. Dept. of State, American English). {on.length} on.
      </p>
      <div className="song-toggles">
        {SONGS.map((s) => {
          const isOn = on.includes(s.id)
          return (
            <button
              key={s.id}
              className={`song-toggle ${isOn ? 'is-on' : ''}`}
              onClick={() => toggleSong(s.id)}
              aria-pressed={isOn}
            >
              <span className="song-toggle-dot" aria-hidden="true" />
              <span className="song-toggle-name">{s.title}</span>
            </button>
          )
        })}
      </div>
    </>
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
    <>
      <p className="voice-hint">
        The warm voice that reads each word aloud. Tap one to hear it.
      </p>
      <p className="voice-why">
        Why: all three are warm, human-recorded voices — never a robotic text-to-speech. Natural
        prosody is what helps little ones tune in. Pick whichever your child settles on.
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
    </>
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
// Friendly text for the magic-link error codes Supabase can redirect back with.
const AUTH_ERR_MSG = {
  otp_expired:
    'Your sign-in link had expired — links last about an hour and can be used once. Enter your email below for a fresh one.',
  access_denied:
    'That sign-in link is no longer valid. Enter your email below for a fresh one.',
}

function AccountSection() {
  const configured = useStore((s) => s.cloudConfigured)
  const session = useStore((s) => s.session)
  const status = useStore((s) => s.cloudStatus)
  const authError = useStore((s) => s.authError)
  const setAuthError = useStore((s) => s.setAuthError)
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
      if (!error) setAuthError(null)
      setPhase(error ? 'error' : 'sent')
    } catch {
      setPhase('error')
    }
  }

  if (session?.user) {
    const synced = status === 'synced' ? 'Synced ✓' : status === 'syncing' ? 'Syncing…' : status === 'error' ? 'Sync error' : ''
    return (
      <div className="account-section">
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
      </div>
    )
  }

  return (
    <div className="account-section">
      <h3 className="parent-h3">Save &amp; sync progress</h3>
      <p className="voice-hint">
        Optional: sign in to back up your children&rsquo;s progress and use TinyVoice on more
        than one device. We&rsquo;ll email you a one-tap sign-in link — no password.
      </p>
      {authError && phase !== 'sent' && (
        <p className="account-note">{AUTH_ERR_MSG[authError] || AUTH_ERR_MSG.access_denied}</p>
      )}
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
    </div>
  )
}

function Stat({ value, label, tone }) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
