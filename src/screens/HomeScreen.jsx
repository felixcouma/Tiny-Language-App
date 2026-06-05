import { useStore, WORLDS } from '../store'
import { playChime } from '../lib/audio'
import Mascot from '../components/Mascot.jsx'
import './HomeScreen.css'

export default function HomeScreen() {
  const openWorld = useStore((s) => s.openWorld)
  const openGame = useStore((s) => s.openGame)
  const openTwin = useStore((s) => s.openTwin)
  const openParent = useStore((s) => s.openParent)

  return (
    <div className="scene home2">
      <div className="scene-globe" />

      <header className="home2-top">
        <h1 className="home2-title">TinyVoice</h1>
        <button className="round-btn home2-parent" onClick={openParent} aria-label="Parent dashboard">
          •••
        </button>
      </header>

      <div className="home2-greet">
        <div className="speech-bubble">What shall we learn?</div>
        <Mascot size={70} />
      </div>

      <main className="home2-grid">
        {WORLDS.map((world) => (
          <button
            key={world.id}
            className="world-card"
            style={{ background: world.grad }}
            onClick={() => {
              playChime(world.id)
              openWorld(world.id)
            }}
            aria-label={`${world.name}. ${world.tagline}.`}
          >
            <span className="world-name">{world.name}</span>
            <span className="world-tagline">{world.tagline}</span>
          </button>
        ))}
      </main>

      <section className="home2-modes" aria-label="Games">
        <button
          className="chunky mode-btn"
          onClick={() => {
            playChime('game')
            openGame()
          }}
        >
          Listening Game
        </button>
        <button
          className="chunky mode-btn mode-twin"
          onClick={() => {
            playChime('twin')
            openTwin()
          }}
        >
          Twin Mode
        </button>
      </section>
    </div>
  )
}
