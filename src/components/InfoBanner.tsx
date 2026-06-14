'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pr-dash-info-collapsed'

export function InfoBanner() {
  const [collapsed, setCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        setCollapsed(saved === 'true')
      } else {
        setCollapsed(window.innerWidth < 768)
      }
    } catch {
      // localStorage unavailable
      setCollapsed(window.innerWidth < 768)
    }
    setMounted(true)
  }, [])

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  if (!mounted) return null

  return (
    <div className="shrink-0 mx-3 mt-3 border border-panel-border rounded-panel bg-panel overflow-hidden">

      {/* Header — always visible, tap to expand/collapse */}
      <button
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand about this demo' : 'Collapse about this demo'}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-panel-hover transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-sans text-xs font-medium tracking-widest text-dim uppercase whitespace-nowrap">
            About this demo
          </span>
          <span className="font-mono text-xs text-accent border border-accent px-1.5 py-0.5 rounded-badge shrink-0">
            PORTFOLIO
          </span>
          {/* One-liner preview shown when collapsed */}
          {collapsed && (
            <span className="font-mono text-xs text-muted truncate hidden sm:inline">
              — AI agent reviews a fictional banking PR in real time
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-dim select-none shrink-0 ml-3" aria-hidden="true">
          {collapsed ? '▼ expand' : '▲ collapse'}
        </span>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="border-t border-panel-border px-3 py-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* Col 1: What this is */}
          <div>
            <p className="font-sans text-xs font-medium text-secondary uppercase tracking-widest mb-1.5">
              What you&apos;re looking at
            </p>
            <p className="font-mono text-xs text-primary leading-relaxed">
              A real-time ops dashboard for an AI code review agent. The left panel
              streams the agent&apos;s written analysis token-by-token. The right panel
              shows each tool the agent calls — with timing bars showing how long
              each step took.
            </p>
          </div>

          {/* Col 2: How to use */}
          <div>
            <p className="font-sans text-xs font-medium text-secondary uppercase tracking-widest mb-1.5">
              How to use it
            </p>
            <ol className="font-mono text-xs text-primary leading-relaxed space-y-1 list-none">
              <li><span className="text-accent mr-1.5">01</span>Click <span className="text-accent">RUN REVIEW</span> in the footer</li>
              <li><span className="text-accent mr-1.5">02</span>Watch the analysis stream in on the left</li>
              <li><span className="text-accent mr-1.5">03</span>Track tool calls appear on the right in real time</li>
              <li><span className="text-accent mr-1.5">04</span>Session completes in ~20 seconds</li>
            </ol>
          </div>

          {/* Col 3: Limitations */}
          <div className="sm:col-span-2 md:col-span-1">
            <p className="font-sans text-xs font-medium text-secondary uppercase tracking-widest mb-1.5">
              Limitations
            </p>
            <ul className="font-mono text-xs leading-relaxed space-y-1.5 list-none">
              <li className="text-warning">
                ⚠ The PR being reviewed is fictional
                <span className="text-dim block pl-3">acme-bank/ledger-ui #247 — not a real repo</span>
              </li>
              <li className="text-warning">
                ⚠ Tools are simulated in demo mode
                <span className="text-dim block pl-3">Pre-scripted replay; no live API calls</span>
              </li>
              <li className="text-dim mt-1">
                In live mode (local, with API key) the left panel streams real
                Claude output and tool trace updates as the model actually calls tools.
              </li>
            </ul>
          </div>

        </div>
      )}
    </div>
  )
}
