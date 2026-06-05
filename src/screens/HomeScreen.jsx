import { useStore, WORLDS } from '../store'
import { playChime } from '../lib/audio'
import './HomeScreen.css'

export default function HomeScreen() {
  const openWorld = useStore((s) => s.openWorld)
  const openGame = useStore((s) => s.openGame)
  const openTwin = useStore((s) => s.openTwin)
  const openParent = useStore((s) => s.openParent)

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">TinyVoice</h1>
        <button className="parent-btn" onClick={openParent} aria-label="Parent dashboard">
          •••
        </button>
      </header>
      <p className="home-sub">What shall we explore today?</p>

      <main className="world-grid">
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

      <section className="mode-row" aria-label="Games">
        <button
          className="mode-btn mode-game"
          onClick={() => {
            playChime('game')
            openGame()
          }}
        >
          <span className="mode-name">Listening Game</span>
          <span className="mode-tag">Listen &amp; tap</span>
        </button>
        <button
          className="mode-btn mode-twin"
          onClick={() => {
            playChime('twin')
            openTwin()
          }}
        >
          <span className="mode-name">Twin Mode</span>
          <span className="mode-tag">Take turns</span>
        </button>
      </section>

      <footer className="home-footer">
        Made with love for <strong>Audrey &amp; Adriel</strong>
      </footer>
    </div>
  )
}
