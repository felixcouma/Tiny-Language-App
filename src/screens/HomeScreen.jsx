import { useStore, WORLDS } from '../store'
import { playChime } from '../lib/audio'
import Mascot from '../components/Mascot.jsx'
import './HomeScreen.css'

export default function HomeScreen() {
  const openWorld = useStore((s) => s.openWorld)
  const openGame = useStore((s) => s.openGame)
  const openTwin = useStore((s) => s.openTwin)
  const requestGate = useStore((s) => s.requestGate)
  const openProfiles = useStore((s) => s.openProfiles)
  const openToday = useStore((s) => s.openToday)
  const openCollection = useStore((s) => s.openCollection)
  const child = useStore((s) => s.activeProfile())

  return (
    <div className="scene home2">
      <div className="scene-globe" />

      <header className="home2-top">
        {child && (
          <button className="home2-who" onClick={openProfiles} aria-label={`Playing as ${child.name}. Switch child.`}>
            <span className="home2-avatar" style={{ background: child.color }}>
              {child.name[0]?.toUpperCase()}
            </span>
            <span className="home2-whoname">{child.name}</span>
          </button>
        )}
        <div className="home2-actions">
          <button className="round-btn home2-collect" onClick={openCollection} aria-label="My collection">
            ★
          </button>
          <button
            className="round-btn home2-parent"
            onClick={() => requestGate('parent')}
            aria-label="Parent dashboard"
          >
            •••
          </button>
        </div>
      </header>

      <div className="home2-greet">
        <div className="speech-bubble">What shall we learn?</div>
        <Mascot size={70} />
      </div>

      <button
        className="chunky home2-today"
        onClick={() => {
          playChime('today')
          openToday()
        }}
      >
        ▸ Today with Pip
      </button>

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
