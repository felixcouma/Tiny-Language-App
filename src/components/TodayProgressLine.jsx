import { useStore, dayKey } from '../store'
import './TodayProgressLine.css'

/*
 * A gentle, PARENT-facing "moment of progress" line for the end of a session
 * (game done / wind-down). Deliberately NOT a child-facing score — it reads what
 * happened today for the active child and renders only when there's something to
 * show. Reads the per-child `daily` bucket (auto-resets on a new day).
 */
export default function TodayProgressLine() {
  const child = useStore((s) => s.activeProfile())
  const daily = useStore((s) => s.progress.daily)

  const t = daily && daily.date === dayKey() ? daily : null
  if (!child || !t || (!t.wordsHeard && !t.phrases)) return null

  const bits = []
  if (t.newWords > 0) bits.push(`${t.newWords} new ${t.newWords === 1 ? 'word' : 'words'}`)
  else if (t.wordsHeard > 0) bits.push(`${t.wordsHeard} ${t.wordsHeard === 1 ? 'word' : 'words'} practised`)
  if (t.phrases > 0) bits.push(`${t.phrases} ${t.phrases === 1 ? 'phrase' : 'phrases'}`)
  if (!bits.length) return null

  return (
    <p className="today-progress">
      <span className="today-progress-tag">for grown-ups</span>
      Today with {child.name}: {bits.join(' · ')}
    </p>
  )
}
