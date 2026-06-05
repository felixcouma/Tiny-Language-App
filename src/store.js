import { create } from 'zustand'
import { WORLDS, getWorld } from './data/content'
import { isMuted, setMuted } from './lib/audio'

/* ---- Progress (localStorage) — gentle, no scores, just for the parent view ---- */
const PROG_KEY = 'tv_progress_v1'
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROG_KEY) || 'null') || {}
  } catch {
    return {}
  }
}
function saveProgress(p) {
  try {
    localStorage.setItem(PROG_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

const baseProgress = () => ({
  wordsHeard: 0, // total taps that produced speech
  seen: {}, // word -> count
  byWorld: {}, // worldId -> count
  gamesPlayed: 0,
  correct: 0,
  firstUse: Date.now(),
  lastUse: Date.now(),
  ...loadProgress(),
})

export const useStore = create((set, get) => ({
  screen: 'home', // home | learning | game | twin | parent
  worldId: null,
  itemIndex: 0,
  progress: baseProgress(),
  muted: isMuted(),
  autoPlay: false,

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
  openParent: () => set({ screen: 'parent' }),

  next: () => {
    const w = getWorld(get().worldId)
    if (w) set((s) => ({ itemIndex: (s.itemIndex + 1) % w.items.length }))
  },
  prev: () => {
    const w = getWorld(get().worldId)
    if (w) set((s) => ({ itemIndex: (s.itemIndex - 1 + w.items.length) % w.items.length }))
  },

  // ---- derived ----
  currentWorld: () => getWorld(get().worldId),
  currentItem: () => {
    const w = getWorld(get().worldId)
    return w ? w.items[get().itemIndex] : null
  },

  // ---- progress actions ----
  recordHeard: (item, worldId) =>
    set((s) => {
      const p = { ...s.progress }
      p.wordsHeard += 1
      p.seen = { ...p.seen, [item.word]: (p.seen[item.word] || 0) + 1 }
      if (worldId) p.byWorld = { ...p.byWorld, [worldId]: (p.byWorld[worldId] || 0) + 1 }
      p.lastUse = Date.now()
      saveProgress(p)
      return { progress: p }
    }),
  recordGame: (wasCorrect) =>
    set((s) => {
      const p = { ...s.progress }
      p.gamesPlayed += 1
      if (wasCorrect) p.correct += 1
      p.lastUse = Date.now()
      saveProgress(p)
      return { progress: p }
    }),
  resetProgress: () =>
    set(() => {
      const fresh = {
        wordsHeard: 0,
        seen: {},
        byWorld: {},
        gamesPlayed: 0,
        correct: 0,
        firstUse: Date.now(),
        lastUse: Date.now(),
      }
      saveProgress(fresh)
      return { progress: fresh }
    }),
}))

export { WORLDS, getWorld }
