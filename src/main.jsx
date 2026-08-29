import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { lockZoom } from './lib/lockZoom.js'

// The service worker is registered via useRegisterSW() in UpdatePrompt, so it
// can surface a "new version ready" toast (see src/components/UpdatePrompt.jsx).

// Freeze the app at 1× so toddlers can't accidentally pinch/double-tap zoom the
// content off-screen (iOS Safari ignores the viewport meta for this).
lockZoom()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
