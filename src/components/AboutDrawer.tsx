'use client'

import { useEffect, useState } from 'react'

// ─── Content ─────────────────────────────────────────────────────────────────

const SYNOPSIS: string[] = [
  `This is what it looks like to build the operational layer of an AI-native banking platform. The audit trail on the right — sequential tool calls, timing data, and status states across six discrete checks — is the compliance-facing observability surface that Tier-1 operations teams depend on. The streaming panel on the left is the interaction pattern defining the next generation of financial AI products.`,
  `The PR under review is a fictional banking compliance dashboard: acme-bank/ledger-ui, PR #247, four changed files including a real-time WebSocket stream and its type definitions. The agent's analysis surfaces concrete engineering concerns — missing error boundaries, untyped WebSocket messages, memory leaks in useEffect cleanup — because the problems that appear in banking frontend code are precisely the problems this kind of tooling is built to catch before they reach production.`,
  `Stack: Next.js 14 App Router, TypeScript strict mode with zero errors and no type assertions, Anthropic SDK for real streaming, Tailwind CSS over a design token system. The architecture — streaming state machine, live tool-call trace, operational telemetry — reflects the patterns required to build frontend infrastructure at enterprise scale.`,
]

interface GlossaryEntry {
  id:         string
  num:        string
  title:      string
  tag:        string
  paragraphs: string[]
}

