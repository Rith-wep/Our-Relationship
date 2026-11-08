import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const storageKey = 'our-little-universe-theme'

function getInitialTheme(): Theme {
  const saved = window.localStorage.getItem(storageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeToggle({
  variant = 'icon',
}: {
  variant?: 'icon' | 'setting'
}) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(storageKey, theme)
    const themeColor =
      theme === 'dark'
        ? '#111827'
        : getComputedStyle(document.documentElement)
            .getPropertyValue('--color-background')
            .trim() || '#ffffff'
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor)
  }, [theme])

  const isDark = theme === 'dark'

  if (variant === 'setting') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark appearance"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="flex min-h-16 w-full items-center gap-3 border-b border-border px-4 text-left"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-primary shadow-soft">
          {isDark ? (
            <Sun aria-hidden="true" className="size-5" />
          ) : (
            <Moon aria-hidden="true" className="size-5" />
          )}
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold">Appearance</span>
        <span
          aria-hidden="true"
          className={`relative h-8 w-14 shrink-0 rounded-full shadow-inner ring-1 ring-black/10 transition-colors motion-reduce:transition-none ${isDark ? 'bg-primary' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow-md transition-transform duration-200 motion-reduce:transition-none ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
          />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-primary shadow-soft transition-colors hover:bg-primary-soft hover:text-primary-strong motion-reduce:transition-none"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-5" />
      ) : (
        <Moon aria-hidden="true" className="size-5" />
      )}
    </button>
  )
}

export function ThemeInitializer() {
  useEffect(() => {
    const theme = getInitialTheme()
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    const themeColor =
      theme === 'dark'
        ? '#111827'
        : getComputedStyle(document.documentElement)
            .getPropertyValue('--color-background')
            .trim() || '#ffffff'
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor)
  }, [])

  return null
}
