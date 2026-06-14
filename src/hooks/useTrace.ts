'use client'

import { useCallback, useState } from 'react'
import type { TraceStep, ToolName } from '@/types'

export function useTrace() {
  const [steps, setSteps] = useState<TraceStep[]>([])

  const handleToolStart = useCallback((tool: ToolName) => {
    setSteps(prev => [
      ...prev,
      {
        id:        `${tool}-${Date.now()}`,
        tool,
        status:    'running',
        startedAt: Date.now(),
      },
    ])
  }, [])

  const handleToolComplete = useCallback(
    (tool: ToolName, durationMs: number, outputSummary: string) => {
      setSteps(prev => {
        let paired = false
        return prev.map(step => {
          if (!paired && step.tool === tool && step.status === 'running') {
            paired = true
            return { ...step, status: 'complete', completedAt: Date.now(), durationMs, outputSummary }
          }
          return step
        })
      })
    },
    []
  )

  const reset = useCallback(() => setSteps([]), [])

  return { steps, handleToolStart, handleToolComplete, reset }
}
