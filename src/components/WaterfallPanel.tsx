'use client'

import type { TraceStep, ToolName } from '@/types'

const TOOL_LABELS: Record<ToolName, string> = {
  fetch_pr_diff:          'Fetch PR Diff',
  analyze_file_structure: 'Analyze File Structure',
  check_type_safety:      'Check Type Safety',
  scan_runtime_risks:     'Scan Runtime Risks',
  assess_performance:     'Assess Performance',
  generate_summary:       'Generate Summary',
}

interface Props {
  steps:      TraceStep[]
  execMode:   boolean
  className?: string
}

export function WaterfallPanel({ steps, execMode, className = '' }: Props) {
  const header = (
    <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-panel-border">
      <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">
        {execMode ? 'Analysis Pipeline Timeline' : 'Tool-Call Waterfall'}
      </span>
    </div>
  )

  if (steps.length === 0) {
    return (
      <section className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}>
        {header}
        <p className="font-mono text-xs text-muted p-3">Run a review to see the waterfall</p>
      </section>
    )
  }

  const firstStart = steps[0].startedAt
  const totalMs = Math.max(
    steps.reduce((max, s) => {
      const end = (s.completedAt ?? s.startedAt + (s.durationMs ?? 200)) - firstStart
      return Math.max(max, end)
    }, 0),
    1,
  )

  return (
    <section className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}>
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">
          {execMode ? 'Analysis Pipeline Timeline' : 'Tool-Call Waterfall'}
        </span>
        <span className="font-mono text-xs text-dim tabular-nums">~{totalMs}ms</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {steps.map(step => {
          const leftPct  = ((step.startedAt - firstStart) / totalMs) * 100
          const widthPct = step.durationMs != null ? (step.durationMs / totalMs) * 100 : 0
          const barColor = step.status === 'complete' ? 'bg-success'
                         : step.status === 'running'  ? 'bg-accent'
                         : 'bg-muted'

          return (
            <div key={step.id}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs text-secondary truncate">
                  {execMode ? TOOL_LABELS[step.tool] : step.tool}
                </span>
                {step.durationMs != null && (
                  <span className="font-mono text-xs text-dim tabular-nums shrink-0">
                    {step.durationMs}ms
                  </span>
                )}
              </div>

              <div className="relative h-5 rounded-bar overflow-hidden bg-panel-border">
                <div
                  className={`absolute h-full rounded-bar flex items-center px-1 transition-[width] duration-300 ${barColor}`}
                  style={{
                    left:  `${leftPct}%`,
                    width: step.status !== 'pending' ? `${Math.max(widthPct, 1)}%` : '0%',
                  }}
                >
                  {widthPct > 8 && step.durationMs != null && (
                    <span className="font-mono text-[9px] text-panel font-bold whitespace-nowrap">
                      {step.durationMs}ms
                    </span>
                  )}
                </div>
              </div>

              {step.outputSummary && step.status === 'complete' && (
                <p className="mt-0.5 font-mono text-[10px] text-dim truncate">{step.outputSummary}</p>
              )}
            </div>
          )
        })}

        <div className="pt-2 border-t border-panel-border flex items-center justify-between">
          <span className="font-mono text-xs text-dim tracking-widest">TOTAL PIPELINE</span>
          <span className="font-mono text-xs text-primary font-bold tabular-nums">~{totalMs}ms</span>
        </div>
      </div>
    </section>
  )
}
