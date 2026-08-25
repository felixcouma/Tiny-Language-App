import { useState } from 'react'
import Mascot from './Mascot.jsx'
import './ParentIntro.css'

/*
 * Parent-facing value prop — the first thing a grown-up sees on a fresh device, BEFORE
 * the "how many children?" setup. Answers "why this app?" so a cold parent doesn't drop
 * at a bare setup screen. Distinct from components/Onboarding.jsx (the child coach-marks
 * shown later, on Home). Shown once, gated by `seenIntro` (tv_seen_intro). Always skippable.
 *
 * Order is deliberate: lead with the UNIVERSAL promise (works for every family), then Twin
 * Mode as an inclusive delight (never "this is only for twins"), then the SLP credibility.
 */
const SLIDES = [
  {
    key: 'voice',
    title: 'First words, out loud.',
    body: 'Real pictures, real animal sounds, and a warm human voice that speaks every word — so your little one hears it, then tries it.',
    accent: 'linear-gradient(135deg,#FF8A65 0%,#FFD54F 100%)',
  },
  {
    key: 'twin',
    title: 'One child, or two.',
    body: 'Made for any family. With two, Twin Mode takes gentle turns and cheers them <b>by name, together</b> — no winners, no rivalry.',
    accent: 'linear-gradient(135deg,#7C4DFF 0%,#FF80AB 100%)',
  },
  {
    key: 'slp',
    title: 'Rooted in speech-therapy principles.',
    body: 'Designed around how toddlers really learn language — drawing on speech-therapy best practices, with no scores and no pressure. More than flash cards: warm words in the moments that matter.',
    accent: 'linear-gradient(135deg,#26A69A 0%,#80CBC4 100%)',
  },
]

export default function ParentIntro({ onDone }) {
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const s = SLIDES[i]

  return (
    <div className="pintro-overlay">
      <div className="pintro-card">
        <div className="pintro-hero" style={{ background: s.accent }}>
          <Mascot size={92} />
        </div>
        <h2 className="pintro-title">{s.title}</h2>
        <p className="pintro-body" dangerouslySetInnerHTML={{ __html: s.body }} />

        <div className="pintro-dots" aria-hidden="true">
          {SLIDES.map((_, k) => (
            <span key={k} className={`pintro-dot ${k === i ? 'on' : ''}`} />
          ))}
        </div>

        <button className="chunky pintro-next" onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? "Let's set up" : 'Next'}
        </button>
        {!last && (
          <button className="pintro-skip" onClick={onDone}>
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
