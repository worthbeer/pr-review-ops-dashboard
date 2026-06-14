'use client'

import { useEffect, useState } from 'react'
import { themes, applyTheme, getThemeById, DEFAULT_THEME } from '@/lib/themes'
import type { ThemeId } from '@/lib/themes'

const STORAGE_KEY = 'pr-dash-theme'

export function ThemeSwitcher() {
  const [activeId, setActiveId] = useState<ThemeId>(DEFAULT_THEME.id)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const theme = saved ? getThemeById(saved) : DEFAULT_THEME
      applyTheme(theme)
      setActiveId(theme.id)
    } catch {
      // localStorage unavailable (private browsing, quota)
    }
  }, [])

  const switchTheme = (id: ThemeId) => {
    const theme = getThemeById(id)
    applyTheme(theme)
    setActiveId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // QuotaExceededError or private browsing restriction
    }
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Color theme">
      {themes.map(theme => {
        const isActive = activeId === theme.id
        return (
          <button
            key={theme.id}
            onClick={() => switchTheme(theme.id)}
            aria-label={`${theme.name} theme${isActive ? ' (active)' : ''}`}
            aria-pressed={isActive}
            className="w-3.5 h-3.5 rounded-full transition-all duration-200 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            style={{
              backgroundColor: theme.dotColor,
              boxShadow: isActive
                ? `0 0 0 1.5px var(--color-base), 0 0 0 3px ${theme.dotColor}`
                : 'none',
              transform: isActive ? 'scale(1.15)' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
