import type { Finding, Category, MetricDay } from '@/types'

export const FINDINGS: Finding[] = [
  {
    severity:    'critical',
    title:       'Memory Leak in useEffect Cleanup',
    file:        'useWebSocket.ts:34',
    description: 'WebSocket connection opened in useEffect but cleanup does not call ws.close(). In a compliance dashboard where users navigate between facilities, this will accumulate open connections until the browser tab crashes.',
    category:    'Runtime Behavior',
    techDetail:  'Missing return () => ws.close() in useEffect dependency array on [url]',
    execImpact:  'Browser tab crashes under normal navigation — compliance data loss risk',
  },
  {
    severity:    'critical',
    title:       'Untyped WebSocket Messages',
    file:        'useWebSocket.ts:41, types/index.ts',
    description: 'WebSocket message payloads typed as any. In a regulated environment, unvalidated external data reaching compliance UI is an audit risk.',
    category:    'Type Safety',
    techDetail:  'No discriminated union for TransactionEvent — any cast at WebSocket boundary',
    execImpact:  'Regulatory audit exposure — unvalidated data in compliance UI',
  },
  {
    severity:    'warning',
    title:       'No Reconnection Logic',
    file:        'useWebSocket.ts',
    description: 'WebSocket connections drop silently with no reconnection attempt. For a compliance dashboard, silent disconnection is invisible to the user and dangerous.',
    category:    'Architecture',
    techDetail:  'No exponential backoff, no max retry cap, no disconnect event handler',
    execImpact:  'Real-time data silently goes stale — users unaware of feed disruption',
  },
  {
    severity:    'warning',
    title:       'Missing Error Boundary',
    file:        'TransactionStream.tsx',
    description: 'TransactionStream is not wrapped in an ErrorBoundary. A malformed WebSocket payload will crash the entire dashboard.',
    category:    'Architecture',
    techDetail:  'No ErrorBoundary wrapper — render errors propagate to root, full page crash',
    execImpact:  'Single malformed payload takes down the entire compliance dashboard',
  },
]

export const CATEGORIES: Category[] = [
  { label: 'Type Safety',      hits: 3, maxMs: 310, color: 'error'   },
  { label: 'Runtime Behavior', hits: 2, maxMs: 240, color: 'warning' },
  { label: 'Architecture',     hits: 2, maxMs: 195, color: 'warning' },
  { label: 'Performance',      hits: 1, maxMs: 195, color: 'accent'  },
  { label: 'Code Clarity',     hits: 0, maxMs: 0,   color: 'success' },
  { label: 'Quality/Coverage', hits: 0, maxMs: 0,   color: 'success' },
  { label: 'Accessibility',    hits: 0, maxMs: 0,   color: 'success' },
]

export const METRICS_HISTORY: MetricDay[] = [
  { label: 'Mon', prs: 38, criticals: 5,  latency: 310 },
  { label: 'Tue', prs: 52, criticals: 8,  latency: 280 },
  { label: 'Wed', prs: 45, criticals: 3,  latency: 295 },
  { label: 'Thu', prs: 61, criticals: 11, latency: 260 },
  { label: 'Fri', prs: 47, criticals: 6,  latency: 275 },
  { label: 'Sat', prs: 29, criticals: 2,  latency: 301 },
  { label: 'Sun', prs: 19, criticals: 1,  latency: 322 },
]
