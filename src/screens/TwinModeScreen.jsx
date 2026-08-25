import ChoiceGame from '../components/ChoiceGame.jsx'
import { useStore } from '../store'
import { findPrompt } from '../data/gamePrompt.js'
import { buildSession } from '../data/gameScenes.js'

// Turn-taking for two children, over the same mini-scenes as the listening game — the
// twins find Old MacDonald's animals together. A fresh scene pair each play (buildPlan),
// never repeating the previous. The two real profile names lead each prompt.
export default function TwinModeScreen() {
  const players = useStore((s) =>
    s.profiles.filter((p) => !p.guest).slice(0, 2).map((p) => p.name),
  )
  return (
    <ChoiceGame
      buildPlan={buildSession}
      title="Twin Mode"
      grad="linear-gradient(135deg, #ff8c00 0%, #ff1493 100%)"
      choices={3}
      buildPrompt={findPrompt}
      players={players.length >= 2 ? players : null}
    />
  )
}
