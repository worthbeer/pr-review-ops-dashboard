# PR Review Ops Dashboard

**Live demo of an agentic code review system with real-time tool-call visualization.**

A Senior/Staff Frontend Engineer artifact — built to demonstrate streaming LLM UI, agentic workflow visualization, and high-density compliance-grade design at production quality.

---

## What this shows

This is the ops surface you'd build around an AI agent running in production at a fintech or banking platform. It demonstrates:

- **Streaming LLM UI** — token-by-token rendering without re-render thrash, using a ref buffer flushed on requestAnimationFrame
- **Tool-call audit trail** — each agent step appears in real time with animated timing bars (waterfall profiler aesthetic), status badges, and truncated output summaries
- **Live ops telemetry** — queue depth, active reviews, avg latency, throughput — ticking with realistic variance
- **Demo/live mode parity** — demo mode replays a canned session at realistic speed; the UI is identical to the live Anthropic stream path

The agent reviews `acme-bank/ledger-ui` PR #247, running 6 tools: `fetch_pr_diff → analyze_file_structure → check_type_safety → scan_runtime_risks → assess_performance → generate_summary`.

---

## Stack

- **Next.js 14** (App Router, Server Components, streaming API route)
- **TypeScript** (strict mode)
- **Tailwind CSS** (token-driven, no arbitrary values)
- **Anthropic SDK** (`claude-sonnet-4-6`, tool_use, SSE streaming)
- **JetBrains Mono** for all data surfaces; **Inter** for UI

---

## Setup

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY for live mode
# Leave DEMO_MODE=true to run without API costs
npm run dev
```

### VS Code
Open the project — tasks are pre-configured:
- `Cmd+Shift+B` → starts dev server in demo mode
- Task: "Live Mode" → runs with real Anthropic stream

---

## Architecture

```
src/
  components/
    TelemetryBar      # Top: ops metrics strip
    StreamPanel       # Left: token-by-token LLM render
    TracePanel        # Right: tool-call audit trail
    TraceStep         # Individual step with timing bar
    StatusBadge       # running | complete | error
    StreamCursor      # Blinking cursor during active stream
  hooks/
    useStream         # Manages streaming state (demo or live)
    useTrace          # Accumulates tool-call steps
    useTelemetry      # Fake ops telemetry ticker
  lib/
    tokens            # Design system — all color, type, spacing
    anthropic         # SDK config + tool definitions
    streamParser      # Parses SSE chunks into tokens + tool events
  mocks/
    reviewSession     # Full canned session for demo mode
  app/
    api/review/       # Streaming Next.js API route
    page.tsx          # Root layout + session orchestration
```

---

## Design

Terminal aesthetic — Bloomberg meets Linear. Near-black base, electric cyan for live state, amber for warnings. JetBrains Mono on all data surfaces. The signature element: tool-call timing bars animate from 0 to full width over the actual step duration — a waterfall profiler rendered in pure CSS transitions.

No charting libraries. No component libraries. Raw Tailwind off the token system.

---

## Related work

This is the visual layer built on top of the agentic loop from [frontend-code-review](https://github.com/worthbeer/frontend-code-review) — the same PR review agent architecture, now with a production ops surface.

---

*Built by [William Bierwerth](https://github.com/worthbeer) — Senior Frontend Engineer*
