import { Fragment, useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { voice, playCelebration, stopSpeaking } from '../lib/audio'
import {
  wordsForLevel,
  categoriesForLevel,
  PHRASES,
  PHRASE_SIZES,
} from '../data/phraseContent'
import {
  HomeIcon,
  SpeakerIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '../components/Icons.jsx'
import Mascot from '../components/Mascot.jsx'
import './PhraseScreen.css'

// Word & Phrase practice — a calm speech-therapy tool. Tap a word (or a phrase),
// hear it in our warm voice. The mode follows the child's per-profile phraseLevel:
//   Level 1 → single words   ·   Level 2+ → two-word phrases.
export default function PhraseScreen() {
  const child = useStore((s) => s.activeProfile())
  const level = child?.phraseLevel || 1
  const goHome = useStore((s) => s.goHome)

  return (
    <div className="scene phrase">
      <div className="scene-globe" />
      <header className="ph-top">
        <button className="round-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={26} />
        </button>
        <div className="ph-title">
          <span className="ph-title-main">
            {level >= 2 ? 'Phrase Builder' : 'Word Practice'}
          </span>
          {child && <span className="ph-title-sub">for {child.name}</span>}
        </div>
        <span className="ph-spacer" />
      </header>

      {level >= 2 ? <PhraseMode level={level} /> : <WordMode level={level} />}
    </div>
  )
}

/* ------------------------- Level 1: single words ------------------------- */
function WordMode({ level }) {
  const recordWord = useStore((s) => s.recordPracticeWord)
  const muted = useStore((s) => s.muted)

  const categories = useMemo(() => categoriesForLevel(level), [level])
  const [cat, setCat] = useState(categories[0])
  const words = useMemo(
    () => wordsForLevel(level).filter((w) => w.category === cat),
    [level, cat]
  )
  const [i, setI] = useState(0)
  const word = words[i]?.word

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
        <span className="ph-word">{word}</span>
        <span className="ph-hear">
          <SpeakerIcon size={26} /> tap to hear
        </span>
      </button>

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
    </main>
  )
}

/* -------------- Levels 2 & 3: phrase recognition (2- or 3-word) ------------- */
function PhraseMode({ level }) {
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
    voice(entry.phrase)
    recordPhrase(entry.phrase)
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
              {w}
            </button>
          </Fragment>
        ))}
      </div>

      <button
        className={`ph-phrase ${heard ? 'is-heard' : ''}`}
        onClick={sayPhrase}
        aria-label={`Hear the phrase ${entry.phrase}`}
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
    </main>
  )
}
