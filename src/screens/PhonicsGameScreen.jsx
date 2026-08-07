import ChoiceGame from '../components/ChoiceGame.jsx'
import { WORLDS } from '../store'
import './PhonicsGameScreen.css'

// Photo-friendly pool (same as the listening game).
const POOL = WORLDS.filter((w) =>
  ['safari-island', 'things-i-do', 'my-body', 'home-village'].includes(w.id),
)
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)

const letterOf = (item) => item.word[0].toUpperCase()

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Distractors must start with a DIFFERENT letter so the answer is unambiguous.
function pickDistractors(target, pool, count) {
  const L = letterOf(target)
  const diff = pool.filter((p) => letterOf(p) !== L && p.word !== target.word)
  return shuffle(diff).slice(0, count)
}

function buildPrompt(item) {
  return `Which one starts with ${letterOf(item)}? Where's the ${item.word.toLowerCase()}?`
}

function promptBadge(target) {
  return <span className="phonics-letter">{letterOf(target)}</span>
}

/* First-letters phonics bridge: hear a letter, find a word that starts with it. */
export default function PhonicsGameScreen() {
  return (
    <ChoiceGame
      pool={POOL}
      title="Letter Sounds"
      grad="linear-gradient(135deg, #9d4edd 0%, #5aa9d8 100%)"
      rounds={8}
      choices={4}
      buildPrompt={buildPrompt}
      pickDistractors={pickDistractors}
      promptBadge={promptBadge}
    />
  )
}
