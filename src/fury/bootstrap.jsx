import React from 'react'
import ReactDOM from 'react-dom/client'
import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import '@astryxdesign/theme-neutral/theme.css'
import './fury.css'
import {FuryThemeProvider} from './themeMode'
import ShellSideNav from '../app/shell-side-nav/page'
import LoginSSO from '../app/login-sso/page'

document.title = 'Modo Fury'

const AUTH_KEY = 'fury-auth'
const TOUR_AFTER_LOGIN_KEY = 'fury-tour-after-login'
const TOUR_DONE_KEY = 'fury-first-access-tour'

function FuryApp() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => sessionStorage.getItem(AUTH_KEY) === '1',
  )

  const handleLogin = () => {
    sessionStorage.setItem(AUTH_KEY, '1')
    try {
      if (localStorage.getItem(TOUR_DONE_KEY) !== '1') {
        sessionStorage.setItem(TOUR_AFTER_LOGIN_KEY, '1')
      }
    } catch {
      sessionStorage.setItem(TOUR_AFTER_LOGIN_KEY, '1')
    }
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginSSO onSuccess={handleLogin} />
  }
  return <ShellSideNav onLogout={handleLogout} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FuryThemeProvider>
      <FuryApp />
    </FuryThemeProvider>
  </React.StrictMode>,
)
