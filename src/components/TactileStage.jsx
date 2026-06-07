import { useRef, useState } from 'react'
import ItemVisual from './ItemVisual.jsx'
import { SpeakerIcon } from './Icons.jsx'
import './TactileStage.css'

/*
 * The learning visual, made tactile: tapping bounces it (Web Animations API, so
 * the image never reloads) and throws a little sparkle burst — cause-and-effect
 * delight that keeps toddlers' fingers moving. Calls onTap to replay the sound.
 */
export default function TactileStage({ item, onTap }) {
  const ref = useRef(null)
  const [burst, setBurst] = useState(0)

  const tap = () => {
    ref.current?.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.12) rotate(-2.5deg)', offset: 0.3 },
        { transform: 'scale(0.97) rotate(1.5deg)', offset: 0.62 },
        { transform: 'scale(1)' },
      ],
      { duration: 460, easing: 'cubic-bezier(0.34,1.56,0.64,1)' },
    )
    setBurst((b) => b + 1)
    onTap && onTap()
  }

  return (
    <button className="tactile-wrap" onClick={tap} aria-label={`Hear ${item.word}`}>
      <div className="tactile-visual" ref={ref}>
        <ItemVisual key={item.word} item={item} kind="stage" />
      </div>
      <span className="card-speaker" aria-hidden="true">
        <SpeakerIcon size={22} />
      </span>
      {burst > 0 && <Sparkles key={burst} />}
    </button>
  )
}

function Sparkles() {
  const n = 7
  return (
    <span className="sparkles" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="sparkle"
          style={{ '--a': `${(360 / n) * i}deg`, '--d': `${i * 0.018}s` }}
        />
      ))}
    </span>
  )
}
