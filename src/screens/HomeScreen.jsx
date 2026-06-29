import { useStore, WORLDS } from '../store'
import { playChime } from '../lib/audio'
import Mascot from '../components/Mascot.jsx'
import './HomeScreen.css'

export default function HomeScreen() {
  const openWorld = useStore((s) => s.openWorld)
  const openGame = useStore((s) => s.openGame)
  const openTwin = useStore((s) => s.openTwin)
  const openPhonics = useStore((s) => s.openPhonics)
  const openPhrase = useStore((s) => s.openPhrase)
  const openGrid = useStore((s) => s.openGrid)
  const openAbc = useStore((s) => s.openAbc)
  const openEcho = useStore((s) => s.openEcho)
  const requestGate = useStore((s) => s.requestGate)
  const openProfiles = useStore((s) => s.openProfiles)
  const openToday = useStore((s) => s.openToday)
  const openCollection = useStore((s) => s.openCollection)
  const child = useStore((s) => s.activeProfile())
  const childCount = useStore((s) => s.childCount)
  const profiles = useStore((s) => s.profiles)
  // Twin Mode (turn-taking) only makes sense with two children set up.
  const twinReady = (childCount || 0) >= 2 && profiles.filter((p) => !p.guest).length >= 2

  return (
    <div className="scene home2">
      <div className="scene-globe" />

      <header className="home2-top">
        {child && (
          <button className="home2-who" onClick={openProfiles} aria-label={`Playing as ${child.name}. Switch child.`}>
            <span className="home2-avatar" style={{ background: child.color }}>
              {child.initials || child.name[0]?.toUpperCase()}
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

      <button
        className="chunky home2-speech"
        onClick={() => {
          playChime('phrase')
          openPhrase()
        }}
      >
        {(child?.phraseLevel || 1) >= 2 ? 'Phrase Builder' : 'Word Practice'}
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
        {twinReady && (
          <button
            className="chunky mode-btn mode-twin"
            onClick={() => {
              playChime('twin')
              openTwin()
            }}
          >
            Twin Mode
          </button>
        )}
        <button
          className="chunky mode-btn mode-grid"
          onClick={() => {
            playChime('grid')
            openGrid()
          }}
        >
          Word Board
        </button>
        <button
          className="chunky mode-btn mode-phonics"
          onClick={() => {
            playChime('phonics')
            openPhonics()
          }}
        >
          Letter Sounds
        </button>
        <button
          className="chunky mode-btn mode-abc"
          onClick={() => {
            playChime('abc')
            openAbc()
          }}
        >
          ABC Songs
        </button>
        <button
          className="chunky mode-btn mode-echo"
          onClick={() => {
            playChime('echo')
            openEcho()
          }}
        >
          Say It With Me
        </button>
      </section>
    </div>
  )
}
