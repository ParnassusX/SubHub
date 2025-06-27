import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initializeServiceWorker } from './utils/serviceWorker'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize service worker for production performance optimization
if (process.env.NODE_ENV === 'production') {
  initializeServiceWorker()
}
