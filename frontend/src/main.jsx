import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './i18n.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      {/* Suspense lets react-i18next delay render until i18n is initialized */}
      <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', fontFamily: 'sans-serif' }}>Loading...</div>}>
        <App />
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>,
)
