import ChoiceGame from '../components/ChoiceGame.jsx'
import { WORLDS } from '../store'
import { findPrompt } from '../data/gamePrompt.js'

// Items that reliably show a photo (skip colours, numbers, and family portraits).
const POOL = WORLDS.filter((w) =>
  ['safari-island', 'things-i-do', 'my-body', 'home-village'].includes(w.id),
)
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)

export default function SoundGameScreen() {
  return (
    <ChoiceGame
      pool={POOL}
      title="Listening Game"
      grad="linear-gradient(135deg, #355c7d 0%, #6c5b7b 100%)"
      rounds={8}
      choices={4}
      buildPrompt={findPrompt}
    />
  )
}
