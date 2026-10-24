import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/useTheme'

export default function ThemeToggle({ className = '' }) {
  const { resolved, toggle } = useTheme()
  const isDark = resolved === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={isDark}
      title={`Switch to ${nextTheme} mode`}
      onClick={toggle}
      className={`theme-toggle ${isDark ? 'is-dark' : 'is-light'} ${className}`}
    >
      {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
    </button>
  )
}
