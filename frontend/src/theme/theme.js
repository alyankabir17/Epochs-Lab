export const THEME_KEY = 'epochs_theme'
const DOCUMENTED_THEME_KEY = 'epochslab-theme'

export function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_KEY) || window.localStorage.getItem(DOCUMENTED_THEME_KEY)
    return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function getInitialTheme() {
  const stored = getStoredTheme()
  return stored === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : stored
}

export function persistTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

export function applyTheme(theme, { persist = true } = {}) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  if (persist) persistTheme(theme)
}
