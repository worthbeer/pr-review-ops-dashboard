# SKILL: AI Ops Dashboard Patterns

## Streaming LLM UI

### The core pattern
```typescript
// hooks/useStream.ts
// Stream arrives as SSE chunks — parse text tokens AND tool events from same stream

const parseChunk = (chunk: StreamChunk): ParsedEvent => {
  if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
    return { kind: 'token', text: chunk.delta.text }
  }
  if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
    return { kind: 'tool_start', name: chunk.content_block.name, id: chunk.content_block.id }
  }
  if (chunk.type === 'content_block_stop') {
    return { kind: 'tool_end' }
  }
  return { kind: 'noop' }
}
```

### Rendering tokens without jank
- Accumulate tokens in a `ref`, not state — flush to state on RAF (requestAnimationFrame)
- This prevents 50+ re-renders per second during fast streaming
- Only setState on `\n` or every ~100ms via throttle

```typescript
const tokenBuffer = useRef('')
const flushTokens = useCallback(() => {
  if (tokenBuffer.current) {
    setDisplayText(prev => prev + tokenBuffer.current)
    tokenBuffer.current = ''
  }
}, [])

// In stream handler:
tokenBuffer.current += token
requestAnimationFrame(flushTokens)
```

### The blinking cursor
Pure CSS — no JS timer:
```css
.stream-cursor::after {
  content: '▋';
  color: #00D4FF;
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```
Remove `.stream-cursor` class when stream completes.

---

## Tool-Call Trace (the audit trail)

### TraceStep data shape
```typescript
interface TraceStep {
  id: string
  tool: string
  status: 'pending' | 'running' | 'complete' | 'error'
  startedAt: number        // Date.now()
  completedAt?: number
  durationMs?: number
  input?: Record<string, unknown>
  output?: string          // truncated summary
}
```

### The timing bar — pure CSS transition
```tsx
// TraceStep.tsx
const widthPercent = step.durationMs 
  ? Math.min((step.durationMs / MAX_DURATION_MS) * 100, 100) 
  : 0

<div className="timing-bar-track">
  <div 
    className="timing-bar-fill"
    style={{ 
      width: step.status === 'complete' ? `${widthPercent}%` : '0%',
      transition: `width ${step.durationMs}ms linear`,
      backgroundColor: step.status === 'error' ? '#EF4444' : '#22C55E'
    }}
  />
</div>
```

Trigger the transition by setting width AFTER the component mounts:
```typescript
useEffect(() => {
  if (step.status === 'complete') {
    // width transition fires automatically via CSS
  }
}, [step.status])
```

### Step appears — entrance animation
Each step enters from opacity 0, translateY(4px) → opacity 1, translateY(0).
Duration: 150ms ease-out. Do NOT stagger artificially — they appear as tools fire.

---

## Mock replay system

### Structure
```typescript
// mocks/reviewSession.ts
export interface MockSession {
  telemetrySnapshot: TelemetryState
  events: MockEvent[]
}

type MockEvent =
  | { type: 'token'; text: string; delay: number }
  | { type: 'tool_start'; tool: string; delay: number }
  | { type: 'tool_complete'; tool: string; durationMs: number; delay: number }
  | { type: 'complete'; delay: number }
```

### Replay engine
```typescript
const replaySession = async (session: MockSession, handlers: ReplayHandlers) => {
  for (const event of session.events) {
    await sleep(event.delay)
    switch (event.type) {
      case 'token': handlers.onToken(event.text); break
      case 'tool_start': handlers.onToolStart(event.tool); break
      case 'tool_complete': handlers.onToolComplete(event.tool, event.durationMs); break
      case 'complete': handlers.onComplete(); break
    }
  }
}
```

Token delays: 18ms average, with occasional 60ms pauses at punctuation (realistic).
Tool step gaps: 400–800ms between start and complete events.

---

## Telemetry bar

Fake but realistic. Tick every 3s with small random variance:

```typescript
// hooks/useTelemetry.ts
const TICK_MS = 3000

const tick = () => {
  setState(prev => ({
    activeReviews: prev.activeReviews + (Math.random() > 0.7 ? 1 : 0),
    queueDepth: Math.max(0, prev.queueDepth + (Math.random() > 0.5 ? 1 : -1)),
    avgLatencyMs: prev.avgLatencyMs + Math.floor((Math.random() - 0.5) * 20),
    throughputRpm: prev.throughputRpm + Math.floor((Math.random() - 0.5) * 2),
  }))
}
```

Display format (mono font):
```
ACTIVE  3    QUEUED  7    AVG LATENCY  284ms    RPM  12    ● LIVE
```
The `● LIVE` indicator pulses: CSS `animation: pulse 2s ease-in-out infinite`.

---

## API route — streaming

```typescript
// app/api/review/route.ts
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  const client = new Anthropic()
  
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: PR_REVIEW_TOOLS,  // defined in lib/anthropic.ts
    messages: [{ role: 'user', content: PR_REVIEW_PROMPT }]
  })

  // Return as SSE
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

---

## Design tokens (reference)

All colors via Tailwind custom config or CSS vars — never raw hex in components.

```typescript
// lib/tokens.ts
export const tokens = {
  base: '#0A0C10',
  panel: '#13171F',
  panelBorder: '#1E2430',
  accent: '#00D4FF',
  accentDim: '#00D4FF33',
  warning: '#F5A623',
  success: '#22C55E',
  error: '#EF4444',
  textPrimary: '#E8EDF2',
  textDim: '#4A5568',
  textMuted: '#2D3748',
} as const
```

---

## Common failure modes to avoid

1. **Re-render thrash during streaming** — use ref buffer, flush on RAF
2. **Timing bar doesn't animate** — CSS transition requires width to change AFTER initial render; use useEffect
3. **Mock bleeds into live** — gate ALL mock imports behind `DEMO_MODE` env check
4. **Tool events lost** — stream parser must handle `content_block_start` before `content_block_delta`
5. **Font flash** — preload JetBrains Mono in `<head>`, use `font-display: swap`
6. **Panel overflow** — StreamPanel needs `overflow-y: auto` with custom scrollbar styled to match palette
