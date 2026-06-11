/*
 * Build an adaptive daily session from a child's progress — the heart of the
 * "Today with Pip" path. Mixes NEW words with SPACED-REPETITION review words,
 * sized by the child's stage. Pure + deterministic given inputs (except shuffle).
 */
import { WORLDS } from '../data/content'
// Mastery lives in one place (src/lib/mastery.js). Re-exported here so the existing
// `../lib/today` importers (Parent Dashboard, ABC Songs) keep working unchanged.
import { MASTERED_AT, isMastered } from './mastery'
export { MASTERED_AT, isMastered }

const allItems = () => WORLDS.flatMap((w) => w.items.map((it) => ({ ...it, worldId: w.id })))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildTodaySession(progress = {}, stage = 'first') {
  const seen = progress.seen || {}
  const lastSeen = progress.lastSeen || {}
  const items = allItems()

  const fresh = shuffle(items.filter((it) => !seen[it.word]))
  // Review pool: every seen word is eligible (so advanced children always have
  // review), but the sort surfaces least-practised → least-recent first, so
  // mastered words naturally fall to the back (spaced repetition).
  const review = items
    .filter((it) => seen[it.word])
    .sort((a, b) => {
      const ma = seen[a.word] || 0
      const mb = seen[b.word] || 0
      if (ma !== mb) return ma - mb // least practised first
      return (lastSeen[a.word] || 0) - (lastSeen[b.word] || 0) // then least recent
    })

  const want = stage === 'sentences' ? 8 : 6
  const wantReview = stage === 'sentences' ? 3 : 2

  const pickNew = fresh.slice(0, want - wantReview)
  const pickReview = review.slice(0, wantReview)
  let session = [...pickNew, ...pickReview]

  // Top up if a child is new (no review yet) or has seen everything (no fresh).
  if (session.length < want) {
    const used = new Set(session.map((it) => it.word))
    const extra = [...fresh, ...review].filter((it) => !used.has(it.word)).slice(0, want - session.length)
    session = [...session, ...extra]
  }
  return shuffle(session).slice(0, want)
}
