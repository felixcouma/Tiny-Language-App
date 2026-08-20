import { useMemo } from 'react'
import ChoiceGame from '../components/ChoiceGame.jsx'
import { findPrompt } from '../data/gamePrompt.js'
import { buildSession } from '../data/gameScenes.js'

// The listening game runs as mini-scenes (Old MacDonald's Farm, Snack Time, At the
// Park) so each round stays on-theme instead of a random bag. A fresh session is
// built per mount (2 scenes; Farm always in, order randomised).
export default function SoundGameScreen() {
  const plan = useMemo(() => buildSession(), [])
  return (
    <ChoiceGame
      plan={plan}
      title="Listening Game"
      grad="linear-gradient(135deg, #355c7d 0%, #6c5b7b 100%)"
      choices={4}
      buildPrompt={findPrompt}
    />
  )
}
