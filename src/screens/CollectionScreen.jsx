import { useStore, WORLDS } from '../store'
import { playItem } from '../lib/audio'
import ItemVisual from '../components/ItemVisual.jsx'
import Mascot from '../components/Mascot.jsx'
import { HomeIcon } from '../components/Icons.jsx'
import './Collection.css'

/* Sticker book: every word heard becomes a "friend" the child collects. Gentle
   progress they can SEE — no scores, no streaks. Tap a found friend to hear it. */
export default function CollectionScreen() {
  const goHome = useStore((s) => s.goHome)
  const collected = useStore((s) => s.progress.collected || {})

  const totalCollected = Object.keys(collected).length
  const totalItems = WORLDS.reduce((n, w) => n + w.items.length, 0)

  return (
    <div className="collection">
      <header className="coll-header">
        <button className="icon-btn" onClick={goHome} aria-label="Home">
          <HomeIcon size={24} />
        </button>
        <h2 className="coll-title">My Collection</h2>
        <span style={{ minWidth: 44 }} />
      </header>

      <div className="coll-summary">
        <Mascot size={56} />
        <p className="coll-count">
          <b>{totalCollected}</b> of {totalItems} friends found
        </p>
      </div>

      <main className="coll-main">
        {WORLDS.map((w) => {
          const done = w.items.filter((it) => collected[it.word]).length
          const complete = done === w.items.length && done > 0
          return (
            <section key={w.id} className="coll-world">
              <div className="coll-world-head">
                <span className="coll-world-name">{w.name}</span>
                <span className={`coll-world-count ${complete ? 'is-complete' : ''}`}>
                  {complete ? '★ Complete!' : `${done} / ${w.items.length}`}
                </span>
              </div>
              <div className="coll-grid">
                {w.items.map((it) =>
                  collected[it.word] ? (
                    <button
                      key={it.word}
                      className="coll-tile is-found"
                      onClick={() => playItem(it)}
                      aria-label={it.word}
                    >
                      <span className="coll-thumb">
                        <ItemVisual item={it} kind="choice" />
                      </span>
                      <span className="coll-tile-name">{it.word}</span>
                    </button>
                  ) : (
                    <div key={it.word} className="coll-tile is-locked" aria-label="Not found yet">
                      <span className="coll-q">?</span>
                    </div>
                  ),
                )}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
