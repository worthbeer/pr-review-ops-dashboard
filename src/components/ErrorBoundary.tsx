'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children:  ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error:    Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 gap-2">
          <p className="font-mono text-xs text-error tracking-widest">RENDER ERROR</p>
          <p className="font-mono text-xs text-dim">{this.state.error?.message ?? 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 font-mono text-xs text-accent border border-accent px-3 py-1 rounded-badge hover:bg-accent-dim transition-colors"
          >
            RETRY
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
