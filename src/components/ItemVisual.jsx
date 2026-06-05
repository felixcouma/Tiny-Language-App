import { useEffect, useRef, useState } from 'react'
import { resolveImage } from '../lib/images'
import './ItemVisual.css'

/*
 * One visual for an item, used on the Learning screen (kind="stage") and as a
 * choice tile in the games (kind="choice"). Variants, in priority:
 *   • numeral  → big number + counting dots
 *   • swatch   → colour block
 *   • portrait → clean typographic card (family — no stranger photos)
 *   • photo    → real resolved photograph, with shimmer + typographic fallback
 * Never renders an emoji.
 */
export default function ItemVisual({ item, kind = 'stage' }) {
  const cls = `visual visual-${kind}`

  if (item.numeral != null) {
    return (
      <div className={`${cls} visual-number`} aria-label={`Number ${item.numeral}`}>
        <div className="visual-numeral">{item.numeral}</div>
        {kind === 'stage' && (
          <div className="visual-dots">
            {Array.from({ length: item.count }).map((_, i) => (
              <span key={i} className="dot" style={{ background: item.color }} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (item.swatch) {
    return (
      <div
        className={`${cls} visual-swatch`}
        style={{ background: item.swatch }}
        aria-label={`${item.word} colour`}
      >
        {item.swatch.toLowerCase() === '#ffffff' && <span className="swatch-ring" />}
      </div>
    )
  }

  if (item.portrait) {
    return (
      <div
        className={`${cls} visual-portrait`}
        style={{ background: `linear-gradient(135deg, ${item.color} 0%, #ffffff55 160%)` }}
        aria-label={item.word}
      >
        <span className="portrait-word">{item.word}</span>
      </div>
    )
  }

  return <Photo item={item} cls={cls} />
}

function Photo({ item, cls }) {
  const [state, setState] = useState('loading') // loading | ready | failed
  const [url, setUrl] = useState(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    setState('loading')
    setUrl(null)
    resolveImage(item)
      .then((u) => {
        if (!alive.current) return
        if (u) {
          setUrl(u)
        } else {
          setState('failed')
        }
      })
      .catch(() => alive.current && setState('failed'))
    return () => {
      alive.current = false
    }
  }, [item])

  if (state === 'failed' || (state === 'ready' && !url)) {
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
