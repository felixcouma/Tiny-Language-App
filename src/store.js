import { create } from 'zustand'
import { WORLDS, getWorld } from './data/content'

/*
 * Global app state. Kept deliberately small (blueprint's Zustand store shape):
 * a tiny screen router plus the current world / item position.
 */
export const useStore = create((set, get) => ({
  screen: 'home', // 'home' | 'learning'
  worldId: null,
  itemIndex: 0,

  openWorld: (worldId) => set({ screen: 'learning', worldId, itemIndex: 0 }),
  goHome: () => set({ screen: 'home' }),

  next: () => {
    const world = getWorld(get().worldId)
    if (!world) return
    set((s) => ({ itemIndex: (s.itemIndex + 1) % world.items.length }))
  },
  prev: () => {
    const world = getWorld(get().worldId)
    if (!world) return
    set((s) => ({
      itemIndex: (s.itemIndex - 1 + world.items.length) % world.items.length,
    }))
  },

  // Derived helpers
  currentWorld: () => getWorld(get().worldId),
  currentItem: () => {
    const world = getWorld(get().worldId)
    return world ? world.items[get().itemIndex] : null
  },
}))

export { WORLDS }
