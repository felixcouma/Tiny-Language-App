import { useState } from 'react'
import './ParentGate.css'

/* A quick grown-up gate: answer a small sum to reach parent controls. Keeps
   toddler fingers out without needing a stored PIN. */
function makeChallenge() {
  const a = 3 + Math.floor(Math.random() * 6) // 3..8
  const b = 2 + Math.floor(Math.random() * 6) // 2..7
  return { a, b, answer: a + b }
}

export default function ParentGate({ title = 'For grown-ups', onPass, onCancel }) {
  const [ch, setCh] = useState(makeChallenge)
  const [val, setVal] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = () => {
    if (Number(val) === ch.answer) {
      onPass()
    } else {
      setWrong(true)
      setCh(makeChallenge())
      setVal('')
    }
  }

  return (
    <div className="gate-overlay" onClick={onCancel}>
      <div className="gate-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="gate-title">{title}</h3>
        <p className="gate-q">
          What is <b>{ch.a} + {ch.b}</b>?
        </p>
        <input
          className={`gate-input ${wrong ? 'is-wrong' : ''}`}
          type="number"
          inputMode="numeric"
          autoFocus
          value={val}
          onChange={(e) => {
            setVal(e.target.value)
            setWrong(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          aria-label="Answer"
        />
        {wrong && <p className="gate-hint">Not quite — try the new sum.</p>}
        <div className="gate-actions">
          <button className="gate-btn gate-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="gate-btn gate-go" onClick={submit}>
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}
