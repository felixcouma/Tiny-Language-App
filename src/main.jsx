import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// The service worker is registered via useRegisterSW() in UpdatePrompt, so it
// can surface a "new version ready" toast (see src/components/UpdatePrompt.jsx).

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
