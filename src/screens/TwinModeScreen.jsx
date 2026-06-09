import ChoiceGame from '../components/ChoiceGame.jsx'
import { WORLDS } from '../store'

// Same photo-friendly pool as the listening game.
const POOL = WORLDS.filter((w) =>
  ['safari-island', 'things-i-do', 'my-body', 'home-village'].includes(w.id),
)
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)

function buildPrompt(item) {
  if (item.soundLabel) return `find the ${item.word.toLowerCase()} — listen, ${item.soundLabel}!`
  if (item.action) return `which one is ${item.word.toLowerCase()}?`
  return `find the ${item.word.toLowerCase()}!`
}

// Turn-taking for the twins. Names lead each prompt ("Audrey, find the dog!").
export default function TwinModeScreen() {
  return (
    <ChoiceGame
      pool={POOL}
      title="Twin Mode"
      grad="linear-gradient(135deg, #ff8c00 0%, #ff1493 100%)"
      rounds={8}
      choices={3}
      buildPrompt={buildPrompt}
      players={['Audrey', 'Adriel']}
    />
  )
}
