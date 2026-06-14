import { TraceStep } from './TraceStep'
import type { TraceStep as TraceStepType } from '@/types'

interface Props {
  steps:      TraceStepType[]
  className?: string
}

export function TracePanel({ steps, className = '' }: Props) {
  return (
    <section
      className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}
    >
      {/* Panel header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">
          Tool Trace
        </span>
        <span className="font-mono text-xs text-dim tabular-nums">
          {steps.length}/6
        </span>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        {steps.length === 0 ? (
          <p className="font-mono text-xs text-muted px-3 py-2">
            No tools executed yet
          </p>
        ) : (
          steps.map((step, i) => (
            <TraceStep key={step.id} step={step} index={i} />
          ))
        )}
      </div>
    </section>
  )
}
