import { useStore } from '../store'
import Mascot from '../components/Mascot.jsx'
import './SetupScreen.css'

/*
 * First-run setup on a fresh device: ask how many children will play. One seeds a
 * single profile and starts straight away; Two seeds two profiles and opens the
 * "who's playing?" picker (and unlocks Twin Mode turn-taking). Names are generic
 * placeholders a grown-up renames later in the Parent area.
 */
export default function SetupScreen() {
  const setChildCount = useStore((s) => s.setChildCount)

  return (
    <div className="scene setup">
      <div className="setup-inner">
        <Mascot size={84} />
        <h1 className="setup-title">Welcome to TinyVoice!</h1>
        <p className="setup-sub">How many little ones will play?</p>

        <div className="setup-choices">
          <button className="chunky setup-choice" onClick={() => setChildCount(1)}>
            <span className="setup-num">1</span>
            <span className="setup-label">One child</span>
          </button>
          <button className="chunky setup-choice" onClick={() => setChildCount(2)}>
            <span className="setup-num">2</span>
            <span className="setup-label">Two children</span>
          </button>
        </div>

        <p className="setup-foot">
          You can rename them or change this anytime in the grown-ups area.
        </p>
      </div>
    </div>
  )
}
