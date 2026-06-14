'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { tokens } from '@/lib/tokens'
import type { TelemetryState } from '@/types'

const INITIAL: TelemetryState = {
  activeReviews:  2,
  queueDepth:     5,
  avgLatencyMs:   284,
  throughputRpm:  12,
  isLive:         true,
}

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryState>(INITIAL)
  const pausedRef = useRef(false)

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return
      setTelemetry(prev => ({
        activeReviews: Math.max(0, prev.activeReviews + (Math.random() > 0.75 ? 1 : Math.random() > 0.6 ? -1 : 0)),
        queueDepth:    Math.max(0, prev.queueDepth + (Math.random() > 0.5 ? 1 : -1)),
        avgLatencyMs:  Math.max(80, Math.min(tokens.telemetry.maxLatencyMs, prev.avgLatencyMs + Math.floor((Math.random() - 0.5) * 24))),
        throughputRpm: Math.max(1, Math.min(30, prev.throughputRpm + Math.floor((Math.random() - 0.5) * 2))),
        isLive:        true,
      }))
    }, tokens.telemetry.tickMs)

    return () => clearInterval(id)
  }, [])

  const setSessionActive = useCallback(() => {
    pausedRef.current = true
    setTelemetry(prev => ({
      ...prev,
      activeReviews: prev.activeReviews + 1,
      queueDepth:    Math.max(0, prev.queueDepth - 1),
    }))
  }, [])

  const setSessionComplete = useCallback(() => {
    setTelemetry(prev => ({
      ...prev,
      activeReviews: Math.max(0, prev.activeReviews - 1),
    }))
    pausedRef.current = false
  }, [])

  return { telemetry, setSessionActive, setSessionComplete }
}
