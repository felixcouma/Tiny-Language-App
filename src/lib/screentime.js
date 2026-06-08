/*
 * Gentle daily screen-time budget — PER CHILD. Parents set a limit and optional
 * quiet hours (bedtime) per profile; the app ticks minutes while that child
 * plays and offers a calm "time to rest" wind-down when the budget is used up or
 * it's quiet hours. A short "a little more" snooze defers the wind-down.
 */
const usedKey = (id) => `tv_screentime_${id || 'default'}`
const SNOOZE_KEY = 'tv_rest_snooze'

const today = () => new Date().toISOString().slice(0, 10)

export const LIMIT_OPTIONS = [0, 15, 30, 45]
export const BEDTIME_OPTIONS = [
  { id: 'off', label: 'Off', from: null },
  { id: '19', label: '7 pm', from: 19 },
  { id: '20', label: '8 pm', from: 20 },
  { id: '21', label: '9 pm', from: 21 },
]
const BEDTIME_END = 7 // quiet until 7am

export function getUsedToday(id) {
  try {
    const d = JSON.parse(localStorage.getItem(usedKey(id)) || '{}')
    return d.date === today() ? d.mins || 0 : 0
  } catch {
    return 0
  }
}
function setUsed(id, mins) {
  try {
    localStorage.setItem(usedKey(id), JSON.stringify({ date: today(), mins: Math.max(0, mins) }))
  } catch {
    /* ignore */
  }
}
export function addMinute(id) {
  const used = getUsedToday(id) + 1
  setUsed(id, used)
  return used
}
export function minutesLeft(id, limit) {
  return limit > 0 ? Math.max(0, limit - getUsedToday(id)) : Infinity
}

/** Is it currently within the child's quiet hours (bedtime)? */
export function isQuietNow(bedtime) {
  if (!bedtime || bedtime.from == null) return false
  const h = new Date().getHours()
  const from = bedtime.from
  const to = bedtime.to ?? BEDTIME_END
  return from > to ? h >= from || h < to : h >= from && h < to // handles midnight wrap
}

const snoozeUntil = () => Number(localStorage.getItem(SNOOZE_KEY) || 0)
export function snooze(min = 10) {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + min * 60000))
  } catch {
    /* ignore */
  }
}

/** Should we wind down now for this child? (limit reached or quiet hours, unless snoozed) */
export function isRestTime(id, limit, bedtime) {
  if (Date.now() < snoozeUntil()) return false
  if (limit > 0 && getUsedToday(id) >= limit) return true
  return isQuietNow(bedtime)
}
