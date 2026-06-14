// lib/tokens.ts
// Single source of truth for all design values.
// Never use raw hex values in components — always reference these.

export const tokens = {
  // ─── Color ────────────────────────────────────────────────────────────────
  color: {
    base:         '#0A0C10',   // page background
    panel:        '#13171F',   // card/panel background
    panelBorder:  '#1E2430',   // subtle panel borders
    panelHover:   '#171C26',   // panel hover state

    accent:       '#00D4FF',   // live/streaming state, active indicators
    accentDim:    '#00D4FF22', // accent background wash
    accentGlow:   '#00D4FF44', // accent for timing bar running state

    warning:      '#F5A623',   // tool step warnings, retries
    warningDim:   '#F5A62322',

    success:      '#22C55E',   // completed steps
    successDim:   '#22C55E22',

    error:        '#EF4444',   // error states
    errorDim:     '#EF444422',

    textPrimary:  '#E8EDF2',   // data and content text
    textSecondary:'#8896A7',   // secondary labels
    textDim:      '#4A5568',   // chrome, timestamps, muted
    textMuted:    '#2D3748',   // very muted — placeholder text

    liveDot:      '#22C55E',   // the ● LIVE indicator
  },

  // ─── Typography ───────────────────────────────────────────────────────────
  font: {
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    sans: "'Inter', system-ui, -apple-system, sans-serif",
  },

  // ─── Spacing ──────────────────────────────────────────────────────────────
  space: {
    panelPad:   '16px',
    panelGap:   '12px',
    stepPad:    '10px 12px',
  },

  // ─── Border radius ────────────────────────────────────────────────────────
  radius: {
    panel:  '4px',   // panels — tight, terminal aesthetic
    badge:  '3px',   // status badges
    bar:    '2px',   // timing bars
  },

  // ─── Timing ───────────────────────────────────────────────────────────────
  duration: {
    stepEntrance: '150ms',   // TraceStep fade-in
    barFill:      'linear',  // timing bar CSS transition (dynamic width from durationMs)
    livePulse:    '2s',      // ● LIVE indicator pulse
    cursorBlink:  '1s',      // stream cursor blink
  },

  // ─── Telemetry ────────────────────────────────────────────────────────────
  telemetry: {
    tickMs:       3000,       // how often telemetry ticks
    maxLatencyMs: 600,        // ceiling for latency display normalization
  },

  // ─── Mock replay ──────────────────────────────────────────────────────────
  mock: {
    tokenDelayMs:       18,   // base delay between tokens
    punctuationPauseMs: 60,   // extra pause at sentence boundaries
    toolStepGapMs:      500,  // delay between tool_start and tool_complete
  },

  // ─── Timing bar ───────────────────────────────────────────────────────────
  timingBar: {
    maxDurationMs: 500,       // 500ms = full bar width
    height:        '3px',
    trackColor:    '#1E2430',
  },
} as const

export type Tokens = typeof tokens
