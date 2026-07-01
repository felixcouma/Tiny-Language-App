import { useEffect } from 'react'
import { useStore } from '../store'
import { voice } from '../lib/audio'
import Mascot from '../components/Mascot.jsx'
import TodayProgressLine from '../components/TodayProgressLine.jsx'
import './Rest.css'

/* Calm wind-down when the daily screen-time budget is used up. */
export default function RestScreen() {
  const goHome = useStore((s) => s.goHome)
  const requestGate = useStore((s) => s.requestGate)
  const child = useStore((s) => s.activeProfile())

  useEffect(() => {
    const t = setTimeout(() => voice(`Time to rest${child ? `, ${child.name}` : ''}. See you soon!`), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="scene rest">
      <div className="rest-inner">
        <Mascot size={104} />
        <h2 className="rest-title">Time to rest!</h2>
        <p className="rest-sub">
          Great playing today{child ? `, ${child.name}` : ''}. Pip needs a nap — see you soon.
        </p>
        <TodayProgressLine />
        <div className="rest-actions">
          <button className="chunky rest-cta" onClick={goHome}>
            Home
          </button>
          <button className="rest-more" onClick={() => requestGate('more')}>
            Grown-up: a little more
          </button>
        </div>
      </div>
    </div>
  )
}
