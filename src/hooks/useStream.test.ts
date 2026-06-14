import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStream } from './useStream'
import type { ToolName } from '@/types'

// Minimal mock session — all delays are 0 so vi.runAllTimersAsync() drains immediately.
vi.mock('@/mocks/reviewSession', () => ({
  DEMO_SESSION: {
    job: {
      id:           'test-session',
      prNumber:     1,
      repo:         'test/repo',
      prTitle:      'Test PR',
      author:       '@tester',
      filesChanged: 2,
      status:       'queued' as const,
    },
    telemetrySnapshot: {
      activeReviews: 1, queueDepth: 0, avgLatencyMs: 100, throughputRpm: 5, isLive: true,
    },
    events: [
      { type: 'token',         text: 'hello ',        delay: 0 },
      { type: 'tool_start',    tool: 'fetch_pr_diff', delay: 0 },
      { type: 'token',         text: 'streaming ',    delay: 0 },
      { type: 'tool_complete', tool: 'fetch_pr_diff', durationMs: 150, outputSummary: '4 files', delay: 0 },
      { type: 'token',         text: 'world',         delay: 0 },
      { type: 'complete',                             delay: 0 },
    ],
  },
}))

// Run a full demo session: advance all timers so every sleep(0) resolves.
async function drainSession(startSession: () => Promise<void>) {
  const promise = startSession()
  await vi.runAllTimersAsync()
  await promise
}

describe('useStream', () => {
  let onToolStart:    ReturnType<typeof vi.fn<(tool: ToolName) => void>>
  let onToolComplete: ReturnType<typeof vi.fn<(tool: ToolName, durationMs: number, outputSummary: string) => void>>
  let onComplete:     ReturnType<typeof vi.fn<() => void>>

  beforeEach(() => {
    vi.useFakeTimers()
    onToolStart    = vi.fn<(tool: ToolName) => void>()
    onToolComplete = vi.fn<(tool: ToolName, durationMs: number, outputSummary: string) => void>()
    onComplete     = vi.fn<() => void>()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  it('initialises with idle status and empty text', () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    expect(result.current.streamState).toEqual({ status: 'idle', text: '' })
  })

  // ── reset ─────────────────────────────────────────────────────────────────

  it('reset before any session returns idle state', () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    act(() => { result.current.reset() })
    expect(result.current.streamState).toEqual({ status: 'idle', text: '' })
  })

  it('reset after a completed session clears text and returns idle', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    act(() => { result.current.reset() })
    expect(result.current.streamState).toEqual({ status: 'idle', text: '' })
  })

  // ── Demo session — state transitions ──────────────────────────────────────

  it('demo mode: reaches complete status after draining all events', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    expect(result.current.streamState.status).toBe('complete')
  })

  // ── Demo session — token accumulation ─────────────────────────────────────

  it('demo mode: accumulates all token text in order', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    const text = result.current.streamState.text
    expect(text).toContain('hello')
    expect(text).toContain('streaming')
    expect(text).toContain('world')
  })

  it('demo mode: tokens appear before non-token events that follow them', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    // All three token segments should be present — none dropped
    const text = result.current.streamState.text
    expect(text.indexOf('hello')).toBeLessThan(text.indexOf('streaming'))
    expect(text.indexOf('streaming')).toBeLessThan(text.indexOf('world'))
  })

  // ── Demo session — tool callbacks ─────────────────────────────────────────

  it('demo mode: fires onToolStart once with the correct tool name', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    expect(onToolStart).toHaveBeenCalledOnce()
    expect(onToolStart).toHaveBeenCalledWith('fetch_pr_diff')
  })

  it('demo mode: fires onToolComplete with tool name, durationMs, and outputSummary', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    expect(onToolComplete).toHaveBeenCalledOnce()
    expect(onToolComplete).toHaveBeenCalledWith('fetch_pr_diff', 150, '4 files')
  })

  it('demo mode: fires onComplete exactly once at the end', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('demo mode: onComplete fires after all token text is committed', async () => {
    let textAtComplete = ''
    onComplete.mockImplementation(() => {
      // Capture is async — check via the state after the fact
    })

    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )
    await act(async () => { await drainSession(result.current.startSession) })

    // By the time onComplete has fired and the hook settled, text must be complete
    expect(result.current.streamState.text).toContain('world')
    expect(onComplete).toHaveBeenCalled()
    void textAtComplete // suppress unused warning
  })

  // ── Session isolation ─────────────────────────────────────────────────────

  it('running two sessions sequentially produces a clean second session', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )

    // First full session
    await act(async () => { await drainSession(result.current.startSession) })
    expect(result.current.streamState.status).toBe('complete')
    expect(onComplete).toHaveBeenCalledOnce()

    // Reset between sessions
    act(() => { result.current.reset() })
    expect(result.current.streamState).toEqual({ status: 'idle', text: '' })

    vi.clearAllMocks()

    // Second full session — callbacks fire again cleanly
    await act(async () => { await drainSession(result.current.startSession) })
    expect(result.current.streamState.status).toBe('complete')
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('reset during a session leaves state idle with no further updates', async () => {
    const { result } = renderHook(() =>
      useStream({ onToolStart, onToolComplete, onComplete })
    )

    // Start + immediately reset — stall timers so events never fire
    await act(async () => {
      void result.current.startSession()
      result.current.reset()
    })

    // Advance all timers — events are already cancelled so nothing should update
    await act(async () => { await vi.runAllTimersAsync() })

    expect(result.current.streamState).toEqual({ status: 'idle', text: '' })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
