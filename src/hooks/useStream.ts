'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createStreamParser } from '@/lib/streamParser'
import type { StreamState, ToolName } from '@/types'

interface UseStreamOptions {
  onToolStart:    (tool: ToolName) => void
  onToolComplete: (tool: ToolName, durationMs: number, outputSummary: string) => void
  onComplete:     () => void
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const MAX_STREAM_CHARS = 50_000

export function useStream({ onToolStart, onToolComplete, onComplete }: UseStreamOptions) {
  const [streamState, setStreamState] = useState<StreamState>({ status: 'idle', text: '' })

  const tokenBufferRef  = useRef('')
  const rafIdRef        = useRef<number | null>(null)
  const mountedRef      = useRef(true)
  const sessionRef      = useRef<{ cancelled: boolean; abort?: AbortController } | null>(null)
  const handlersRef     = useRef({ onToolStart, onToolComplete, onComplete })

  useEffect(() => {
    handlersRef.current = { onToolStart, onToolComplete, onComplete }
  }, [onToolStart, onToolComplete, onComplete])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      sessionRef.current?.abort?.abort()
      if (sessionRef.current) sessionRef.current.cancelled = true
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  const flushTokens = useCallback(() => {
    if (!mountedRef.current) return
    if (tokenBufferRef.current) {
      const chunk = tokenBufferRef.current
      tokenBufferRef.current = ''
      setStreamState(prev => {
        const combined = prev.text + chunk
        return { ...prev, text: combined.length > MAX_STREAM_CHARS ? combined.slice(-MAX_STREAM_CHARS) : combined }
      })
    }
    rafIdRef.current = null
  }, [])

  const scheduleFlush = useCallback(() => {
    if (typeof requestAnimationFrame === 'undefined') {
      flushTokens()
      return
    }
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushTokens)
    }
  }, [flushTokens])

  const handleToken = useCallback((text: string) => {
    tokenBufferRef.current += text
    scheduleFlush()
  }, [scheduleFlush])

  const startSession = useCallback(async () => {
    // Cancel any in-flight session
    if (sessionRef.current) {
      sessionRef.current.cancelled = true
      sessionRef.current.abort?.abort()
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    tokenBufferRef.current = ''

    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'

    if (isDemo) {
      const session = { cancelled: false }
      sessionRef.current = session

      setStreamState({ status: 'connecting', text: '' })
      const { DEMO_SESSION } = await import('@/mocks/reviewSession')
      if (session.cancelled) return

      if (DEMO_SESSION.events.length === 0) {
        setStreamState({ status: 'complete', text: '' })
        handlersRef.current.onComplete()
        return
      }

      setStreamState({ status: 'streaming', text: '' })

      try {
        for (const event of DEMO_SESSION.events) {
          if (session.cancelled) break
          await sleep(event.delay)
          if (session.cancelled) break

          switch (event.type) {
            case 'token':
              handleToken(event.text)
              break
            case 'tool_start':
              handlersRef.current.onToolStart(event.tool)
              break
            case 'tool_complete':
              handlersRef.current.onToolComplete(event.tool, event.durationMs, event.outputSummary)
              break
            case 'complete':
              // Flush remaining buffered tokens synchronously
              if (tokenBufferRef.current) {
                const remaining = tokenBufferRef.current
                tokenBufferRef.current = ''
                if (rafIdRef.current !== null) {
                  cancelAnimationFrame(rafIdRef.current)
                  rafIdRef.current = null
                }
                setStreamState(prev => ({ ...prev, text: prev.text + remaining, status: 'complete' }))
              } else {
                setStreamState(prev => ({ ...prev, status: 'complete' }))
              }
              handlersRef.current.onComplete()
              break
          }
        }
      } catch (err) {
        if (!session.cancelled && mountedRef.current) {
          setStreamState(prev => ({
            ...prev,
            status:       'error',
            errorMessage: err instanceof Error ? err.message : 'Demo replay failed',
          }))
          handlersRef.current.onComplete()
        }
      }
    } else {
      const abort = new AbortController()
      const session = { cancelled: false, abort }
      sessionRef.current = session

      setStreamState({ status: 'connecting', text: '' })

      try {
        const response = await fetch('/api/review', {
          method: 'POST',
          signal: abort.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`API error: ${response.status}`)
        }

        setStreamState({ status: 'streaming', text: '' })

        const parse = createStreamParser()
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        const toolStartTimeById = new Map<string, number>()
        const toolNameById      = new Map<string, ToolName>()
        let lineBuffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done || session.cancelled) break

          lineBuffer += decoder.decode(value, { stream: true })
          const lines = lineBuffer.split('\n')
          lineBuffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const jsonStr = trimmed.slice(5).trim()
            if (!jsonStr) continue

            try {
              const chunk = JSON.parse(jsonStr)
              const event = parse(chunk)

              switch (event.kind) {
                case 'token':
                  handleToken(event.text)
                  break
                case 'tool_start':
                  toolStartTimeById.set(event.id, Date.now())
                  toolNameById.set(event.id, event.name)
                  handlersRef.current.onToolStart(event.name)
                  break
                case 'tool_end': {
                  const toolName  = toolNameById.get(event.id)
                  const startTime = toolStartTimeById.get(event.id)
                  if (toolName && startTime) {
                    handlersRef.current.onToolComplete(toolName, Date.now() - startTime, 'Tool executed')
                    toolNameById.delete(event.id)
                    toolStartTimeById.delete(event.id)
                  }
                  break
                }
                case 'done':
                  if (tokenBufferRef.current) {
                    const remaining = tokenBufferRef.current
                    tokenBufferRef.current = ''
                    if (rafIdRef.current !== null) {
                      cancelAnimationFrame(rafIdRef.current)
                      rafIdRef.current = null
                    }
                    setStreamState(prev => ({ ...prev, text: prev.text + remaining, status: 'complete' }))
                  } else {
                    setStreamState(prev => ({ ...prev, status: 'complete' }))
                  }
                  handlersRef.current.onComplete()
                  break
              }
            } catch {
              // Malformed SSE chunk — log in dev, skip in prod
              if (process.env.NODE_ENV !== 'production') {
                console.warn('[stream] failed to parse SSE chunk:', jsonStr)
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setStreamState(prev => ({
            ...prev,
            status:       'error',
            errorMessage: err instanceof Error ? err.message : String(err),
          }))
          handlersRef.current.onComplete()
        }
      }
    }
  }, [handleToken])

  const reset = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.cancelled = true
      sessionRef.current.abort?.abort()
      sessionRef.current = null
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    tokenBufferRef.current = ''
    setStreamState({ status: 'idle', text: '' })
  }, [])

  return { streamState, startSession, reset }
}
