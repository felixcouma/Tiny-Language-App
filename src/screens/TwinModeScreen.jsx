import ChoiceGame from '../components/ChoiceGame.jsx'
import { WORLDS, useStore } from '../store'
import { hasFx } from '../data/fxKeys.js'

// Same photo-friendly pool as the listening game.
const POOL = WORLDS.filter((w) =>
  ['safari-island', 'things-i-do', 'my-body', 'home-village'].includes(w.id),
)
  .flatMap((w) => w.items)
  .filter((it) => !it.portrait)

// Same as the Listening Game: fx-animals play the real sound; others get a spoken cue.
const CUE = {
  Butterfly: 'Pretty wings',
  Turtle: 'Slow and steady',
}
function buildPrompt(item) {
  const w = item.word.toLowerCase()
  if (item.soundLabel) {
    if (hasFx(item.sound)) return `Where's the ${w}?`
    return `${CUE[item.word] || item.soundLabel}! Where's the ${w}?`
  }
  if (item.action) return item.word === 'Peekaboo' ? "Who's playing peekaboo?" : `Who's ${w}?`
  return `Where's the ${w}?`
}

// Turn-taking for two children. The two real profile names lead each prompt
// ("Audrey, find the dog!"). On the original device that's still Audrey & Adriel;
// on a fresh family's device it's whatever the grown-up named their children.
export default function TwinModeScreen() {
  const players = useStore((s) =>
    s.profiles.filter((p) => !p.guest).slice(0, 2).map((p) => p.name),
  )
  return (
    <ChoiceGame
      pool={POOL}
      title="Twin Mode"
      grad="linear-gradient(135deg, #ff8c00 0%, #ff1493 100%)"
      rounds={8}
      choices={3}
      buildPrompt={buildPrompt}
      players={players.length >= 2 ? players : null}
    />
  )
}
