import ChoiceGame from '../components/ChoiceGame.jsx'
import { findPrompt } from '../data/gamePrompt.js'
import { buildSession } from '../data/gameScenes.js'

// The listening game runs as mini-scenes (Farm, Zoo, Snack, …) so each round stays
// on-theme. `buildPlan` gives ChoiceGame a fresh session on entry AND on "Play again"
// (buildSession picks 2 scenes and never repeats the previous pair) — no page reload.
export default function SoundGameScreen() {
  return (
    <ChoiceGame
      buildPlan={buildSession}
      title="Listening Game"
      grad="linear-gradient(135deg, #355c7d 0%, #6c5b7b 100%)"
      choices={4}
      buildPrompt={findPrompt}
    />
  )
}
