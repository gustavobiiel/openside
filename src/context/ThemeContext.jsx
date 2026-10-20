import { createContext, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'planck-theme'

const ThemeContext = createContext(null)

function getStoredDarkMode() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark'
  } catch {
    return false
  }
}

function applyTheme(darkMode) {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
}

export function initTheme() {
  applyTheme(getStoredDarkMode())
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => getStoredDarkMode())

  useEffect(() => {
    applyTheme(darkMode)
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
    } catch {
      // ignore storage errors
    }
  }, [darkMode])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
