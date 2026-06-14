# Edge Case Log — PR Review Ops Dashboard

Track every non-obvious decision here. Pattern: what happened, why, what we chose.

---

## Streaming

### [OPEN] Token buffer flush strategy
**Problem:** Setting state on every token causes 50+ re-renders/second during fast streaming.
**Decision:** Buffer tokens in a ref, flush via requestAnimationFrame.
**Watch for:** RAF not firing when tab is backgrounded — tokens accumulate but don't render until tab refocused. Acceptable for demo, document it.

### [OPEN] Stream parser — tool event ordering
**Problem:** `content_block_start` (tool_use) arrives before `content_block_delta`. Parser must track "current block" state.
**Decision:** Stateful parser with `currentToolId` ref. Reset on `content_block_stop`.
**Watch for:** Multiple tool_use blocks in single response — ensure IDs are tracked independently.

---

## Mock system

### [OPEN] Demo mode detection
**Problem:** `DEMO_MODE` env var must be checked server-side AND client-side.
**Decision:** `DEMO_MODE` for server (API route), `NEXT_PUBLIC_DEMO_MODE` for client components.
**Watch for:** Vercel deployment — ensure `NEXT_PUBLIC_DEMO_MODE=true` is set in project env, never expose `ANTHROPIC_API_KEY` to client.

---

## Timing bars

### [OPEN] CSS transition trigger timing
**Problem:** Setting width in initial render means transition never fires (no change to animate from).
**Decision:** Initial width: 0. useEffect fires on status === 'complete', CSS transition handles the animation.
**Watch for:** Steps that complete before component mounts — need to detect this and skip transition, just show full bar.

---

## Layout

### [OPEN] Panel height on mobile
**Problem:** Split panel collapses poorly below 768px.
**Decision:** Stack vertically on mobile (TracePanel below StreamPanel). TelemetryBar stays fixed top.
**Watch for:** This is a desktop tool — mobile is nice-to-have, not required for demo.

---

## Add entries here as you build

Format:
### [STATUS: OPEN|RESOLVED] Short title
**Problem:** What went wrong or what was unclear.
**Decision:** What we chose and why.
**Watch for:** What could still bite us.
