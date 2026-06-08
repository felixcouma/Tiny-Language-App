import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { playChime } from '../lib/audio'
import ItemVisual from './ItemVisual.jsx'
import Mascot from './Mascot.jsx'
import './CollectToast.css'

/* "New friend!" celebration when a word is collected for the first time. */
export default function CollectToast() {
  const lastCollected = useStore((s) => s.lastCollected)
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!lastCollected) return
    setActive(lastCollected)
    playChime('collect')
    const t = setTimeout(() => setActive(null), 2200)
    return () => clearTimeout(t)
  }, [lastCollected?.id])

  if (!active) return null
  return (
    <div className="ctoast" key={active.id}>
      <span className="ctoast-thumb">
        <ItemVisual item={active.item} kind="choice" />
      </span>
      <div className="ctoast-text">
        <b>New friend!</b>
        <span>{active.item.word}</span>
      </div>
      <span className="ctoast-pip">
        <Mascot size={34} />
      </span>
    </div>
  )
}
