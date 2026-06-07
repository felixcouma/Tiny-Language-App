import { voice } from '../lib/audio'

/* Language Ladder: tap a phrase to hear it (word → sentence).
   Stage-aware: "first words" shows one gentle step; "sentences" shows all. */
export default function Ladder({ phrases, stage }) {
  if (!phrases || !phrases.length) return null
  const shown = stage === 'sentences' ? phrases : phrases.slice(0, 1)
  return (
    <div className="l2-ladder">
      {shown.map((p, i) => (
        <button
          key={p}
          className="ladder-chip"
          style={{ animationDelay: `${i * 70}ms` }}
          onClick={() => voice(p)}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
