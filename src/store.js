import { create } from 'zustand'
import { WORLDS, getWorld } from './data/content'
import { DEFAULT_PHRASE_LEVEL } from './data/phraseContent'
import { isMuted, setMuted } from './lib/audio'
import { snooze } from './lib/screentime'
import { cloudConfigured } from './lib/supabase'
import { DEFAULT_SONG_IDS, SONG_IDS } from './data/songs'

/* ---- Profiles + per-child progress (localStorage). Gentle, no scores. ---- */
const PROFILES_KEY = 'tv_profiles_v1'
const ACTIVE_KEY = 'tv_active_profile_v1'
const CHILDCOUNT_KEY = 'tv_child_count_v1' // 1 or 2 — drives setup + Twin Mode; null = ask
const LEGACY_PROG = 'tv_progress_v1'
const progKey = (id) => `tv_progress_v1__${id}`

export const STAGES = [
  { id: 'first', label: 'First words', hint: 'Ages 1–2 · single words' },
  { id: 'sentences', label: 'Little sentences', hint: 'Ages 3–4 · short phrases' },
]
// Most "focus words of the week" a grown-up can pin per child (therapy homework).
export const FOCUS_MAX = 3
// Two-letter avatar initials from a "First Last" name (falls back to one letter).
export const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'F'

// A neutral "no-twin" profile so the app can be used without choosing a child.
const GUEST = { id: 'guest', name: 'Everyone', color: '#20B2AA', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1, guest: true, enabledSongs: [...DEFAULT_SONG_IDS], expectantPause: false }
// Generic, renamable children seeded at first-run setup ("How many children?").
// One child → just child1; two → child1 + child2 (unlocks Twin Mode). Names and
// initials are placeholders a grown-up renames in the Parent area. NOTE: an
// existing install (e.g. the original Audrey/Adriel) keeps its own profiles —
// loadProfiles() only seeds these on a truly fresh device.
const GENERIC_CHILDREN = [
  { id: 'child1', name: 'Child 1', initials: 'C1', color: '#FF1493', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1, focusWords: [], enabledSongs: [...DEFAULT_SONG_IDS], expectantPause: false },
  { id: 'child2', name: 'Child 2', initials: 'C2', color: '#1E90FF', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1, focusWords: [], enabledSongs: [...DEFAULT_SONG_IDS], expectantPause: false },
]

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return v == null ? fallback : v
  } catch {
    return fallback
  }
}
function saveJSON(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

function loadProfiles() {
  let profs = loadJSON(PROFILES_KEY, null)
  let changed = false
  if (!Array.isArray(profs) || !profs.length) {
    // Fresh device: just "Everyone". Children are added at first-run setup so the
    // giveaway version starts generic (no Audrey/Adriel baked in).
    profs = [{ ...GUEST }]
    changed = true
  }
  if (!profs.some((p) => p.id === 'guest')) {
    profs = [{ ...GUEST }, ...profs] // ensure existing installs gain "Everyone"
    changed = true
  }
  // Backfill fields that predate later versions: avatar initials + speech level.
  profs = profs.map((p) => {
    let next = p
    if (!p.guest && !next.initials) {
      next = { ...next, initials: initialsOf(p.name) }
      changed = true
    }
    if (next.phraseLevel == null) {
      next = { ...next, phraseLevel: DEFAULT_PHRASE_LEVEL[p.id] || 1 }
      changed = true
    }
    if (!Array.isArray(next.enabledSongs)) {
      next = { ...next, enabledSongs: [...DEFAULT_SONG_IDS] }
      changed = true
    }
    if (typeof next.expectantPause !== 'boolean') {
      next = { ...next, expectantPause: false }
      changed = true
    }
    return next
  })
  if (changed) saveJSON(PROFILES_KEY, profs)
  return profs
}

// 1 or 2, or null when it still needs to be asked. Existing installs that already
// have children infer their count once (so they skip the setup screen) — this is
// what keeps the original Audrey/Adriel device out of the new onboarding.
function loadChildCount(profs) {
  let cc = loadJSON(CHILDCOUNT_KEY, null)
  if (cc == null) {
    const kids = profs.filter((p) => !p.guest).length
    if (kids > 0) {
      cc = kids >= 2 ? 2 : 1
      saveJSON(CHILDCOUNT_KEY, cc)
    }
  }
  return cc
}

const emptyProgress = () => ({
  wordsHeard: 0,
  seen: {}, // word -> count
  lastSeen: {}, // word -> timestamp (for spaced repetition)
  byWorld: {}, // worldId -> count
  gamesPlayed: 0,
  correct: 0,
  collected: {}, // word -> true (sticker book)
  phrases: {}, // phrase -> count (Level 2 speech practice)
  abcSeen: {}, // letter -> count (ABC Songs; "mastered" = count >= 4)
  daily: { date: '', newWords: 0, phrases: 0, wordsHeard: 0 }, // today's counts (parent-facing line)
  week: { start: '', byWorld: {}, wordsHeard: 0 }, // rolling 7-day counts (weekly parent narrative)
  firstUse: Date.now(),
  lastUse: Date.now(),
})

// A stable per-day key so the daily counters reset on a new day, no timers needed.
export const dayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
// Merge today's parent-facing activity counters (auto-resets when the day rolls over).
function bumpDaily(daily, delta) {
  const key = dayKey()
  const base = daily && daily.date === key ? daily : { date: key, newWords: 0, phrases: 0, wordsHeard: 0 }
  return {
    date: key,
    newWords: (base.newWords || 0) + (delta.newWords || 0),
    phrases: (base.phrases || 0) + (delta.phrases || 0),
    wordsHeard: (base.wordsHeard || 0) + (delta.wordsHeard || 0),
  }
}

// Rolling 7-day activity for the weekly parent narrative. Auto-resets once the window is a
// week old (or the clock moved back). Counts only — no content, no fine timestamps.
const dayKeyToDate = (k) => { const [y, m, d] = String(k).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1) }
function bumpWeek(week, { worldId, wordsHeard = 0 } = {}) {
  const key = dayKey()
  let base = week && week.start ? week : null
  if (base) {
    const elapsed = (dayKeyToDate(key) - dayKeyToDate(base.start)) / 86400000
    if (!(elapsed >= 0 && elapsed < 7)) base = null // window rolled over (or clock moved back)
  }
  base = base || { start: key, byWorld: {}, wordsHeard: 0 }
  const byWorld = { ...(base.byWorld || {}) }
  if (worldId) byWorld[worldId] = (byWorld[worldId] || 0) + 1
  return { start: base.start, byWorld, wordsHeard: (base.wordsHeard || 0) + wordsHeard }
}

