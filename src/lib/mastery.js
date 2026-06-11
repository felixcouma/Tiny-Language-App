/*
 * Single source of truth for "mastery" — how well a child knows a word or letter.
 *
 * A word (or ABC letter) is "mastered" once it's been heard MASTERED_AT times.
 * Everything that reflects progress reads it from here, so the threshold and the
 * new/practising/mastered buckets are defined exactly once: the Parent Dashboard
 * count, the ★ glow on cards/letters, Today's spaced-repetition sort, and the
 * focus-word suggestions all agree. Pure functions over a profile's `progress`
 * object (`{ seen: {word: count}, abcSeen: {letter: count}, ... }`).
 *
 * In keeping with the golden rules this is gentle, not a test: "mastered" just
 * means a few warm repetitions have happened — never a score or a pass/fail.
 */

// Heard this many times → "mastered".
export const MASTERED_AT = 4

/* ---------------- words ---------------- */

// How many times this child has heard a word.
export const heardCount = (progress, word) => progress?.seen?.[word] || 0

// Has this word been mastered (heard MASTERED_AT+ times)?
export const isMastered = (progress, word) => heardCount(progress, word) >= MASTERED_AT

// Coarse level for visuals: 0 = new/unheard · 1 = practising (1..3) · 2 = mastered.
export const masteryLevel = (progress, word) => {
  const c = heardCount(progress, word)
  return c >= MASTERED_AT ? 2 : c > 0 ? 1 : 0
}

// Every word this child has mastered.
export const masteredWords = (progress) => {
  const seen = progress?.seen || {}
  return Object.keys(seen).filter((w) => seen[w] >= MASTERED_AT)
}

// Words started but not yet mastered (heard 1..MASTERED_AT-1 times).
export const practisingWords = (progress) => {
  const seen = progress?.seen || {}
  return Object.keys(seen).filter((w) => seen[w] > 0 && seen[w] < MASTERED_AT)
}

// Count of mastered words (cheap, avoids building the array).
export const masteredCount = (progress) => {
  const seen = progress?.seen || {}
  let n = 0
  for (const w in seen) if (seen[w] >= MASTERED_AT) n++
  return n
}

/* ---------------- ABC letters (same threshold, abcSeen) ---------------- */

export const letterHeardCount = (progress, letter) => progress?.abcSeen?.[letter] || 0
export const isLetterMastered = (progress, letter) => letterHeardCount(progress, letter) >= MASTERED_AT
