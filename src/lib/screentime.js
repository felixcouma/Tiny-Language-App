/*
 * Gentle daily screen-time budget (per device). Parents set a limit; the app
 * ticks minutes while a child plays and offers a calm "time to rest" wind-down
 * when the budget is used up. Stored locally, resets each day.
 */
const USED_KEY = 'tv_screentime'
const LIMIT_KEY = 'tv_screentime_limit' // minutes; 0 = off

const today = () => new Date().toISOString().slice(0, 10)

export const LIMIT_OPTIONS = [0, 15, 30, 45]

export function getLimit() {
  return Number(localStorage.getItem(LIMIT_KEY) || 0)
}
export function setLimit(min) {
  try {
    localStorage.setItem(LIMIT_KEY, String(min || 0))
  } catch {
    /* ignore */
  }
}
export function getUsedToday() {
  try {
    const d = JSON.parse(localStorage.getItem(USED_KEY) || '{}')
    return d.date === today() ? d.mins || 0 : 0
  } catch {
    return 0
  }
}
function setUsed(mins) {
  try {
    localStorage.setItem(USED_KEY, JSON.stringify({ date: today(), mins: Math.max(0, mins) }))
  } catch {
    /* ignore */
  }
}
export function addMinute() {
  const used = getUsedToday() + 1
  setUsed(used)
  return used
}
/** Parent grants more time: claw back some used minutes. */
export function grantMinutes(min = 10) {
  setUsed(getUsedToday() - min)
}
export function isOverLimit() {
  const limit = getLimit()
  return limit > 0 && getUsedToday() >= limit
}
export function minutesLeft() {
  const limit = getLimit()
  if (!limit) return Infinity
  return Math.max(0, limit - getUsedToday())
}
