import { useEffect, useRef, useState } from 'react'
import { resolveImage } from '../lib/images'
import './ItemVisual.css'

/*
 * One visual for an item. Variants (priority):
 *   • numeral  → big colourful number + counting stars   (Counting Mountain)
 *   • swatch   → glossy paint blob                        (Rainbow Island)
 *   • portrait → clean typographic card (family)
 *   • photo    → real photograph (+ shimmer + fallback)   (animals, body, etc.)
 * Never an emoji.
 */

const BRIGHTS = ['#FF8C00', '#FF1493', '#32CD32', '#1E90FF', '#FFB01F', '#9D4EDD', '#FF6B6B', '#20B2AA']

const Star = ({ color, style }) => (
  <svg className="count-star" viewBox="0 0 24 24" style={style} aria-hidden="true">
    <path
      fill={color}
      stroke="rgba(0,0,0,0.06)"
      strokeWidth="1"
      d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.2l1.2-6.6L2.5 9l6.6-.9z"
    />
  </svg>
)

export default function ItemVisual({ item, kind = 'stage' }) {
  const cls = `visual visual-${kind}`

  if (item.numeral != null) {
    const color = BRIGHTS[(item.numeral - 1) % BRIGHTS.length]
    return (
      <div className={`${cls} visual-number`} aria-label={`Number ${item.numeral}`}>
        <div className="visual-numeral" style={{ color }}>
          {item.numeral}
        </div>
        {kind === 'stage' && (
          <div className="visual-stars">
            {Array.from({ length: item.count }).map((_, i) => (
              <Star
                key={i}
                color={BRIGHTS[i % BRIGHTS.length]}
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (item.swatch) {
    const isWhite = item.swatch.toLowerCase() === '#ffffff'
    return (
      <div className={`${cls} visual-swatch`} aria-label={`${item.word} colour`}>
        <span className={`paint-blob ${isWhite ? 'is-white' : ''}`} style={{ background: item.swatch }}>
          <span className="paint-gloss" />
        </span>
        <span className="spark spark-a" />
        <span className="spark spark-b" />
        <span className="spark spark-c" />
      </div>
    )
  }

  if (item.portrait) {
    return <Portrait item={item} cls={cls} />
  }

  return <Photo item={item} cls={cls} />
}

// Family members: show a curated local illustration (public/images/<sound>.webp) when
// one exists, else a clean typographic card. Deliberately LOCAL-ONLY (never the
// Wikimedia/stock fallback) so a "Mommy"/"Grandpa" card can only ever be our own
// friendly art or text — never a stranger's photo.
const PORTRAIT_BASE = import.meta.env.BASE_URL || '/'
function Portrait({ item, cls }) {
  const [failed, setFailed] = useState(false)
  const tile = (
    <div
      className={`${cls} visual-portrait`}
      style={{ background: `linear-gradient(135deg, ${item.color} 0%, #ffffff55 160%)` }}
      aria-label={item.word}
    >
      <span className="portrait-word">{item.word}</span>
    </div>
  )
  if (failed || !item.sound) return tile
  return (
    <div className={`${cls} visual-photo`} aria-label={item.word}>
      <img
        src={`${PORTRAIT_BASE}images/${item.sound}.webp`}
        alt={item.word}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function Photo({ item, cls }) {
  const [state, setState] = useState('loading')
  const [url, setUrl] = useState(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    setState('loading')
    setUrl(null)
    resolveImage(item)
      .then((u) => {
        if (!alive.current) return
        if (u) setUrl(u)
        else setState('failed')
      })
      .catch(() => alive.current && setState('failed'))
    return () => {
      alive.current = false
    }
  }, [item])

  if (state === 'failed') {
    return (
      <div
        className={`${cls} visual-fallback`}
        style={{ background: `linear-gradient(135deg, ${item.color} 0%, #ffffff66 170%)` }}
        aria-label={item.word}
      >
        <span className="portrait-word">{item.word}</span>
      </div>
    )
  }

  return (
    <div className={`${cls} visual-photo`} aria-label={item.word}>
      {state === 'loading' && <span className="visual-shimmer" />}
      {url && (
        <img
          src={url}
          alt={item.word}
          onLoad={() => alive.current && setState('ready')}
          onError={() => alive.current && setState('failed')}
          style={{ opacity: state === 'ready' ? 1 : 0 }}
        />
      )}
    </div>
  )
}
