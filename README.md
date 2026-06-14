# PR Review Ops Dashboard

**Live demo → [pr-review-ops-dashboard.vercel.app](https://pr-review-ops-dashboard.vercel.app)**

A production-grade AI operations dashboard that visualizes a running code review agent in real time. Streaming LLM analysis on the left, live tool-call audit trail with timing data on the right, operational telemetry across the top.

Built as a senior-level portfolio artifact targeting AI-native fintech and banking engineering roles.

---

## What it demonstrates

| Capability | Implementation |
|---|---|
| Streaming LLM UI | Token-by-token render via `requestAnimationFrame` batching — 60fps regardless of token rate |
| Tool-call visualization | Sequential 6-step audit trail with animated timing bars matching actual execution time |
| Agentic workflow | State machine managing tool start/end correlation across a multi-step agent loop |
| Real-time telemetry | Live ops metrics strip with session-aware pause/resume |
| Design token system | 4 themes via CSS custom properties — zero re-renders on switch, FOUC-free on return visits |
| Streaming architecture | SSE from Next.js API route → `ReadableStreamDefaultReader` → stateful event parser → RAF flush |

---

## Stack

- **Next.js 14** — App Router, Server Components, `nodejs` runtime API route
- **TypeScript** — strict mode, zero errors, no `any`, runtime type narrowing
- **Anthropic SDK** — `messages.stream()` for real SSE streaming in live mode
- **Tailwind CSS** — design token system via CSS custom properties
- **Vitest** — 39 unit tests covering stream parser, trace state machine, theme system

---

## Architecture

```
useStream          →  SSE/demo replay, RAF token buffering, cancellation
useTrace           →  tool-call steps, one-to-one start/end pairing
useTelemetry       →  live ops metrics, session-aware pause/resume

streamParser.ts    →  stateful Anthropic SSE event parser
                       content_block_start → tool_start
                       text_delta         → token
                       content_block_stop → tool_end
                       message_stop       → done

StreamPanel        →  token-by-token text render, RAF-batched
TracePanel         →  tool-call audit trail, CSS timing bars
TelemetryBar       →  ops metrics, theme switcher
AboutDrawer        →  slide-in reference panel with glossary
```

Two operating modes, identical output:

- **Demo mode** (default, live site) — pre-recorded session replay at realistic speed
- **Live mode** (`DEMO_MODE=false` + API key) — real Anthropic streaming, real tool calls

---

## Run locally

```bash
git clone https://github.com/worthbeer/pr-review-ops-dashboard.git
cd pr-review-ops-dashboard
npm install
```

**Demo mode** — no API key required:
```bash
npm run dev
```

**Live mode** — real Anthropic streaming:
```bash
# Create .env.local with:
ANTHROPIC_API_KEY=your_key_here
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false

npm run dev
```

Open [localhost:3000](http://localhost:3000) and click **RUN REVIEW**.

---

## Tests

```bash
npm test
```

```
 Test Files  3 passed (3)
      Tests  39 passed (39)
```

- `src/lib/streamParser.test.ts` — all event types, state isolation between concurrent sessions, unknown tool name fallback, full 6-tool sequence
- `src/hooks/useTrace.test.ts` — step lifecycle, one-to-one start/end pairing, reset, full sequence
- `src/lib/themes.test.ts` — all four themes, every CSS variable, `applyTheme` DOM application

---

## Design

Terminal aesthetic — near-black base, electric cyan for live state, amber for warnings. JetBrains Mono on all data surfaces; Inter for UI chrome. The signature element: tool-call timing bars animate from 0 to full width over the actual step duration — a waterfall profiler in pure CSS transitions.

No charting libraries. No component libraries. Tailwind off the token system.

---

William Bierwerth · [wbierwerth@gmail.com](mailto:wbierwerth@gmail.com)
