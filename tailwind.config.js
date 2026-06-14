/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // All colors reference CSS custom properties — themes swap the vars, classes stay the same
      colors: {
        base:           'var(--color-base)',
        panel:          'var(--color-panel)',
        'panel-border': 'var(--color-panel-border)',
        'panel-hover':  'var(--color-panel-hover)',
        accent:         'var(--color-accent)',
        'accent-dim':   'var(--color-accent-dim)',
        'accent-glow':  'var(--color-accent-glow)',
        warning:        'var(--color-warning)',
        'warning-dim':  'var(--color-warning-dim)',
        success:        'var(--color-success)',
        'success-dim':  'var(--color-success-dim)',
        error:          'var(--color-error)',
        'error-dim':    'var(--color-error-dim)',
        primary:        'var(--color-primary)',
        secondary:      'var(--color-secondary)',
        dim:            'var(--color-dim)',
        muted:          'var(--color-muted)',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        panel: '4px',
        badge: '3px',
        bar:   '2px',
      },
      keyframes: {
        stepEntrance: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
      },
      animation: {
        'step-entrance': 'stepEntrance 150ms ease-out forwards',
        'live-pulse':    'livePulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
