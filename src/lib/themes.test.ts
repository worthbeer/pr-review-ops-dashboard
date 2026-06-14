import { describe, it, expect, vi } from 'vitest'
import { themes, DEFAULT_THEME, getThemeById, applyTheme } from './themes'

const REQUIRED_VARS = [
  '--color-base',
  '--color-panel',
  '--color-panel-border',
  '--color-panel-hover',
  '--color-accent',
  '--color-accent-dim',
  '--color-accent-glow',
  '--color-warning',
  '--color-warning-dim',
  '--color-success',
  '--color-success-dim',
  '--color-error',
  '--color-error-dim',
  '--color-primary',
  '--color-secondary',
  '--color-dim',
  '--color-muted',
]

describe('themes', () => {

  // ── Theme registry ───────────────────────────────────────────────────────

  it('exports exactly four themes', () => {
    expect(themes).toHaveLength(4)
  })

  it('theme ids are the four expected values', () => {
    const ids = themes.map(t => t.id)
    expect(ids).toEqual(['void', 'dusk', 'ember', 'forest'])
  })

  it('every theme defines all 17 required CSS variable keys', () => {
    themes.forEach(theme => {
      REQUIRED_VARS.forEach(varName => {
        expect(
          theme.vars[varName],
          `Theme "${theme.id}" is missing ${varName}`
        ).toBeDefined()
      })
    })
  })

  it('every theme variable value is a non-empty string', () => {
    themes.forEach(theme => {
      Object.entries(theme.vars).forEach(([key, value]) => {
        expect(
          typeof value === 'string' && value.length > 0,
          `Theme "${theme.id}" has empty value for ${key}`
        ).toBe(true)
      })
    })
  })

  it('each theme has a dotColor defined', () => {
    themes.forEach(theme => {
      expect(theme.dotColor).toBeTruthy()
    })
  })

  // ── DEFAULT_THEME ────────────────────────────────────────────────────────

  it('DEFAULT_THEME is the Void theme', () => {
    expect(DEFAULT_THEME.id).toBe('void')
  })

  it('DEFAULT_THEME is a reference to the first theme in the array', () => {
    expect(DEFAULT_THEME).toBe(themes[0])
  })

  // ── getThemeById ─────────────────────────────────────────────────────────

  it('returns the correct theme for each known id', () => {
    expect(getThemeById('void').id).toBe('void')
    expect(getThemeById('dusk').id).toBe('dusk')
    expect(getThemeById('ember').id).toBe('ember')
    expect(getThemeById('forest').id).toBe('forest')
  })

  it('returns DEFAULT_THEME for an unknown id — no crash', () => {
    expect(getThemeById('unknown')).toBe(DEFAULT_THEME)
  })

  it('returns DEFAULT_THEME for an empty string', () => {
    expect(getThemeById('')).toBe(DEFAULT_THEME)
  })

  // ── applyTheme ───────────────────────────────────────────────────────────

  it('sets all CSS variables on document.documentElement', () => {
    applyTheme(themes[0])

    REQUIRED_VARS.forEach(varName => {
      const value = document.documentElement.style.getPropertyValue(varName)
      expect(value, `Expected ${varName} to be set`).toBeTruthy()
      expect(value).toBe(themes[0].vars[varName])
    })
  })

  it('overwrites previously set variables when switching themes', () => {
    applyTheme(themes[0]) // Void — accent is #00D4FF
    applyTheme(themes[1]) // Dusk — accent is #818CF8

    const accent = document.documentElement.style.getPropertyValue('--color-accent')
    expect(accent).toBe(themes[1].vars['--color-accent'])
    expect(accent).not.toBe(themes[0].vars['--color-accent'])
  })

  it('applies all four themes without throwing', () => {
    expect(() => {
      themes.forEach(theme => applyTheme(theme))
    }).not.toThrow()
  })
})
