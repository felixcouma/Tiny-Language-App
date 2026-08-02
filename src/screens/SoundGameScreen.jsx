import ChoiceGame from '../components/ChoiceGame.jsx'
import { WORLDS } from '../store'

// Items that reliably show a photo (skip colours, numbers, and family portraits).
const POOL = WORLDS.filter((w) =>
  ['safari-island', 'things-i-do', 'my-body', 'home-village'].includes(w.id),
)
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)

// Descriptive cues for animals whose "sound" isn't a real sound (Flutter/Slow) or
// collides with another animal (Zebra's neigh = Horse) — never train a mislabel.
const CUE = {
  Zebra: 'Black and white stripes',
  Butterfly: 'Pretty wings',
  Turtle: 'Slow and steady',
  Elephant: 'Errrrrr',
}
function buildPrompt(item) {
  const w = item.word.toLowerCase()
  // Sound-first (natural, contracted): "Moo! Where's the cow?"
  if (item.soundLabel) return `${CUE[item.word] || item.soundLabel}! Where's the ${w}?`
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