const GLOSSARY: GlossaryEntry[] = [
  {
    id:    'overview',
    num:   '01',
    title: 'What You\'re Looking At',
    tag:   'system overview',
    paragraphs: [
      `Imagine you hired a specialist consultant to review a complex document — say, a new financial regulation that affects your business. You don't just want the final verdict. You want to watch them work in real time: which section they're reading now, what questions they're raising, how long each concern takes to evaluate, and the moment their conclusion takes shape on the page.`,
      `That's what this dashboard does — except the consultant is an AI, and the document is a software change destined for a banking application. The left panel streams the AI's written analysis word by word, as it thinks. The right panel is a live record of every action the AI took to reach those conclusions — like watching someone's research tabs open and close, formatted as a professional audit trail. The metrics strip across the top reports what the system is doing at this exact moment.`,
    ],
  },
  {
    id:    'session-flow',
    num:   '02',
    title: 'The Session Flow',
    tag:   'interaction model',
    paragraphs: [
      `Clicking RUN REVIEW is like dialing into a conference call where the AI is already in the room and ready to begin. The system first clears any previous session — old analysis text, old tool records, everything — so you're starting from a clean slate.`,
      `It then updates the metrics strip to reflect that a new review has entered the active queue. The word CONNECTING appears, signaling the system is establishing contact with the AI. Once ready, the status flips to STREAMING and the analysis begins flowing to the screen.`,
    ],
  },
  {
    id:    'streaming',
    num:   '03',
    title: 'Streaming Analysis',
    tag:   'core feature · rendering',
    paragraphs: [
      `Most software shows you finished content. You submit a request, you wait, you get a result. This dashboard does something fundamentally different: it shows the answer forming in real time, the way you'd watch someone type.`,
      `The AI doesn't produce its full response and then send it. It produces one small piece at a time — sometimes a word, sometimes just a syllable — and each piece travels from the AI's servers to your browser the moment it's ready. These pieces are called tokens. An AI running at full speed can produce fifty to eighty of them per second.`,
      `Without careful engineering, updating the display on every individual token would cause the browser to stutter — it would spend more time on internal bookkeeping than on actual painting. The solution is batching: tokens accumulate in a buffer and flush to the screen on a fixed rhythm, sixty times per second, synchronized to the display's natural refresh cycle. The result is smooth, continuous text flow regardless of how fast the AI is producing output.`,
    ],
  },
  {
    id:    'trace',
    num:   '04',
    title: 'Tool Call Trace',
    tag:   'core feature · agent behavior',
    paragraphs: [
      `The AI doesn't freestyle its analysis. Before writing a single word, it runs a sequence of structured investigations — the same way a physician runs specific diagnostics before making a determination rather than guessing from observation alone.`,
      `The six checks are: (1) fetch the actual code changes being reviewed, like pulling up the document before reading it; (2) analyze how the changed files relate to each other architecturally; (3) check for type safety errors, a specific class of coding mistake common in the language being used; (4) scan for runtime risks — problems that only surface when software is running in front of real users, such as memory leaks or missing cleanup; (5) assess whether the changes could slow the application under real-world load; and (6) synthesize all findings into a structured verdict with severity ratings.`,
      `Each check appears in the right panel the moment it begins. The timing bar fills in real time at the actual speed the check ran — a longer bar means a more involved check. Color shifts from active to complete when the result is confirmed.`,
    ],
  },
  {
    id:    'demo-live',
    num:   '05',
    title: 'Demo vs. Live Mode',
    tag:   'deployment · architecture',
    paragraphs: [
      `The dashboard has two operating modes that look completely identical from the outside.`,
      `In demo mode — which is what runs on this public site — the session you're watching is a pre-recorded replay from a real AI session, played back at realistic speed with the same timing the original had. It is a flight simulator: everything behaves exactly as it would in actual flight, but no plane is in the air.`,
      `In live mode — which runs locally when you supply your own API key — clicking RUN REVIEW dials a real AI. Every word appearing on the left is being generated at that moment. No two sessions will ever be identical. The reason for the distinction is practical: live AI sessions cost money and require keeping a private credential secret. A public site cannot expose that. Because both modes run through the exact same display machinery, a viewer cannot tell which one they are watching. The DEMO badge in the top right is the only tell.`,
    ],
  },
  {
    id:    'batching',
    num:   '06',
    title: 'Token Batching',
    tag:   'performance · architecture',
    paragraphs: [
      `At fifty to eighty tokens per second, updating the screen on every individual token would trigger fifty to eighty React re-renders per second. React re-renders are fast, but not that fast — the browser would spend more time on internal bookkeeping than on painting, and the text display would visibly stutter.`,
      `The solution: tokens land in a memory buffer — a variable the display never directly watches. A timed flush runs sixty times per second and transfers the entire buffer to the screen in a single update. This matches the display's natural refresh cycle exactly. The AI can generate at full speed; the user sees smooth continuous text flow; and the browser never works harder than the display can benefit from.`,
    ],
  },
  {
    id:    'telemetry',
    num:   '07',
    title: 'Ops Telemetry',
    tag:   'monitoring · observability',
    paragraphs: [
      `The numbers across the top simulate what an operations team monitors in a production deployment. ACTIVE shows how many AI review sessions are currently running across the full system. QUEUED shows how many are waiting to start. LATENCY measures how quickly the system is responding in milliseconds — anything under 300ms is considered healthy. RPM is reviews per minute, a throughput measure of how hard the system is working.`,
      `These numbers drift and fluctuate on their own while no session is running, simulating a live environment where other reviews are always in flight. When you start a session, ACTIVE increments and QUEUED decrements, then both reset on completion. The intent is to convey that this isn't a tool running in isolation — it's one window into a larger operation.`,
    ],
  },
  {
    id:    'architecture',
    num:   '08',
    title: 'System Architecture',
    tag:   'engineering · error isolation',
    paragraphs: [
      `The streaming text, the tool trace, and the telemetry each have their own independent manager. They don't share data directly — they communicate through events. When the AI calls a tool, the stream manager fires a notification. The trace manager receives it and adds a row to the audit trail. When the tool completes, another notification updates that row. The telemetry manager receives its own signal to pause background variance ticking during an active session.`,
      `This separation means a failure in one area cannot cascade into others. If the streaming panel encountered an error, the tool trace and metrics would keep running normally — a visible error message appears in the affected panel with a retry option, rather than the entire dashboard going blank. This is what error boundary means in practice: a structural fence around each component so a failure in one room doesn't take down the house.`,
    ],
  },
]

// ─── Glossary row ─────────────────────────────────────────────────────────────

