// mocks/reviewSession.ts
// Full canned PR review session for demo mode.
// Plays back identically to a live Anthropic stream — interviewer cannot tell the difference.

import type { MockSession, MockEvent } from '../types'

// The fake PR being reviewed — referenced in all analysis output
export const DEMO_PR = {
  id: 'demo-session-001',
  prNumber: 247,
  repo: 'acme-bank/ledger-ui',
  prTitle: 'feat: add real-time transaction stream to compliance dashboard',
  author: '@dev-team',
  filesChanged: 4,
  status: 'queued' as const,
}

// Realistic streaming analysis text — broken into natural token chunks
// Punctuation pauses handled by delay values
const ANALYSIS_TOKENS: Array<{ text: string; delay: number }> = [
  // Opening
  { text: '## PR Review: ', delay: 18 },
  { text: 'acme-bank/ledger-ui', delay: 18 },
  { text: ' #247\n\n', delay: 60 },
  { text: '**feat:', delay: 18 },
  { text: ' add real-time transaction stream to compliance dashboard**\n\n', delay: 60 },

  // Summary
  { text: '### Summary\n\n', delay: 40 },
  { text: 'This PR introduces', delay: 18 },
  { text: ' a WebSocket-based', delay: 18 },
  { text: ' transaction stream', delay: 18 },
  { text: ' to the compliance dashboard.', delay: 60 },
  { text: ' The implementation shows', delay: 18 },
  { text: ' strong intent but has', delay: 18 },
  { text: ' **4 blocking issues**', delay: 18 },
  { text: ' that must be resolved', delay: 18 },
  { text: ' before merge.\n\n', delay: 60 },

  // Issue 1
  { text: '---\n\n', delay: 40 },
  { text: '### 🔴 Critical:', delay: 18 },
  { text: ' Memory Leak in useEffect Cleanup\n\n', delay: 60 },
  { text: '**File:** `useWebSocket.ts:34`\n\n', delay: 40 },
  { text: 'The WebSocket connection is opened', delay: 18 },
  { text: ' in useEffect but the cleanup', delay: 18 },
  { text: ' function does not call', delay: 18 },
  { text: ' `ws.close()`.', delay: 60 },
  { text: ' In a compliance dashboard', delay: 18 },
  { text: ' where users navigate', delay: 18 },
  { text: ' between facilities frequently,', delay: 18 },
  { text: ' this will accumulate', delay: 18 },
  { text: ' open connections until', delay: 18 },
  { text: ' the browser tab crashes.\n\n', delay: 60 },

  { text: '```typescript\n', delay: 18 },
  { text: '// Current (broken)\n', delay: 18 },
  { text: 'useEffect(() => {\n', delay: 18 },
  { text: '  const ws = new WebSocket(url)\n', delay: 18 },
  { text: '  ws.onmessage = handleMessage\n', delay: 18 },
  { text: '}, [url])\n\n', delay: 40 },
  { text: '// Required\n', delay: 18 },
  { text: 'useEffect(() => {\n', delay: 18 },
  { text: '  const ws = new WebSocket(url)\n', delay: 18 },
  { text: '  ws.onmessage = handleMessage\n', delay: 18 },
  { text: '  return () => ws.close()\n', delay: 18 },
  { text: '}, [url])\n', delay: 18 },
  { text: '```\n\n', delay: 60 },

  // Issue 2
  { text: '### 🔴 Critical:', delay: 18 },
  { text: ' Untyped WebSocket Messages\n\n', delay: 60 },
  { text: '**File:** `useWebSocket.ts:41`,', delay: 18 },
  { text: ' `types/index.ts`\n\n', delay: 40 },
  { text: 'WebSocket message payloads are typed as `any`.', delay: 60 },
  { text: ' In a regulated environment,', delay: 18 },
  { text: ' unvalidated external data', delay: 18 },
  { text: ' reaching compliance UI is', delay: 18 },
  { text: ' an audit risk.', delay: 60 },
  { text: ' Define a `TransactionEvent` discriminated union', delay: 18 },
  { text: ' and validate at the WebSocket boundary.\n\n', delay: 60 },

  // Issue 3
  { text: '### 🟡 Warning:', delay: 18 },
  { text: ' No Reconnection Logic\n\n', delay: 60 },
  { text: '**File:** `useWebSocket.ts`\n\n', delay: 40 },
  { text: 'WebSocket connections drop silently', delay: 18 },
  { text: ' with no reconnection attempt.', delay: 60 },
  { text: ' For a compliance dashboard', delay: 18 },
  { text: ' displaying real-time transaction data,', delay: 18 },
  { text: ' silent disconnection is invisible to the user', delay: 18 },
  { text: ' and dangerous.', delay: 60 },
  { text: ' Implement exponential backoff', delay: 18 },
  { text: ' with a max retry cap of 5.\n\n', delay: 60 },

  // Issue 4
  { text: '### 🟡 Warning:', delay: 18 },
  { text: ' Missing Error Boundary\n\n', delay: 60 },
  { text: '**File:** `TransactionStream.tsx`\n\n', delay: 40 },
  { text: '`TransactionStream` is not wrapped', delay: 18 },
  { text: ' in an ErrorBoundary.', delay: 60 },
  { text: ' A malformed WebSocket payload', delay: 18 },
  { text: ' will crash the entire dashboard.', delay: 18 },
  { text: ' Wrap in an ErrorBoundary that', delay: 18 },
  { text: ' shows a degraded state', delay: 18 },
  { text: ' rather than a blank screen.\n\n', delay: 60 },

  // Verdict
  { text: '---\n\n', delay: 40 },
  { text: '### Verdict: **Request Changes**\n\n', delay: 60 },
  { text: 'Resolve the two critical issues', delay: 18 },
  { text: ' before merge.', delay: 18 },
  { text: ' The warning-level items', delay: 18 },
  { text: ' can follow in a follow-up PR', delay: 18 },
  { text: ' if timeline requires,', delay: 18 },
  { text: ' but document the debt explicitly.\n', delay: 60 },
]

