import { useEffect, useState } from 'react'
import './Confetti.css'

const COLORS = ['#FF8C00', '#FF1493', '#32CD32', '#1E90FF', '#FFD700', '#9D4EDD', '#FF6B6B']

/*
 * Lightweight CSS confetti. Re-fires whenever `fireKey` changes. Respects
 * prefers-reduced-motion via the global CSS rule (animations are neutralised).
 */
export default function Confetti({ fireKey }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (fireKey == null) return
    const next = Array.from({ length: 26 }).map((_, i) => ({
      id: `${fireKey}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 1.1 + Math.random() * 0.9,
      color: COLORS[i % COLORS.length],
      size: 8 + Math.random() * 8,
      rotate: Math.random() * 360,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 2200)
    return () => clearTimeout(t)
  }, [fireKey])

  if (!pieces.length) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
