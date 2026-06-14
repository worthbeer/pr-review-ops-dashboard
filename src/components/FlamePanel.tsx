'use client'

import type { Category } from '@/types'
import { CATEGORIES } from '@/mocks/findings'

const barColorClass: Record<Category['color'], string> = {
  error:   'bg-error',
  warning: 'bg-warning',
  accent:  'bg-accent',
  success: 'bg-success',
}

const textColorClass: Record<Category['color'], string> = {
  error:   'text-error',
  warning: 'text-warning',
  accent:  'text-accent',
  success: 'text-success',
}

interface Props {
  sessionDone: boolean
  execMode:    boolean
  className?:  string
}

export function FlamePanel({ sessionDone, execMode, className = '' }: Props) {
  const maxHits = Math.max(...CATEGORIES.map(c => c.hits), 1)

  return (
    <section className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}>
      <div className="shrink-0 px-3 py-2 border-b border-panel-border">
        <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">
          {execMode ? 'Issue Category Breakdown' : 'Analysis Category · Hit Rate'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {CATEGORIES.map((cat, i) => {
          const pct = (cat.hits / maxHits) * 100
          return (
            <div key={cat.label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-sans text-xs ${cat.hits > 0 ? 'text-primary' : 'text-dim'}`}>
                  {cat.label}
                </span>
                <span className={`font-mono text-[10px] ${textColorClass[cat.color]}`}>
                  {cat.hits > 0 ? `${cat.hits} issue${cat.hits > 1 ? 's' : ''}` : 'clean'}
                </span>
              </div>
              <div className="h-2.5 rounded-bar overflow-hidden bg-panel-border">
                <div
                  className={`h-full rounded-bar transition-[width] duration-500 ${barColorClass[cat.color]}`}
                  style={{
                    width:           sessionDone ? `${pct}%` : '0%',
                    transitionDelay: `${i * 80}ms`,
                    opacity:         cat.hits > 0 ? 1 : 0.3,
                  }}
                />
              </div>
              {!execMode && cat.maxMs > 0 && (
                <p className="mt-0.5 font-mono text-[9px] text-dim">peak scan {cat.maxMs}ms</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
