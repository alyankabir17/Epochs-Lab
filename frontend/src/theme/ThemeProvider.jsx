import { useCallback, useEffect, useMemo, useState } from 'react'
import { applyTheme, getStoredTheme, persistTheme, THEME_KEY } from './theme'
import { ThemeContext } from './ThemeContext'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  const setTheme = useCallback((nextTheme) => {
    persistTheme(nextTheme)
    setThemeState(nextTheme)
  }, [])

  useEffect(() => {
    applyTheme(resolved, { persist: false })

    if (theme !== 'system') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(media.matches)
    media.addEventListener?.('change', onChange)
    return () => media.removeEventListener?.('change', onChange)
  }, [theme, resolved])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== THEME_KEY && event.key !== 'epochslab-theme') return
      setThemeState(getStoredTheme())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setTheme])

  const value = useMemo(() => ({ theme, resolved, setTheme, toggle }), [theme, resolved, setTheme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
