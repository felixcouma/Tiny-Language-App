import { useState } from 'react'
import { useStore } from '../store'
import Mascot from '../components/Mascot.jsx'
import { HomeIcon } from '../components/Icons.jsx'
import './ProfilePicker.css'

export default function ProfilePickerScreen() {
  const profiles = useStore((s) => s.profiles)
  const setActiveProfile = useStore((s) => s.setActiveProfile)
  const addProfile = useStore((s) => s.addProfile)
  const goHome = useStore((s) => s.goHome)
  const activeProfileId = useStore((s) => s.activeProfileId)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const submit = () => {
    const n = name.trim()
    if (!n) return
    const id = addProfile(n)
    setName('')
    setAdding(false)
    setActiveProfile(id)
  }

  return (
    <div className="scene picker">
      {activeProfileId && (
        <button className="round-btn picker-home" onClick={goHome} aria-label="Back to home">
          <HomeIcon size={26} />
        </button>
      )}
      <div className="picker-inner">
        <div className="picker-greet">
          <Mascot size={64} />
          <h1 className="picker-title">Who&rsquo;s playing?</h1>
        </div>

        <div className="picker-grid">
          {profiles.map((p) => (
            <button key={p.id} className="pick-card" onClick={() => setActiveProfile(p.id)}>
              <span className="pick-avatar" style={{ background: p.color }}>
                {p.guest ? <HomeIcon size={38} /> : p.initials || p.name[0]?.toUpperCase()}
              </span>
              <span className="pick-name">{p.name}</span>
            </button>
          ))}

          {adding ? (
            <div className="pick-card">
              <input
                className="pick-input"
                autoFocus
                placeholder="Name"
                maxLength={12}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
              <button className="pick-go" onClick={submit}>
                Start
              </button>
            </div>
          ) : (
            <button className="pick-card pick-add" onClick={() => setAdding(true)}>
              <span className="pick-avatar pick-plus">＋</span>
              <span className="pick-name">Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
