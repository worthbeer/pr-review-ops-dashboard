'use client'

import { METRICS_HISTORY } from '@/mocks/findings'

interface Props {
  execMode:   boolean
  className?: string
}

export function MetricsPanel({ execMode, className = '' }: Props) {
  const maxPRs     = Math.max(...METRICS_HISTORY.map(d => d.prs))
  const maxLatency = Math.max(...METRICS_HISTORY.map(d => d.latency))

  return (
    <section className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}>
      <div className="shrink-0 px-3 py-2 border-b border-panel-border">
        <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">
          {execMode ? 'Weekly Performance Summary' : 'PR Volume + Latency · 7-Day'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">

        {/* PRs per day */}
        <div>
          <p className="font-mono text-xs text-secondary mb-2">
            {execMode ? 'PRs Processed' : 'PRs / Day'}
          </p>
          <div className="flex items-end gap-1.5 h-20">
            {METRICS_HISTORY.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full flex flex-col justify-end h-14">
                  {d.criticals > 0 && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[8px] text-error font-bold">
                      {d.criticals}
                    </span>
                  )}
                  <div
                    className={`w-full rounded-sm ${d.criticals > 5 ? 'bg-warning' : 'bg-accent'}`}
                    style={{ height: `${(d.prs / maxPRs) * 56}px` }}
                  />
                </div>
                <span className="font-mono text-[8px] text-dim">{d.label}</span>
              </div>
            ))}
          </div>
          {!execMode && (
            <p className="font-mono text-[9px] text-dim mt-1">Red numbers = critical issues found that day</p>
          )}
        </div>

        {/* Latency sparkline */}
        <div>
          <p className="font-mono text-xs text-secondary mb-2">
            {execMode ? 'Response Time Trend' : 'Avg Latency (ms)'}
          </p>
          <div className="flex items-end gap-1.5 h-14">
            {METRICS_HISTORY.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-10">
                  <div
                    className={`w-full rounded-sm ${d.latency > 300 ? 'bg-warning' : 'bg-success'}`}
                    style={{ height: `${(d.latency / maxLatency) * 40}px` }}
                  />
                </div>
                <span className="font-mono text-[8px] text-dim">{d.latency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: execMode ? 'Wk Total'     : 'PRs This Week', value: '291' },
            { label: execMode ? 'Issues Found' : 'Total Issues',  value: '36'  },
            { label: execMode ? 'SLA Met'      : 'Under 400ms',   value: '94%' },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-panel border border-panel-border rounded-panel text-center">
              <p className="font-mono text-sm font-bold text-primary tabular-nums">{s.value}</p>
              <p className="font-mono text-[9px] text-dim mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