// Build the full event sequence
const buildEvents = (): MockEvent[] => {
  const events: MockEvent[] = []

  // Tool 1: fetch_pr_diff fires immediately
  events.push({ type: 'tool_start', tool: 'fetch_pr_diff', delay: 400 })
  events.push({ type: 'tool_complete', tool: 'fetch_pr_diff', durationMs: 180, outputSummary: '4 files, +312 -28 lines', delay: 180 })

  // Tool 2: analyze_file_structure
  events.push({ type: 'tool_start', tool: 'analyze_file_structure', delay: 200 })
  events.push({ type: 'tool_complete', tool: 'analyze_file_structure', durationMs: 120, outputSummary: 'TransactionStream.tsx, useWebSocket.ts, api/transactions/route.ts, types/index.ts', delay: 120 })

  // Streaming starts after first two tools
  let streamDelay = 50
  for (const token of ANALYSIS_TOKENS.slice(0, 15)) {
    events.push({ type: 'token', text: token.text, delay: streamDelay + token.delay })
    streamDelay = token.delay
  }

  // Tool 3: check_type_safety fires mid-stream
  events.push({ type: 'tool_start', tool: 'check_type_safety', delay: 300 })
  events.push({ type: 'tool_complete', tool: 'check_type_safety', durationMs: 310, outputSummary: '3 implicit any, 1 unsafe cast, 0 strict violations', delay: 310 })

  // Continue streaming
  for (const token of ANALYSIS_TOKENS.slice(15, 35)) {
    events.push({ type: 'token', text: token.text, delay: streamDelay + token.delay })
    streamDelay = token.delay
  }

  // Tool 4: scan_runtime_risks
  events.push({ type: 'tool_start', tool: 'scan_runtime_risks', delay: 250 })
  events.push({ type: 'tool_complete', tool: 'scan_runtime_risks', durationMs: 240, outputSummary: 'Memory leak detected, missing cleanup in useEffect', delay: 240 })

  // Continue streaming
  for (const token of ANALYSIS_TOKENS.slice(35, 55)) {
    events.push({ type: 'token', text: token.text, delay: streamDelay + token.delay })
    streamDelay = token.delay
  }

  // Tool 5: assess_performance
  events.push({ type: 'tool_start', tool: 'assess_performance', delay: 200 })
  events.push({ type: 'tool_complete', tool: 'assess_performance', durationMs: 195, outputSummary: 'No virtualization on transaction list, potential scroll perf issue', delay: 195 })

  // Remaining tokens
  for (const token of ANALYSIS_TOKENS.slice(55)) {
    events.push({ type: 'token', text: token.text, delay: streamDelay + token.delay })
    streamDelay = token.delay
  }

  // Tool 6: generate_summary — fires last
  events.push({ type: 'tool_start', tool: 'generate_summary', delay: 300 })
  events.push({ type: 'tool_complete', tool: 'generate_summary', durationMs: 75, outputSummary: '2 critical, 2 warnings — request changes', delay: 75 })

  // Done
  events.push({ type: 'complete', delay: 200 })

  return events
}

export const DEMO_SESSION: MockSession = {
  job: DEMO_PR,
  telemetrySnapshot: {
    activeReviews: 3,
    queueDepth: 7,
    avgLatencyMs: 284,
    throughputRpm: 12,
    isLive: true,
  },
  events: buildEvents(),
}
