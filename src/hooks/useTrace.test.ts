import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTrace } from './useTrace'

describe('useTrace', () => {

  // ── Initial state ────────────────────────────────────────────────────────

  it('initialises with an empty steps array', () => {
    const { result } = renderHook(() => useTrace())
    expect(result.current.steps).toHaveLength(0)
  })

  // ── handleToolStart ──────────────────────────────────────────────────────

  it('appends a running step when a tool starts', () => {
    const { result } = renderHook(() => useTrace())

    act(() => { result.current.handleToolStart('fetch_pr_diff') })

    expect(result.current.steps).toHaveLength(1)
    expect(result.current.steps[0].tool).toBe('fetch_pr_diff')
    expect(result.current.steps[0].status).toBe('running')
    expect(result.current.steps[0].startedAt).toBeGreaterThan(0)
  })

  it('appends steps in call order', () => {
    const { result } = renderHook(() => useTrace())

    act(() => { result.current.handleToolStart('fetch_pr_diff') })
    act(() => { result.current.handleToolStart('analyze_file_structure') })

    expect(result.current.steps[0].tool).toBe('fetch_pr_diff')
    expect(result.current.steps[1].tool).toBe('analyze_file_structure')
  })

  // ── handleToolComplete ───────────────────────────────────────────────────

  it('marks the running step complete with timing and summary', () => {
    const { result } = renderHook(() => useTrace())

    act(() => { result.current.handleToolStart('fetch_pr_diff') })
    act(() => { result.current.handleToolComplete('fetch_pr_diff', 145, 'Diff retrieved') })

    const step = result.current.steps[0]
    expect(step.status).toBe('complete')
    expect(step.durationMs).toBe(145)
    expect(step.outputSummary).toBe('Diff retrieved')
    expect(step.completedAt).toBeGreaterThan(0)
  })

  it('only completes the first matching running step when the same tool appears twice', () => {
    const { result } = renderHook(() => useTrace())

    act(() => { result.current.handleToolStart('check_type_safety') })
    act(() => { result.current.handleToolStart('check_type_safety') })
    act(() => { result.current.handleToolComplete('check_type_safety', 200, 'Done') })

    const statuses = result.current.steps.map(s => s.status)
    expect(statuses).toEqual(['complete', 'running'])
  })

  it('does not crash or corrupt state when completing a tool that was never started', () => {
    const { result } = renderHook(() => useTrace())

    act(() => { result.current.handleToolStart('fetch_pr_diff') })
    expect(() => {
      act(() => { result.current.handleToolComplete('scan_runtime_risks', 100, 'ok') })
    }).not.toThrow()

    // The started step must remain untouched
    expect(result.current.steps[0].status).toBe('running')
  })

  // ── reset ────────────────────────────────────────────────────────────────

  it('reset clears all steps', () => {
    const { result } = renderHook(() => useTrace())

    act(() => { result.current.handleToolStart('fetch_pr_diff') })
    act(() => { result.current.handleToolStart('analyze_file_structure') })
    act(() => { result.current.reset() })

    expect(result.current.steps).toHaveLength(0)
  })

  // ── Full six-tool sequence ───────────────────────────────────────────────

  it('records and completes all six tools in the correct sequence', () => {
    const { result } = renderHook(() => useTrace())

    const tools = [
      'fetch_pr_diff',
      'analyze_file_structure',
      'check_type_safety',
      'scan_runtime_risks',
      'assess_performance',
      'generate_summary',
    ] as const

    tools.forEach(tool => {
      act(() => { result.current.handleToolStart(tool) })
    })
    tools.forEach(tool => {
      act(() => { result.current.handleToolComplete(tool, 100, 'ok') })
    })

    expect(result.current.steps).toHaveLength(6)
    result.current.steps.forEach((step, i) => {
      expect(step.tool).toBe(tools[i])
      expect(step.status).toBe('complete')
    })
  })
})
