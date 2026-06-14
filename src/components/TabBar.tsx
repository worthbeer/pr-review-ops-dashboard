'use client'

import type { TabId } from '@/types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'analysis',  label: 'ANALYSIS'  },
  { id: 'waterfall', label: 'WATERFALL' },
  { id: 'findings',  label: 'FINDINGS'  },
  { id: 'flame',     label: 'FLAME'     },
  { id: 'metrics',   label: 'METRICS'   },
]

interface Props {
  activeTab:        TabId
  onTabChange:      (tab: TabId) => void
  execMode:         boolean
  onExecModeChange: (val: boolean) => void
  findingCount:     number
}

export function TabBar({ activeTab, onTabChange, execMode, onExecModeChange, findingCount }: Props) {
  return (
    <div className="shrink-0 flex items-center justify-between border-b border-panel-border bg-panel">
      <div role="tablist" aria-label="Dashboard views" className="flex items-center overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={[
              'relative font-mono text-xs tracking-widest px-4 py-2.5 border-b-2 transition-colors duration-150 whitespace-nowrap',
              activeTab === tab.id
                ? 'text-accent border-accent'
                : 'text-dim border-transparent hover:text-secondary',
            ].join(' ')}
          >
            {tab.label}
            {tab.id === 'findings' && findingCount > 0 && (
              <span className="ml-1.5 bg-error text-panel rounded-full font-mono text-[8px] font-bold px-1 py-px leading-none">
                {findingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5 px-3 shrink-0">
        {(['TECHNICAL', 'EXECUTIVE'] as const).map(mode => {
          const isActive = (mode === 'EXECUTIVE') === execMode
          return (
            <button
              key={mode}
              onClick={() => onExecModeChange(mode === 'EXECUTIVE')}
              className={[
                'font-mono text-[9px] tracking-widest px-2.5 py-1 rounded-badge transition-all duration-150',
                isActive
                  ? 'bg-accent text-panel font-bold'
                  : 'text-dim hover:text-secondary',
              ].join(' ')}
            >
              {mode}
            </button>
          )
        })}
      </div>
    </div>
  )
}
