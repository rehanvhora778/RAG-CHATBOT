import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * Theme provider.
 *
 * The product is dark-first (premium AI SaaS aesthetic) and the *signed-in app*
 * is styled with unconditional dark classes, so it always renders dark. The
 * public marketing + auth pages opt into light mode via Tailwind `dark:`
 * variants, so flipping the `dark` class on <html> only affects those pages.
 *
 * Preference is persisted to localStorage and defaults to dark.
 */
const ThemeContext = createContext({
  theme: 'dark',
  dark: true,
  toggle: () => {},
  setTheme: () => {},
})

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    try { localStorage.setItem('theme', theme) } catch (_) {}
  }, [theme])

  const setTheme = useCallback(t => setThemeState(t === 'light' ? 'light' : 'dark'), [])
  const toggle = useCallback(() => setThemeState(t => (t === 'dark' ? 'light' : 'dark')), [])

  return (
    <ThemeContext.Provider value={{ theme, dark: theme === 'dark', toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
