'use client'

import { memo, useEffect, useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { tokens } from '@/lib/tokens'
import type { TraceStep as TraceStepType } from '@/types'

interface Props {
  step:  TraceStepType
  index: number
}

const barColorClass: Record<string, string> = {
  running:  'bg-accent',
  complete: 'bg-success',
  error:    'bg-error',
  pending:  'bg-dim',
}

export const TraceStep = memo(function TraceStep({ step, index }: Props) {
  const [barWidth, setBarWidth] = useState('0%')

  useEffect(() => {
    if (step.status === 'complete' && step.durationMs != null) {
      const pct = Math.min((step.durationMs / tokens.timingBar.maxDurationMs) * 100, 100)
      setBarWidth(`${pct}%`)
    } else if (step.status === 'error') {
      setBarWidth('100%')
    } else {
      setBarWidth('0%')
    }
  }, [step.status, step.durationMs])

  const durationLabel =
    step.durationMs != null
      ? `${step.durationMs}ms`
      : step.status === 'running'
      ? '...'
      : ''

  const inputLabel = step.input
    ? Object.entries(step.input)
        .map(([k, v]) => `${k}: ${String(v).slice(0, 32)}`)
        .join(', ')
    : null

  return (
    <div className="animate-step-entrance border-b border-panel-border last:border-b-0">
      <div className="px-3 py-2">

        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs text-dim shrink-0 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs text-primary truncate">
              {step.tool}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-dim tabular-nums">{durationLabel}</span>
            <StatusBadge status={step.status} />
          </div>
        </div>

        {/* Input params */}
        {inputLabel && (
          <p className="mt-0.5 font-mono text-xs text-dim truncate pl-6">{inputLabel}</p>
        )}

        {/* Output summary */}
        {step.outputSummary && step.status === 'complete' && (
          <p className="mt-0.5 font-mono text-xs text-secondary truncate pl-6">
            {step.outputSummary}
          </p>
        )}

        {/* Timing bar — color driven by CSS vars so themes apply automatically */}
        <div
          className="mt-2 rounded-bar overflow-hidden bg-panel-border"
          style={{ height: tokens.timingBar.height }}
        >
          <div
            className={`h-full rounded-bar transition-colors duration-200 ${barColorClass[step.status] ?? 'bg-dim'}`}
            style={{
              width:      barWidth,
              transition: step.durationMs != null
                ? `width ${step.durationMs}ms linear`
                : 'none',
            }}
          />
        </div>

      </div>
    </div>
  )
})
