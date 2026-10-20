import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initTheme, ThemeProvider } from './context/ThemeContext'
import './styles/global.css'

if (new URLSearchParams(window.location.search).get('modo') === 'fury') {
  window.location.replace(`${import.meta.env.BASE_URL}fury.html`)
} else {
  initTheme()

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  )
}
