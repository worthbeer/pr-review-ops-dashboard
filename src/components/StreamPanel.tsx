import { StreamCursor } from './StreamCursor'
import type { StreamState } from '@/types'

interface Props {
  streamState: StreamState
  className?:  string
}

const statusLabel: Record<StreamState['status'], string> = {
  idle:       'IDLE',
  connecting: 'CONNECTING',
  streaming:  'STREAMING',
  complete:   'COMPLETE',
  error:      'ERROR',
}

const statusClass: Record<StreamState['status'], string> = {
  idle:       'text-dim',
  connecting: 'text-warning',
  streaming:  'text-accent',
  complete:   'text-success',
  error:      'text-error',
}

export function StreamPanel({ streamState, className = '' }: Props) {
  const isEmpty = !streamState.text

  return (
    <section
      className={`flex flex-col bg-panel-gradient border border-panel-border rounded-panel overflow-hidden ${className}`}
      aria-label="Analysis panel"
    >
      {/* Panel header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <span className="font-sans text-xs font-medium text-dim tracking-widest uppercase">
          Analysis
        </span>
        <span
          className={`font-mono text-xs tracking-widest ${statusClass[streamState.status]}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {statusLabel[streamState.status]}
        </span>
      </div>

      {/* Content — aria-live so screen readers announce streaming text */}
      <div
        className="flex-1 overflow-y-auto p-3"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Streaming analysis"
      >
        {streamState.status === 'error' && streamState.errorMessage ? (
          <p className="font-mono text-xs text-error" role="alert">{streamState.errorMessage}</p>
        ) : isEmpty ? (
          <p className="font-mono text-xs text-muted">
            {streamState.status === 'connecting'
              ? 'Connecting to review agent...'
              : 'Waiting for review session...'}
          </p>
        ) : (
          <pre className="font-mono text-xs text-primary leading-relaxed whitespace-pre-wrap break-words m-0">
            {streamState.text}
            {streamState.status === 'streaming' && <StreamCursor />}
          </pre>
        )}
      </div>
    </section>
  )
}