// The world a child explored most in the current rolling week → { id, count } | null.
// Exported for the Parent dashboard's weekly narrative.
export function weeklyFavWorld(progress) {
  const bw = progress?.week?.byWorld || {}
  const top = Object.entries(bw).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] > 0 ? { id: top[0], count: top[1] } : null
}

function loadProgressFor(id) {
  let p = loadJSON(progKey(id), null)
  if (!p) {
    // One-time migration: fold the old single-profile progress into the first child.
    const legacy = loadJSON(LEGACY_PROG, null)
    if (legacy && loadProfiles()[0]?.id === id) {
      p = { ...emptyProgress(), ...legacy }
      saveJSON(progKey(id), p)
    } else {
      p = emptyProgress()
    }
  }
  return { ...emptyProgress(), ...p }
}

const COLORS = ['#FF8C00', '#32CD32', '#9D4EDD', '#20B2AA', '#FF6B6B', '#1E90FF', '#FF1493']
const slugId = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `kid-${Date.now()}`

const initialProfiles = loadProfiles()
const initialActive = loadJSON(ACTIVE_KEY, null)
const initialChildCount = loadChildCount(initialProfiles)

// Remember the current screen across a page REFRESH (per-tab, sessionStorage) so a reload
// stays on the page you were on instead of jumping Home. A fresh visit (new tab / reopened
// browser) still starts at Home. Gated/transient screens are never restored (re-gate on
// reload); a restored Learning screen needs its world to still exist.
const NAV_KEY = 'tv_nav_v1'
const NO_RESTORE = new Set(['setup', 'profiles', 'parent', 'rest'])
const loadNav = () => {
  try { return JSON.parse(sessionStorage.getItem(NAV_KEY)) } catch { return null }
}
const restoredNav = (() => {
  if (initialChildCount == null || !initialActive) return null // setup / "who's playing?" flow wins
  const n = loadNav()
  if (!n || !n.screen || NO_RESTORE.has(n.screen)) return null
  if (n.screen === 'learning' && !getWorld(n.worldId)) return null // world must still exist
  return n
})()

