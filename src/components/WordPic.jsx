import { useState } from 'react'
import { imageKeyFor } from '../data/phraseContent'
import { slugify } from '../lib/audio'
import './WordPic.css'

const BASE = import.meta.env.BASE_URL || '/'
const PALETTE = ['#1971c2', '#e8590c', '#2f9e44', '#9c36b5', '#c2255c', '#0c8599', '#5f3dc4', '#e67700']
// Stable colour per word, so each text tile is varied but consistent across screens.
const colourFor = (w) => {
  let h = 0
  for (let i = 0; i < (w || '').length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/**
 * A word's picture, with a graceful fallback: when there's no image yet, the word
 * itself is shown as a bold coloured tile that fills the box — so every cell/cube/card
 * looks consistent and readable instead of bare. `variant`: 'cell' | 'cube' | 'card'.
 */
export default function WordPic({ word, variant = 'cell', label = true }) {
  const [failed, setFailed] = useState(false)
  if (!word) return null
  if (failed) {
    return (
      <span className={`wp wp-${variant} wp-tile`} style={{ '--tile': colourFor(word) }}>
        {word}
      </span>
    )
  }
  return (
    <span className={`wp wp-${variant} wp-pic`}>
      <img
        className="wp-img"
        src={`${BASE}images/${imageKeyFor(word) || slugify(word)}.webp`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {label && <span className="wp-label">{word}</span>}
    </span>
  )
}
