import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const THEME_STORAGE_KEY = 'up4life-theme'

const getInitialTheme = (): Theme =>
  localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
