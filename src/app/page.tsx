'use client'

import { useCallback, useEffect } from 'react'
import { TelemetryBar } from '@/components/TelemetryBar'
import { AboutDrawer }  from '@/components/AboutDrawer'
import { StreamPanel }  from '@/components/StreamPanel'
import { TracePanel }   from '@/components/TracePanel'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useTelemetry } from '@/hooks/useTelemetry'
import { useTrace }     from '@/hooks/useTrace'
import { useStream }    from '@/hooks/useStream'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'

export default function Page() {
  const { telemetry, setSessionActive, setSessionComplete } = useTelemetry()
  const { steps, handleToolStart, handleToolComplete, reset: resetTrace } = useTrace()

  const handleComplete = useCallback(() => {
    setSessionComplete()
  }, [setSessionComplete])

  const { streamState, startSession, reset: resetStream } = useStream({
    onToolStart:    handleToolStart,
    onToolComplete: handleToolComplete,
    onComplete:     handleComplete,
  })

  // Resume telemetry ticking if session ends in an error state
  useEffect(() => {
    if (streamState.status === 'error') {
      setSessionComplete()
    }
  }, [streamState.status, setSessionComplete])

  const isRunning =
    streamState.status === 'connecting' || streamState.status === 'streaming'

  const handleRunReview = useCallback(async () => {
    resetTrace()
    resetStream()
    setSessionActive()
    await startSession()
  }, [resetTrace, resetStream, setSessionActive, startSession])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base">
      <TelemetryBar telemetry={telemetry} isDemo={IS_DEMO} />
      <AboutDrawer />

      {/* Main panels — side-by-side on md+, stacked on mobile */}
      <main className="flex flex-1 gap-3 p-3 overflow-hidden flex-col md:flex-row">
        <ErrorBoundary>
          <StreamPanel
            streamState={streamState}
            className="flex-1 min-h-[200px] min-w-0"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <TracePanel
            steps={steps}
            className="md:w-[380px] md:shrink-0 w-full min-h-[200px] md:min-h-0"
          />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-panel-border bg-panel px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunReview}
            disabled={isRunning}
            aria-label={isRunning ? 'Review in progress' : 'Run PR review'}
            className="
              font-mono text-xs tracking-widest
              px-4 py-2.5 sm:py-1.5
              min-h-[44px] sm:min-h-0
              rounded-badge border transition-colors duration-150
              touch-manipulation select-none
              disabled:opacity-40 disabled:cursor-not-allowed
              border-accent text-accent hover:bg-accent-dim active:bg-accent-dim
              disabled:border-dim disabled:text-dim
            "
          >
            {isRunning ? 'REVIEWING...' : 'RUN REVIEW'}
          </button>

          {streamState.status === 'complete' && (
            <span className="font-mono text-xs text-success tracking-widest" role="status">
              ✓ Review complete
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs text-dim">
          <span className="hidden sm:inline">
            acme-bank/ledger-ui <span className="text-muted">·</span> PR #247
          </span>
          <span className="tabular-nums">
            {steps.filter(s => s.status === 'complete').length} / 6 tools
          </span>
        </div>
      </footer>
    </div>
  )
}
