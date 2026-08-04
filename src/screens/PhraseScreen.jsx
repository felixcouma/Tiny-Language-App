import { Fragment, useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { voice, playCelebration, stopSpeaking } from '../lib/audio'
import {
  CATEGORIES,
  wordsInCategory,
  PHRASES,
  PHRASE_SIZES,
  isPhraseReady,
  imageKeyFor,
} from '../data/phraseContent'
import { slugify } from '../lib/audio'

const BASE = import.meta.env.BASE_URL || '/'
// A word's picture (content illustration or generated symbol); hidden if absent.
const wordImg = (word) => `${BASE}images/${imageKeyFor(word) || slugify(word)}.webp`
const hideOnError = (e) => {
  e.currentTarget.style.display = 'none'
}
import {
  HomeIcon,
  SpeakerIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '../components/Icons.jsx'
import Mascot from '../components/Mascot.jsx'
import WordPic from '../components/WordPic.jsx'
import { masteryLevel } from '../lib/mastery'
import './PhraseScreen.css'

// Word & Phrase practice — a calm speech-therapy tool. Tap a word (or a phrase),
// hear it in our warm voice. The mode follows the child's per-profile phraseLevel:
//   Level 1 → single words   ·   Level 2+ → two-word phrases.
export default function PhraseScreen() {
  const child = useStore((s) => s.activeProfile())
  const level = child?.phraseLevel || 1
  const goHome = useStore((s) => s.goHome)
  // The saved level sets the default, but either mode can be reached in-session
  // (a ready Level-1 child can try phrases; anyone can drop back to single words).
  const [mode, setMode] = useState(level >= 2 ? 'phrase' : 'word')

  return (
    <div className="scene phrase">
      <div className="scene-globe" />
      <header className="ph-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <div className="ph-title">
          <span className="ph-title-main">
            {mode === 'phrase' ? 'Phrase Builder' : 'Word Practice'}
          </span>
          {child && <span className="ph-title-sub">for {child.name}</span>}
        </div>
        <span className="ph-spacer" />
      </header>

      {mode === 'phrase' ? (
        <PhraseMode level={level} onWords={() => setMode('word')} />
      ) : (
        <WordMode onPhrases={() => setMode('phrase')} />
      )}
    </div>
  )
}

/* ------------------------- Level 1: single words ------------------------- */
function WordMode({ onPhrases }) {
  const recordWord = useStore((s) => s.recordPracticeWord)
  const muted = useStore((s) => s.muted)
  const seen = useStore((s) => s.progress.seen) || {}
  const ready = useStore((s) => isPhraseReady(s.progress))

  const categories = CATEGORIES
  const [cat, setCat] = useState(categories[0])
  const words = useMemo(() => wordsInCategory(cat), [cat])
  const [i, setI] = useState(0)
  const word = words[i]?.word
  const level = word ? masteryLevel({ seen }, word) : 0 // 0 new · 1 practising · 2 mastered
  const firstLetter = word ? word.replace(/[^A-Za-z]/, '')[0] || word[0] : ''

  const say = (w) => {
    if (!w) return
    voice(w)
    recordWord(w)
  }

  // Say each word as it comes into focus (child hears it without needing to tap).
  useEffect(() => {
    if (!word || muted) return
    const t = setTimeout(() => say(word), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  const pickCat = (c) => {
    stopSpeaking()
    setCat(c)
    setI(0)
  }
  const go = (delta) => {
    stopSpeaking()
    setI((n) => (n + delta + words.length) % words.length)
  }

  return (
    <main className="ph-main">
      <div className="ph-greet">
        <span className="speech-bubble">Tap to hear…</span>
        <Mascot size={52} />
      </div>

      <div className="ph-cats" role="tablist" aria-label="Word groups">
        {categories.map((c) => (
          <button
            key={c}
            className={`ph-cat ${c === cat ? 'is-active' : ''}`}
            onClick={() => pickCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        className="ph-word-card"
        onClick={() => say(word)}
        aria-label={`Hear ${word}`}
      >
        {level > 0 && (
          <span
            className={`ph-heard ${level === 2 ? 'is-mastered' : ''}`}
            aria-label={level === 2 ? 'Mastered' : 'Heard before'}
          >
            {level === 2 ? '★ got it!' : '✓ heard'}
          </span>
        )}
        {word && (
          <img
            key={word}
            className="ph-word-img"
            src={wordImg(word)}
            alt=""
            loading="lazy"
            onError={hideOnError}
          />
        )}
        <span className="ph-word">{word}</span>
        <span className="ph-hear">
          <SpeakerIcon size={26} /> tap to hear
        </span>
      </button>

      {firstLetter && (
        <button
          className="ph-letter"
          onClick={() => voice(firstLetter)}
          aria-label={`Starts with ${firstLetter}`}
        >
          starts with <b>{firstLetter.toUpperCase()}</b>
        </button>
      )}

      <nav className="ph-nav">
        <button className="chunky arrow" onClick={() => go(-1)} aria-label="Previous word">
          <ArrowLeftIcon size={26} />
        </button>
        <span className="ph-count">
          {words.length ? i + 1 : 0} / {words.length}
        </span>
        <button className="chunky arrow" onClick={() => go(1)} aria-label="Next word">
          <ArrowRightIcon size={26} />
        </button>
      </nav>

      {ready && (
        <button className="ph-tryphrases" onClick={onPhrases}>
          Ready for phrases? Try the Phrase Builder →
        </button>
      )}
    </main>
  )
}

/* -------------- Levels 2 & 3: phrase recognition (2- or 3-word) ------------- */
function PhraseMode({ level, onWords }) {
  const recordWord = useStore((s) => s.recordPracticeWord)
  const recordPhrase = useStore((s) => s.recordPhrase)
  const muted = useStore((s) => s.muted)

  const [size, setSize] = useState(level >= 3 ? 3 : 2) // 2- or 3-word phrases
  const set = PHRASES[size]
  const [i, setI] = useState(0)
  const [tappedIdx, setTappedIdx] = useState(null) // which cube is flashing
  const [heard, setHeard] = useState(false) // phrase played at least once
  const entry = set[i]

  const pickSize = (n) => {
    stopSpeaking()
    setSize(n)
    setI(0)
    setHeard(false)
    setTappedIdx(null)
  }
  const sayWord = (w, idx) => {
    stopSpeaking()
    voice(w)
    recordWord(w)
    setTappedIdx(idx)
    setTimeout(() => setTappedIdx((cur) => (cur === idx ? null : cur)), 700)
  }
  const sayPhrase = () => {
    stopSpeaking()
    // Cubes stay telegraphic; the "together" button SPEAKS the natural sentence (§1.4).
    voice(entry.say || entry.phrase)
    recordPhrase(entry.phrase) // progress key stays the stable blocks string
    setHeard(true)
    if (!muted) playCelebration()
  }
  const go = (delta) => {
    stopSpeaking()
    setHeard(false)
    setTappedIdx(null)
    setI((n) => (n + delta + set.length) % set.length)
  }

  return (
    <main className="ph-main">
      <div className="ph-toggle" role="tablist" aria-label="Phrase length">
        {PHRASE_SIZES.map((n) => (
          <button
            key={n}
            className={`ph-seg ${size === n ? 'is-active' : ''}`}
            onClick={() => pickSize(n)}
            role="tab"
            aria-selected={size === n}
          >
            {n} words
          </button>
        ))}
      </div>

      <div className="ph-greet">
        <span className="speech-bubble">Tap each word…</span>
        <Mascot size={56} />
      </div>

      <div className={`ph-pair words-${entry.words.length}`}>
        {entry.words.map((w, idx) => (
          <Fragment key={idx}>
            {idx > 0 && (
              <span className="ph-plus" aria-hidden="true">
                +
              </span>
            )}
            <button
              className={`ph-cube ${tappedIdx === idx ? 'just-tapped' : ''}`}
              onClick={() => sayWord(w, idx)}
              aria-label={`Hear ${w}`}
            >
              <WordPic key={w} word={w} variant="cube" />
            </button>
          </Fragment>
        ))}
      </div>

      <button
        className={`ph-phrase ${heard ? 'is-heard' : ''}`}
        onClick={sayPhrase}
        aria-label={`Hear the phrase ${entry.say || entry.phrase}`}
      >
        <span className="ph-phrase-text">{entry.phrase}</span>
        <span className="ph-hear">
          <SpeakerIcon size={24} /> hear them together
        </span>
      </button>

      <nav className="ph-nav">
        <button className="chunky arrow" onClick={() => go(-1)} aria-label="Previous phrase">
          <ArrowLeftIcon size={26} />
        </button>
        <span className="ph-count">
          {i + 1} / {set.length}
        </span>
        <button className="chunky arrow" onClick={() => go(1)} aria-label="Next phrase">
          <ArrowRightIcon size={26} />
        </button>
      </nav>

      <button className="ph-towords" onClick={onWords}>
        ← Back to single words
      </button>
    </main>
  )
}
