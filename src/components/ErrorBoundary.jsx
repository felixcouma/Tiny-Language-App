import { Component } from 'react'
import Mascot from './Mascot.jsx'
import './ErrorBoundary.css'

/* Catches any render/runtime error so a toddler/parent sees a friendly "start
   again" instead of a blank white screen. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err, info) {
    // Surface for debugging; never shown to the child.
    console.error('TinyVoice error:', err, info)
  }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="app-shell">
        <div className="errbox">
          <Mascot size={96} />
          <h2 className="errbox-title">Oops!</h2>
          <p className="errbox-sub">Pip tripped over something. Let&rsquo;s start again.</p>
          <button className="chunky errbox-btn" onClick={() => window.location.reload()}>
            Start again
          </button>
        </div>
      </div>
    )
  }
}
