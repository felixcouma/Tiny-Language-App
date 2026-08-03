import ChoiceGame from '../components/ChoiceGame.jsx'
import { WORLDS } from '../store'
import { hasFx } from '../data/fxKeys.js'

// Items that reliably show a photo (skip colours, numbers, and family portraits).
const POOL = WORLDS.filter((w) =>
  ['safari-island', 'things-i-do', 'my-body', 'home-village'].includes(w.id),
)
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)

// Spoken cue only for sound-animals WITHOUT a real fx file (their soundLabel isn't a
// good spoken sound). fx-animals instead play the REAL recorded sound (ChoiceGame).
const CUE = {
  Butterfly: 'Pretty wings',
  Turtle: 'Slow and steady',
}
function buildPrompt(item) {
  const w = item.word.toLowerCase()
  if (item.soundLabel) {
    // fx-animals: ChoiceGame plays the real trumpet/oink/… → just ask the question.
    if (hasFx(item.sound)) return `Where's the ${w}?`
    return `${CUE[item.word] || item.soundLabel}! Where's the ${w}?`
  }
  // Actions can't be "found" — narrate the doer: "Who's jumping?"
  if (item.action) return item.word === 'Peekaboo' ? "Who's playing peekaboo?" : `Who's ${w}?`
  return `Where's the ${w}?`
}

export default function SoundGameScreen() {
  return (
    <ChoiceGame
      pool={POOL}
      title="Listening Game"
      grad="linear-gradient(135deg, #355c7d 0%, #6c5b7b 100%)"
      rounds={8}
      choices={4}
      buildPrompt={buildPrompt}
    />
  )
}
