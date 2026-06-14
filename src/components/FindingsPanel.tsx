'use client'

import { useEffect, useState } from 'react'
import type { Finding } from '@/types'
import { FINDINGS } from '@/mocks/findings'

interface Props {
  sessionDone: boolean
  execMode:    boolean
  className?:  string
}

const severityConfig: Record<Finding['severity'], {
  label:       string
  textClass:   string
  borderClass: string
  bgClass:     string
}> = {
  critical: { label: '🔴 CRITICAL', textClass: 'text-error',   borderClass: 'border-error',   bgClass: 'bg-error-dim'   },
  warning:  { label: '🟡 WARNING',  textClass: 'text-warning', borderClass: 'border-warning', bgClass: 'bg-warning-dim' },
  info:     { label: '🔵 INFO',     textClass: 'text-accent',  borderClass: 'border-accent',  bgClass: 'bg-accent-dim'  },
}

export function FindingsPanel({ sessionDone, execMode, className = '' }: Props) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!sessionDone) {
      setVisibleCount(0)
      return
    }
    let count = 0
    const id = setInterval(() => {
      count++
      setVisibleCount(count)
      if (count >= FINDINGS.length) clearInterval(id)
    }, 300)
    return () => clearInterval(id)
  }, [sessionDone])

  const criticalCount = FINDINGS.filter(f => f.severity === 'critical').length

  return (
    <section className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}>
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">Findings</span>
        {visibleCount > 0 && (
          <span className="font-mono text-xs text-error tabular-nums">
            {criticalCount} critical
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {visibleCount === 0 ? (
          <p className="font-mono text-xs text-muted">
            {sessionDone ? 'No findings' : 'Run a review to see findings'}
          </p>
        ) : (
          FINDINGS.slice(0, visibleCount).map((f, i) => {
            const sev = severityConfig[f.severity]
            return (
              <div
                key={i}
                className={`animate-step-entrance border rounded-panel p-3 bg-panel ${sev.borderClass}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-badge ${sev.bgClass} ${sev.textClass}`}>
                    {sev.label}
                  </span>
                  {!execMode && (
                    <span className="font-mono text-[9px] text-dim">{f.category}</span>
                  )}
                </div>
                <p className="font-sans text-xs font-bold text-primary mb-1">{f.title}</p>
                <p className="font-mono text-[10px] text-accent mb-2">{f.file}</p>
                <p className="font-sans text-xs text-secondary leading-relaxed">
                  {execMode ? f.execImpact : f.description}
                </p>
                {!execMode && (
                  <div className="mt-2 px-2 py-1 rounded-badge bg-accent-dim">
                    <span className="font-mono text-[9px] text-accent">{f.techDetail}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
