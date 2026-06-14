import type { StepStatus } from '@/types'

interface Props {
  status: StepStatus
}

const config: Record<StepStatus, { label: string; className: string }> = {
  pending:  { label: '—',       className: 'text-dim' },
  running:  { label: 'RUNNING', className: 'text-accent' },
  complete: { label: 'DONE',    className: 'text-success' },
  error:    { label: 'ERR',     className: 'text-error' },
}

export function StatusBadge({ status }: Props) {
  const { label, className } = config[status]

  return (
    <span className={`font-mono text-xs tracking-widest ${className}`}>
      {status === 'running' && (
        <span className="inline-block mr-1 text-accent animate-pulse">●</span>
      )}
      {label}
    </span>
  )
}