function GlossaryRow({
  entry,
  isActive,
  isLast,
  onToggle,
}: {
  entry:    GlossaryEntry
  isActive: boolean
  isLast:   boolean
  onToggle: () => void
}) {
  return (
    <div className={!isLast ? 'border-b border-panel-border' : ''}>
      <button
        onClick={onToggle}
        aria-expanded={isActive}
        className="w-full flex items-start gap-4 px-6 py-4 hover:bg-panel-hover transition-colors duration-150 text-left"
      >
        <span className="font-mono text-xs text-muted shrink-0 tabular-nums pt-px">
          {entry.num}
        </span>
        <span className="flex-1 min-w-0">
          <span className="font-sans text-sm font-semibold text-primary block leading-snug">
            {entry.title}
          </span>
          <span className="font-mono text-xs text-dim mt-0.5 block">{entry.tag}</span>
        </span>
        <span
          className="font-mono text-xs text-dim shrink-0 mt-0.5 transition-transform duration-200 select-none"
          style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {/* Accordion body — CSS grid trick for smooth height animation */}
      <div
        style={{
          display:           'grid',
          gridTemplateRows:  isActive ? '1fr' : '0fr',
          transition:        'grid-template-rows 220ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="px-6 pb-5">
            <div className="ml-8 pl-4 border-l-2 border-accent space-y-3">
              {entry.paragraphs.map((p, i) => (
                <p key={i} className="font-sans text-sm text-secondary leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AboutDrawer() {
  const [open, setOpen]         = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const toggleEntry = (id: string) =>
    setActiveId(prev => prev === id ? null : id)

  return (
    <>
      {/* ── Trigger bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 mx-3 mt-3 border border-panel-border rounded-panel bg-panel">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs text-accent select-none" aria-hidden="true">⊕</span>
            <span className="font-sans text-xs font-medium tracking-widest text-dim uppercase whitespace-nowrap">
              What am I?
            </span>
            <span className="font-mono text-xs text-muted truncate hidden sm:block">
              — Real-time AI ops dashboard · code review visualization · portfolio
            </span>
          </div>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open about this dashboard"
            className="shrink-0 ml-3 font-mono text-xs text-accent border border-accent px-2.5 py-1 rounded-badge hover:bg-accent-dim transition-colors duration-150 tracking-widest whitespace-nowrap"
          >
            ABOUT ›
          </button>
        </div>
      </div>

      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-base/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Drawer ────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="About this dashboard"
        className={`
          fixed top-0 right-0 h-full z-50
          w-full sm:w-[480px] lg:w-[560px]
          bg-panel border-l border-panel-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Drawer header */}
        <div className="shrink-0 border-b border-panel-border px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest mb-2">
              PR REVIEW OPS DASHBOARD
            </p>
            <p className="font-sans text-base font-semibold text-primary leading-tight">
              Real-Time AI Code Review Visualization
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close about panel"
            className="shrink-0 font-mono text-xs text-dim hover:text-primary border border-panel-border hover:border-dim px-2.5 py-1.5 rounded-badge transition-colors duration-150 tracking-widest whitespace-nowrap mt-0.5"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Synopsis */}
          <section className="px-6 py-6 border-b border-panel-border">
            <p className="font-sans text-xs font-semibold text-dim tracking-widest uppercase mb-4">
              The Case for This Work
            </p>
            <div className="space-y-4">
              {SYNOPSIS.map((p, i) => (
                <p
                  key={i}
                  className={`font-sans text-sm leading-relaxed ${
                    i === 0 ? 'text-primary' : 'text-secondary'
                  }`}
                >
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* Glossary header */}
          <div className="px-6 py-4 border-b border-panel-border flex items-center justify-between">
            <p className="font-sans text-xs font-semibold text-dim tracking-widest uppercase">
              Reference Glossary
            </p>
            <p className="font-mono text-xs text-muted tabular-nums">
              {GLOSSARY.length} entries
            </p>
          </div>

          {/* Glossary entries */}
          <div>
            {GLOSSARY.map((entry, i) => (
              <GlossaryRow
                key={entry.id}
                entry={entry}
                isActive={activeId === entry.id}
                isLast={i === GLOSSARY.length - 1}
                onToggle={() => toggleEntry(entry.id)}
              />
            ))}
          </div>

          {/* Drawer footer */}
          <div className="px-6 py-5 border-t border-panel-border space-y-2">
            <p className="font-mono text-xs text-dim leading-relaxed">
              Next.js 14 App Router · TypeScript strict · Anthropic SDK · Tailwind CSS · Vercel
            </p>
            <p className="font-mono text-xs text-muted leading-relaxed">
              Source code available on request — wbierwerth@gmail.com
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
