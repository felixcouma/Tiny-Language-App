import { useStore, WORLDS } from '../store'
import { playSound } from '../lib/audio'
import './HomeScreen.css'

export default function HomeScreen() {
  const openWorld = useStore((s) => s.openWorld)

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">
          <span aria-hidden="true">🦁</span> TinyVoice
        </h1>
        <p className="home-sub">What shall we explore today?</p>
      </header>

      <main className="world-grid">
        {WORLDS.map((world) => (
          <button
            key={world.id}
            className="world-card"
            style={{ background: world.gradient }}
            onClick={() => {
              playSound('') // friendly tap chime
              openWorld(world.id)
            }}
            aria-label={`${world.name}. ${world.tagline}. ${world.items.length} items.`}
          >
            <span className="world-emoji" aria-hidden="true">
              {world.emoji}
            </span>
            <span className="world-name">{world.name}</span>
            <span className="world-tagline">{world.tagline}</span>
          </button>
        ))}
      </main>

      <footer className="home-footer">For Audrey &amp; Adriel 💛</footer>
    </div>
  )
}
