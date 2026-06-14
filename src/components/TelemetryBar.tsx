import { ThemeSwitcher } from './ThemeSwitcher'
import type { TelemetryState } from '@/types'

interface Props {
  telemetry: TelemetryState
  isDemo:    boolean
  execMode:  boolean
}

function Metric({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <span className="text-dim tracking-widest">{label}</span>
      <span className="text-primary tabular-nums">{value}</span>
    </span>
  )
}

export function TelemetryBar({ telemetry, isDemo, execMode }: Props) {
  const latencyValue = execMode
    ? `${(telemetry.avgLatencyMs / 1000).toFixed(2)}s`
    : `${telemetry.avgLatencyMs}ms`

  return (
    <header className="shrink-0 border-b border-panel-border bg-panel px-3 sm:px-4 py-2">
      <div className="flex items-center justify-between gap-3 font-mono text-xs">

        {/* Left: metrics — core always visible, extended hidden on mobile */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Metric label={execMode ? 'REVIEWS' : 'ACTIVE'} value={String(telemetry.activeReviews)} />
          <Metric label="QUEUED" value={String(telemetry.queueDepth)} />
          <Metric label={execMode ? 'AVG TIME' : 'LATENCY'} value={latencyValue} className="hidden sm:flex" />
          {!execMode && (
            <Metric label="RPM" value={String(telemetry.throughputRpm)} className="hidden md:flex" />
          )}
        </div>

        {/* Right: theme switcher + live indicator + mode badge */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <ThemeSwitcher />
          <span className="flex items-center gap-1.5 text-success">
            <span className="animate-live-pulse">●</span>
            <span className="tracking-widest hidden sm:inline">LIVE</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-badge tracking-widest text-xs border ${
              isDemo
                ? 'bg-warning-dim text-warning border-warning'
                : 'bg-accent-dim text-accent border-accent'
            }`}
          >
            {isDemo ? 'DEMO' : 'LIVE'}
          </span>
        </div>

      </div>
    </header>
  )
}
