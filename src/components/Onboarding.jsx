import { useState } from 'react'
import { useStore } from '../store'
import Mascot from './Mascot.jsx'
import './Onboarding.css'

const STEPS = [
  { title: "Hi! I'm Pip", body: "Let's learn lots of new words together!" },
  { title: 'Tap to hear', body: 'Tap a picture card and I&rsquo;ll say the word out loud.' },
  { title: 'Collect friends', body: 'Every word you hear becomes a ★ sticker friend to keep!' },
]

/* Gentle 3-step first-run intro, shown once per device. */
export default function Onboarding() {
  const finish = useStore((s) => s.finishOnboarding)
  const [i, setI] = useState(0)
  const last = i === STEPS.length - 1
  const step = STEPS[i]

  return (
    <div className="onb-overlay">
      <div className="onb-card">
        <Mascot size={100} />
        <h2 className="onb-title">{step.title}</h2>
        <p className="onb-body" dangerouslySetInnerHTML={{ __html: step.body }} />
        <div className="onb-dots" aria-hidden="true">
          {STEPS.map((_, k) => (
            <span key={k} className={`onb-dot ${k === i ? 'on' : ''}`} />
          ))}
        </div>
        <button className="chunky onb-next" onClick={() => (last ? finish() : setI(i + 1))}>
          {last ? "Let's play!" : 'Next'}
        </button>
        {!last && (
          <button className="onb-skip" onClick={finish}>
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
