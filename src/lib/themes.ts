export type ThemeId = 'void' | 'dusk' | 'ember' | 'forest'

export interface Theme {
  id:       ThemeId
  name:     string
  dotColor: string   // color shown in the theme picker dot
  vars: Record<string, string>
}

export const themes: Theme[] = [
  {
    id:       'void',
    name:     'Void',
    dotColor: '#00D4FF',
    vars: {
      '--color-base':         '#0A0C10',
      '--color-panel':        '#13171F',
      '--color-panel-border': '#1E2430',
      '--color-panel-hover':  '#171C26',
      '--color-accent':       '#00D4FF',
      '--color-accent-dim':   '#00D4FF1A',
      '--color-accent-glow':  '#00D4FF33',
      '--color-warning':      '#F5A623',
      '--color-warning-dim':  '#F5A6231A',
      '--color-success':      '#22C55E',
      '--color-success-dim':  '#22C55E1A',
      '--color-error':        '#EF4444',
      '--color-error-dim':    '#EF44441A',
      '--color-primary':      '#E8EDF2',
      '--color-secondary':    '#8896A7',
      '--color-dim':          '#4A5568',
      '--color-muted':        '#2D3748',
    },
  },
  {
    id:       'dusk',
    name:     'Dusk',
    dotColor: '#818CF8',
    vars: {
      '--color-base':         '#0B0D1A',
      '--color-panel':        '#13172A',
      '--color-panel-border': '#232847',
      '--color-panel-hover':  '#1A1F3A',
      '--color-accent':       '#818CF8',
      '--color-accent-dim':   '#818CF81A',
      '--color-accent-glow':  '#818CF833',
      '--color-warning':      '#FB923C',
      '--color-warning-dim':  '#FB923C1A',
      '--color-success':      '#34D399',
      '--color-success-dim':  '#34D3991A',
      '--color-error':        '#F87171',
      '--color-error-dim':    '#F871711A',
      '--color-primary':      '#DEE0F5',
      '--color-secondary':    '#8485A8',
      '--color-dim':          '#484B6E',
      '--color-muted':        '#282B4A',
    },
  },
  {
    id:       'ember',
    name:     'Ember',
    dotColor: '#F59E0B',
    vars: {
      '--color-base':         '#120F0A',
      '--color-panel':        '#1D1910',
      '--color-panel-border': '#332C1F',
      '--color-panel-hover':  '#252018',
      '--color-accent':       '#F59E0B',
      '--color-accent-dim':   '#F59E0B1A',
      '--color-accent-glow':  '#F59E0B33',
      '--color-warning':      '#FB923C',
      '--color-warning-dim':  '#FB923C1A',
      '--color-success':      '#4ADE80',
      '--color-success-dim':  '#4ADE801A',
      '--color-error':        '#FC8181',
      '--color-error-dim':    '#FC81811A',
      '--color-primary':      '#EDE8DC',
      '--color-secondary':    '#9A8B73',
      '--color-dim':          '#5C5040',
      '--color-muted':        '#3A3028',
    },
  },
  {
    id:       'forest',
    name:     'Forest',
    dotColor: '#34D399',
    vars: {
      '--color-base':         '#090F0B',
      '--color-panel':        '#101A12',
      '--color-panel-border': '#1A2E1E',
      '--color-panel-hover':  '#152019',
      '--color-accent':       '#34D399',
      '--color-accent-dim':   '#34D3991A',
      '--color-accent-glow':  '#34D39933',
      '--color-warning':      '#FCD34D',
      '--color-warning-dim':  '#FCD34D1A',
      '--color-success':      '#86EFAC',
      '--color-success-dim':  '#86EFAC1A',
      '--color-error':        '#FCA5A5',
      '--color-error-dim':    '#FCA5A51A',
      '--color-primary':      '#DDEEE3',
      '--color-secondary':    '#6B8A74',
      '--color-dim':          '#3A5440',
      '--color-muted':        '#1E3228',
    },
  },
]

export const DEFAULT_THEME = themes[0]

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
}

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) ?? DEFAULT_THEME
}
