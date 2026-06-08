import { create } from 'zustand'
import { WORLDS, getWorld } from './data/content'
import { DEFAULT_PHRASE_LEVEL } from './data/phraseContent'
import { isMuted, setMuted } from './lib/audio'
import { snooze } from './lib/screentime'

/* ---- Profiles + per-child progress (localStorage). Gentle, no scores. ---- */
const PROFILES_KEY = 'tv_profiles_v1'
const ACTIVE_KEY = 'tv_active_profile_v1'
const LEGACY_PROG = 'tv_progress_v1'
const progKey = (id) => `tv_progress_v1__${id}`

export const STAGES = [
  { id: 'first', label: 'First words', hint: 'Ages 1–2 · single words' },
  { id: 'sentences', label: 'Little sentences', hint: 'Ages 3–4 · short phrases' },
]
// Two-letter avatar initials from a "First Last" name (falls back to one letter).
export const initialsOf = (name) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'F'

// A neutral "no-twin" profile so the app can be used without choosing Audrey or
// Adriel. The twins are optional personalization you toggle into.
const GUEST = { id: 'guest', name: 'Everyone', color: '#20B2AA', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1, guest: true }
const TWIN_INITIALS = { audrey: 'AJ', adriel: 'AG' } // Audrey Joster / Adriel Genoh
const DEFAULT_PROFILES = [
  { id: 'audrey', name: 'Audrey', initials: 'AJ', color: '#FF1493', stage: 'first', limit: 0, bedtime: null, phraseLevel: 2 },
  { id: 'adriel', name: 'Adriel', initials: 'AG', color: '#1E90FF', stage: 'first', limit: 0, bedtime: null, phraseLevel: 1 },
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
    profs = [{ ...GUEST }, ...DEFAULT_PROFILES.map((p) => ({ ...p }))]
    changed = true
  }
  if (!profs.some((p) => p.id === 'guest')) {
    profs = [{ ...GUEST }, ...profs] // ensure existing installs gain "Everyone"
    changed = true
  }
  // Ensure the twins have disambiguating two-letter initials, and every profile
  // has a speech-practice level (existing installs predate `phraseLevel`).
  profs = profs.map((p) => {
    let next = p
    if (TWIN_INITIALS[p.id] && p.initials !== TWIN_INITIALS[p.id]) {
      next = { ...next, initials: TWIN_INITIALS[p.id] }
      changed = true
    }
    if (next.phraseLevel == null) {
      next = { ...next, phraseLevel: DEFAULT_PHRASE_LEVEL[p.id] || 1 }
      changed = true
    }
    return next
  })
  if (changed) saveJSON(PROFILES_KEY, profs)
  return profs
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
  firstUse: Date.now(),
  lastUse: Date.now(),
})

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

export const useStore = create((set, get) => ({
  // Land on Home if a child is already chosen; only ask "who's playing?" on first run.
  screen: initialActive ? 'home' : 'profiles',
  worldId: null,
  itemIndex: 0,
  muted: isMuted(),
  autoPlay: false,

  profiles: initialProfiles,
  activeProfileId: initialActive,
  progress: initialActive ? loadProgressFor(initialActive) : emptyProgress(),
  gateFor: null, // grown-up gate purpose: 'parent' | 'more' | null
  onboarded: loadJSON('tv_onboarded', false),
  lastCollected: null, // { item, id } — drives the "new friend!" toast

  // ---- derived ----
  activeProfile: () => get().profiles.find((p) => p.id === get().activeProfileId) || null,
  stage: () => get().activeProfile()?.stage || 'first',
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
  openParent: () => set({ screen: 'parent' }),
  openToday: () => set({ screen: 'today', autoPlay: false }),
  openCollection: () => set({ screen: 'collection' }),
  openRest: () => set({ screen: 'rest', autoPlay: false }),
  openChant: () => set({ screen: 'chant', autoPlay: false }),

  finishOnboarding: () => {
    saveJSON('tv_onboarded', true)
    set({ onboarded: true })
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
      const p = { ...s.progress }
      p.wordsHeard += 1
      p.seen = { ...p.seen, [word]: (p.seen[word] || 0) + 1 }
      p.lastSeen = { ...p.lastSeen, [word]: Date.now() }
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

export { WORLDS, getWorld }
