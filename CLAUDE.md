# PR Review Ops Dashboard — Agent Directives

## What this project is

A production-quality AI ops dashboard that visualizes a running PR review agent in real time.
Two-panel layout: streaming LLM analysis (left) + tool-call audit trace (right).
Top bar shows live ops telemetry — queue depth, active reviews, latency.

Built to demonstrate:
- Streaming LLM UI (token-by-token render)
- Tool-call visualization (the agentic audit trail)
- High-density financial/compliance UI aesthetic
- React 19 / Next.js App Router patterns

This is a portfolio artifact targeting Senior/Staff Frontend roles at AI-native fintech and banking platforms.

---

## Stack

- Next.js 14+ (App Router, Server Components where appropriate)
- TypeScript (strict mode, no `any`)
- Tailwind CSS (no arbitrary values — use design tokens from `lib/tokens.ts`)
- Anthropic SDK (`@anthropic-ai/sdk`) for real streaming
- Mock layer in `mocks/` for demo/offline mode
- JetBrains Mono (data/trace), Inter (UI labels)

---

## Visual language

**Palette (all values in `lib/tokens.ts`):**
- `base`: #0A0C10 — page background
- `panel`: #13171F — card/panel background
- `panelBorder`: #1E2430 — subtle panel borders
- `accent`: #00D4FF — live/streaming state, active indicators
- `warning`: #F5A623 — tool step warnings, retries
- `success`: #22C55E — completed steps
- `textPrimary`: #E8EDF2 — data and content text
- `textDim`: #4A5568 — chrome, labels, secondary info
- `streamCursor`: #00D4FF — blinking cursor during token stream

**Typography:**
- `font-mono` (JetBrains Mono) — ALL data, trace steps, code, timestamps, metrics
- `font-sans` (Inter) — UI labels, panel headers, buttons only

**Signature element:**
Tool-call trace steps animate in sequentially with a horizontal timing bar showing
step duration in ms — like a waterfall profiler / Lighthouse timeline.
This is the single most memorable UI element. Protect it.

---

## Architecture

```
src/
  components/
    StreamPanel.tsx        # Left: streaming LLM token render
    TracePanel.tsx         # Right: tool-call audit trace  
    TelemetryBar.tsx       # Top: ops metrics strip
    TraceStep.tsx          # Individual tool-call step with timing bar
    StreamCursor.tsx       # Blinking cursor during active stream
    StatusBadge.tsx        # running | complete | error | warning
  hooks/
    useStream.ts           # Manages SSE/streaming state from API route
    useTrace.ts            # Manages tool-call step accumulation
    useTelemetry.ts        # Fake telemetry ticker for demo realism
  lib/
    tokens.ts              # Design tokens (single source of truth)
    anthropic.ts           # Anthropic SDK client config
    streamParser.ts        # Parses streaming chunks into tokens + tool events
  types/
    index.ts               # TraceStep, StreamChunk, TelemetryState, ReviewJob
  mocks/
    reviewSession.ts       # Full canned PR review session for demo mode
    toolCallSequence.ts    # Realistic tool-call sequence with timing data
  app/
    api/
      review/
        route.ts           # Next.js API route — streams Anthropic response
    page.tsx               # Root — assembles panels, manages session state
    layout.tsx             # Font loading, global styles
```

---

## Behavior spec

### Demo mode (default)
- On load: show idle state with queue telemetry ticking
- "Run Review" button triggers mock session replay
- Mock data plays back at realistic speed (token delay: 18ms, step delay: 400ms)
- Looks identical to live mode — interviewer cannot tell the difference

### Live mode (env: `DEMO_MODE=false`)
- Calls `/api/review` which streams real Anthropic response
- Streaming chunks parsed for both text tokens and tool_use events
- Tool events fire into TracePanel in real time as they arrive

### Session flow
1. TelemetryBar shows: "1 review queued"
2. User hits "Run Review" — status shifts to "analyzing"
3. StreamPanel begins rendering tokens left-to-right, line-wrapping naturally
4. TracePanel steps appear sequentially as tools fire:
   - `fetch_pr_diff` → `analyze_file_structure` → `check_type_safety` → 
     `scan_runtime_risks` → `assess_performance` → `generate_summary`
5. Each step shows: tool name, input params (truncated), duration bar, status badge
6. On completion: summary rendered, telemetry resets, export button activates

---

## Tool-call sequence (the audit trail)

These are the 6 tools the agent runs. Match these names exactly:

| Step | Tool | Typical duration |
|------|------|-----------------|
| 1 | `fetch_pr_diff` | 120–280ms |
| 2 | `analyze_file_structure` | 80–160ms |
| 3 | `check_type_safety` | 200–420ms |
| 4 | `scan_runtime_risks` | 180–350ms |
| 5 | `assess_performance` | 150–300ms |
| 6 | `generate_summary` | 60–100ms |

Duration bars animate from 0 to full width over the actual duration value.
Color: accent (#00D4FF) while running → success (#22C55E) on complete.

---

## What NOT to do

- No gradients on text (kills readability at this density)
- No rounded corners > 4px on data panels (this is a terminal, not a consumer app)
- No skeleton loaders — use actual dim placeholder text instead
- No `any` in TypeScript
- No hardcoded colors — always reference tokens
- No mock data leaking into the live API path
- Do not use Redux — React state + hooks only
- Do not install charting libraries — timing bars are pure CSS width transitions

---

## PR content for demo

**Repo:** `acme-bank/ledger-ui`  
**PR #247:** "feat: add real-time transaction stream to compliance dashboard"  
**Files changed:** 4 (TransactionStream.tsx, useWebSocket.ts, api/transactions/route.ts, types/index.ts)  
**Author:** @dev-team  

This is the fake PR the agent reviews. All mock analysis output should reference
these actual filenames and realistic issues (missing error boundaries, untyped
WebSocket messages, no reconnection logic, memory leak in useEffect cleanup).

---

## Environment variables

```
ANTHROPIC_API_KEY=          # Required for live mode
DEMO_MODE=true              # Default: true (mock replay)
NEXT_PUBLIC_DEMO_MODE=true  # Exposed to client for mode indicator
```

---

## Definition of done

- [ ] TelemetryBar renders with ticking metrics
- [ ] StreamPanel renders tokens with cursor, line-wraps naturally  
- [ ] TracePanel shows all 6 steps with timing bars animating
- [ ] Demo mode plays back full session on button press
- [ ] Looks identical in demo and live mode
- [ ] TypeScript strict — zero errors
- [ ] No hardcoded colors
- [ ] Deployed to Vercel (demo mode only — no API key in prod)
- [ ] README has 30-second pitch paragraph for recruiters