export const useStore = create((set, get) => ({
  // First run on a fresh device asks "how many children?" (setup). Otherwise land
  // on Home if a child is chosen, else the "who's playing?" picker.
  screen: restoredNav
    ? restoredNav.screen
    : initialChildCount == null ? 'setup' : initialActive ? 'home' : 'profiles',
  childCount: initialChildCount, // 1 | 2 | null(not yet chosen)
  worldId: restoredNav?.worldId ?? null,
  itemIndex: restoredNav?.itemIndex ?? 0,
  muted: isMuted(),
  autoPlay: false,

  profiles: initialProfiles,
  activeProfileId: initialActive,
  progress: initialActive ? loadProgressFor(initialActive) : emptyProgress(),

  // ---- cloud (Part B) — optional parent account + sync ----
  cloudConfigured, // env present → show the Account section in the Parent area
  session: null, // Supabase auth session (null = signed out / local-only)
  account: null, // accounts row: { trial_ends_at, plan, ... }
  cloudStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
  authError: null, // a returned magic-link error code (e.g. 'otp_expired'), else null

  gateFor: null, // grown-up gate purpose: 'parent' | 'more' | null
  seenIntro: loadJSON('tv_seen_intro', false), // parent value-prop shown once (pre-setup)
  onboarded: loadJSON('tv_onboarded', false),
  lastCollected: null, // { item, id } — drives the "new friend!" toast

  // ---- derived ----
  activeProfile: () => get().profiles.find((p) => p.id === get().activeProfileId) || null,
  stage: () => get().activeProfile()?.stage || 'first',
  // Read ANY child's saved progress (localStorage) — used by the parent-area twin
  // insight to compare siblings without switching the active profile.
  progressFor: (id) => (id === get().activeProfileId ? get().progress : loadProgressFor(id)),
  currentWorld: () => getWorld(get().worldId),
  currentItem: () => {
    const w = getWorld(get().worldId)
    return w ? w.items[get().itemIndex] : null
  },

  // ---- profiles ----
  openProfiles: () => set({ screen: 'profiles', autoPlay: false }),
  setActiveProfile: (id) => {
    saveJSON(ACTIVE_KEY, id)
    set({ activeProfileId: id, progress: loadProgressFor(id), screen: 'home' })
  },
  // First-run setup ("How many children?") and the Parent-area One/Two toggle.
  // Seeds generic children up to `count` (non-destructive — never deletes data),
  // then routes: single → play now, twin → "who's playing?". A later toggle from
  // the Parent area just records the count + seeds a 2nd child if missing.
  setChildCount: (n) =>
    set((s) => {
      const count = n >= 2 ? 2 : 1
      const profiles = [...s.profiles]
      for (let i = profiles.filter((p) => !p.guest).length; i < count; i++) {
        const seed = GENERIC_CHILDREN[i]
        if (seed && !profiles.some((p) => p.id === seed.id)) profiles.push({ ...seed })
      }
      saveJSON(PROFILES_KEY, profiles)
      saveJSON(CHILDCOUNT_KEY, count)
      const kids = profiles.filter((p) => !p.guest)
      if (!s.activeProfileId) {
        if (count === 1 && kids[0]) {
          saveJSON(ACTIVE_KEY, kids[0].id)
          return {
            childCount: count,
            profiles,
            activeProfileId: kids[0].id,
            progress: loadProgressFor(kids[0].id),
            screen: 'home',
          }
        }
        return { childCount: count, profiles, screen: 'profiles' }
      }
      return { childCount: count, profiles }
    }),
  renameProfile: (id, name) =>
    set((s) => {
      const nm = (name || '').trim()
      if (!nm) return {}
      const profiles = s.profiles.map((p) =>
        p.id === id ? { ...p, name: nm, initials: initialsOf(nm) } : p,
      )
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),

  // ---- cloud actions (set by lib/cloud.js via the auth listener) ----
  setSession: (session) => set({ session }),
  setAccount: (account) => set({ account }),
  setCloudStatus: (cloudStatus) => set({ cloudStatus }),
  setAuthError: (authError) => set({ authError }),
  // Adopt a cloud snapshot locally (on a fresh sign-in when the cloud has data):
  // write profiles + each child's progress to localStorage, then refresh state.
  // Non-destructive to the local "Everyone" guest profile (re-added if missing).
  applyCloudState: ({ profiles, progressByChild }) =>
    set((s) => {
      if (!Array.isArray(profiles) || !profiles.length) return {}
      const withGuest = profiles.some((p) => p.id === 'guest')
        ? profiles
        : [{ ...GUEST }, ...profiles]
      saveJSON(PROFILES_KEY, withGuest)
      const kids = withGuest.filter((p) => !p.guest)
      const count = kids.length >= 2 ? 2 : 1
      saveJSON(CHILDCOUNT_KEY, count)
      Object.entries(progressByChild || {}).forEach(([cid, data]) => {
        saveJSON(progKey(cid), { ...emptyProgress(), ...data })
      })
      const activeId =
        s.activeProfileId && withGuest.some((p) => p.id === s.activeProfileId)
          ? s.activeProfileId
          : kids[0]?.id || 'guest'
      saveJSON(ACTIVE_KEY, activeId)
      return {
        profiles: withGuest,
        childCount: count,
        activeProfileId: activeId,
        progress: loadProgressFor(activeId),
      }
    }),
  addProfile: (name) => {
    const profs = get().profiles
    const prof = {
      id: slugId(name) + (profs.some((p) => p.id === slugId(name)) ? `-${profs.length}` : ''),
      name: name.trim() || 'Friend',
      initials: initialsOf(name),
      color: COLORS[profs.length % COLORS.length],
      stage: 'first',
      limit: 0,
      bedtime: null,
      phraseLevel: 1,
      focusWords: [],
      enabledSongs: [...DEFAULT_SONG_IDS],
      expectantPause: false,
    }
    const next = [...profs, prof]
    saveJSON(PROFILES_KEY, next)
    set({ profiles: next })
    return prof.id
  },
  removeProfile: (id) =>
    set((s) => {
      const next = s.profiles.filter((p) => p.id !== id)
      saveJSON(PROFILES_KEY, next)
      try {
        localStorage.removeItem(progKey(id))
      } catch {
        /* ignore */
      }
      const activeId = s.activeProfileId === id ? null : s.activeProfileId
      if (activeId !== s.activeProfileId) saveJSON(ACTIVE_KEY, activeId)
      return { profiles: next, activeProfileId: activeId }
    }),
  setStage: (stage) =>
    set((s) => {
      const profiles = s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, stage } : p))
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),
  setLimit: (limit) =>
    set((s) => {
      const profiles = s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, limit } : p))
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),
  setBedtime: (bedtime) =>
    set((s) => {
      const profiles = s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, bedtime } : p))
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),
  setPhraseLevel: (phraseLevel) =>
    set((s) => {
      const profiles = s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, phraseLevel } : p
      )
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),
  // Therapy responsiveness: pause a few seconds before the Learning screen speaks,
  // so the child has a "communicative opportunity" to name the picture first.
  setExpectantPause: (on) =>
    set((s) => {
      const profiles = s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, expectantPause: !!on } : p
      )
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),

  // ---- Focus words of the week (caregiver/SLP-set practice targets) ----
  // Up to FOCUS_MAX words a grown-up pins for this child; the app surfaces them
  // first in the Word Board's Find game and in Today with Pip. Per-child, no scores.
  focusWords: () => get().activeProfile()?.focusWords || [],
  toggleFocusWord: (word) =>
    set((s) => {
      if (!word) return {}
      const profiles = s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p
        const cur = p.focusWords || []
        const next = cur.includes(word)
          ? cur.filter((w) => w !== word)
          : cur.length >= FOCUS_MAX
            ? cur // already at the cap — ignore (UI also disables it)
            : [...cur, word]
        return { ...p, focusWords: next }
      })
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),
  clearFocusWords: () =>
    set((s) => {
      const profiles = s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, focusWords: [] } : p
      )
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),

  // ---- Songs a grown-up has switched on for this child (per-profile) ----
  enabledSongs: () => get().activeProfile()?.enabledSongs || [],
  toggleSong: (id) =>
    set((s) => {
      if (!id || !SONG_IDS.includes(id)) return {}
      const profiles = s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p
        const cur = p.enabledSongs || []
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
        return { ...p, enabledSongs: next }
      })
      saveJSON(PROFILES_KEY, profiles)
      return { profiles }
    }),

  toggleMute: () =>
    set((s) => {
      const m = !s.muted
      setMuted(m)
      return { muted: m }
    }),
  setAutoPlay: (v) => set({ autoPlay: !!v }),
  toggleAutoPlay: () => set((s) => ({ autoPlay: !s.autoPlay })),

  // ---- navigation ----
  goHome: () => set({ screen: 'home', autoPlay: false }),
  openWorld: (worldId) => set({ screen: 'learning', worldId, itemIndex: 0, autoPlay: false }),
  openGame: () => set({ screen: 'game' }),
  openTwin: () => set({ screen: 'twin' }),
  openPhonics: () => set({ screen: 'phonics' }),
  openPhrase: () => set({ screen: 'phrase', autoPlay: false }),
  openGrid: () => set({ screen: 'grid', autoPlay: false }),
  openAbc: () => set({ screen: 'abc', autoPlay: false }),
  openEcho: () => set({ screen: 'echo', autoPlay: false }),
  openParent: () => set({ screen: 'parent' }),
  openToday: () => set({ screen: 'today', autoPlay: false }),
  openCollection: () => set({ screen: 'collection' }),
  openRest: () => set({ screen: 'rest', autoPlay: false }),
  openChant: () => set({ screen: 'chant', autoPlay: false }),
  openSongs: () => set({ screen: 'songs', autoPlay: false }),
  openRoutines: () => set({ screen: 'routines', autoPlay: false }),

  finishOnboarding: () => {
    saveJSON('tv_onboarded', true)
    set({ onboarded: true })
  },
  finishIntro: () => {
    saveJSON('tv_seen_intro', true)
    set({ seenIntro: true })
  },

  // ---- grown-up gate ----
  requestGate: (purpose) => set({ gateFor: purpose }),
  closeGate: () => set({ gateFor: null }),
  passGate: () =>
    set((s) => {
      if (s.gateFor === 'parent') return { gateFor: null, screen: 'parent' }
      if (s.gateFor === 'more') {
        snooze(10)
        return { gateFor: null, screen: 'home' }
      }
      return { gateFor: null }
    }),

  // Jump straight to a specific item (used to LEAD Auto Play with a focus word).
  setItemIndex: (i) => {
    const w = getWorld(get().worldId)
    if (w && i >= 0 && i < w.items.length) set({ itemIndex: i })
  },
  next: () => {
    const w = getWorld(get().worldId)
    if (w) set((s) => ({ itemIndex: (s.itemIndex + 1) % w.items.length }))
  },
  prev: () => {
    const w = getWorld(get().worldId)
    if (w) set((s) => ({ itemIndex: (s.itemIndex - 1 + w.items.length) % w.items.length }))
  },

  // ---- progress actions (write to the active profile) ----
  recordHeard: (item, worldId) =>
    set((s) => {
      if (!s.activeProfileId) return {}
      const isNew = !s.progress.collected?.[item.word]
      const p = { ...s.progress }
      p.wordsHeard += 1
      p.seen = { ...p.seen, [item.word]: (p.seen[item.word] || 0) + 1 }
      p.lastSeen = { ...p.lastSeen, [item.word]: Date.now() }
      p.collected = { ...p.collected, [item.word]: true }
      if (worldId) p.byWorld = { ...p.byWorld, [worldId]: (p.byWorld[worldId] || 0) + 1 }
      p.daily = bumpDaily(p.daily, { wordsHeard: 1, newWords: isNew ? 1 : 0 })
      p.week = bumpWeek(p.week, { worldId, wordsHeard: 1 })
      p.lastUse = Date.now()
      saveJSON(progKey(s.activeProfileId), p)
      return {
        progress: p,
        ...(isNew ? { lastCollected: { item, id: (s.lastCollected?.id || 0) + 1 } } : {}),
      }
    }),
  recordGame: (wasCorrect) =>
    set((s) => {
      if (!s.activeProfileId) return {}
      const p = { ...s.progress }
      p.gamesPlayed += 1
      if (wasCorrect) p.correct += 1
      p.lastUse = Date.now()
      saveJSON(progKey(s.activeProfileId), p)
      return { progress: p }
    }),
  // Speech practice: a single word was tapped & heard. Counts toward "words heard"
  // / mastery without the sticker-book collection toast (therapy words have no card).
  recordPracticeWord: (word) =>
    set((s) => {
      if (!s.activeProfileId || !word) return {}
      const isNew = !s.progress.seen?.[word]
      const p = { ...s.progress }
      p.wordsHeard += 1
      p.seen = { ...p.seen, [word]: (p.seen[word] || 0) + 1 }
      p.lastSeen = { ...p.lastSeen, [word]: Date.now() }
      p.daily = bumpDaily(p.daily, { wordsHeard: 1, newWords: isNew ? 1 : 0 })
      p.week = bumpWeek(p.week, { wordsHeard: 1 })
      p.lastUse = Date.now()
      saveJSON(progKey(s.activeProfileId), p)
      return { progress: p }
    }),
  // ABC Songs: a letter song was heard (counts toward "mastered" at 4+).
  recordABCLetter: (letter) =>
    set((s) => {
      if (!s.activeProfileId || !letter) return {}
      const p = { ...s.progress }
      p.abcSeen = { ...p.abcSeen, [letter]: (p.abcSeen?.[letter] || 0) + 1 }
      p.lastUse = Date.now()
      saveJSON(progKey(s.activeProfileId), p)
      return { progress: p }
    }),
  // Speech practice: a 2-word phrase was heard together.
  recordPhrase: (phrase) =>
    set((s) => {
      if (!s.activeProfileId || !phrase) return {}
      const p = { ...s.progress }
      p.phrases = { ...p.phrases, [phrase]: (p.phrases[phrase] || 0) + 1 }
      p.daily = bumpDaily(p.daily, { phrases: 1 })
      p.lastUse = Date.now()
      saveJSON(progKey(s.activeProfileId), p)
      return { progress: p }
    }),
  resetProgress: () =>
    set((s) => {
      const fresh = emptyProgress()
      if (s.activeProfileId) saveJSON(progKey(s.activeProfileId), fresh)
      return { progress: fresh }
    }),
}))

// Persist the current screen (+ Learning context) per-tab whenever it changes, so a page
// refresh restores it (see restoredNav above). Only writes when the nav actually changes.
if (typeof window !== 'undefined') {
  let lastNav = ''
  useStore.subscribe((s) => {
    const nav = `${s.screen}|${s.worldId}|${s.itemIndex}`
    if (nav === lastNav) return
    lastNav = nav
    try {
      sessionStorage.setItem(NAV_KEY, JSON.stringify({ screen: s.screen, worldId: s.worldId, itemIndex: s.itemIndex }))
    } catch { /* private mode / storage full — refresh just falls back to Home */ }
  })
}

export { WORLDS, getWorld }
