import { createContext, useContext, useEffect } from 'react'

/**
 * The product is dark-first (premium AI SaaS aesthetic), so the theme is
 * locked to dark. We keep this provider/hook so existing imports keep working
 * and a future light theme can slot in without touching consumers.
 */
const ThemeContext = createContext({ dark: true, toggle: () => {} })

export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  return (
    <ThemeContext.Provider value={{ dark: true, toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
