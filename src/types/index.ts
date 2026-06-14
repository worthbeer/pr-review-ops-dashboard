// types/index.ts
// Single source of truth for all shared types in this project

// ─── Trace / Tool-call audit ─────────────────────────────────────────────────

export type StepStatus = 'pending' | 'running' | 'complete' | 'error'

export interface TraceStep {
  id: string
  tool: ToolName
  status: StepStatus
  startedAt: number         // Date.now() when tool_start fired
  completedAt?: number      // Date.now() when tool_complete fired
  durationMs?: number       // completedAt - startedAt
  input?: Record<string, unknown>
  outputSummary?: string    // truncated — never full output in trace panel
}

export type ToolName =
  | 'fetch_pr_diff'
  | 'analyze_file_structure'
  | 'check_type_safety'
  | 'scan_runtime_risks'
  | 'assess_performance'
  | 'generate_summary'

// ─── Stream state ─────────────────────────────────────────────────────────────

export type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'complete' | 'error'

export interface StreamState {
  status: StreamStatus
  text: string              // accumulated display text
  errorMessage?: string
}

// ─── Telemetry ────────────────────────────────────────────────────────────────

export interface TelemetryState {
  activeReviews: number
  queueDepth: number
  avgLatencyMs: number
  throughputRpm: number
  isLive: boolean
}

// ─── Review session ───────────────────────────────────────────────────────────

export interface ReviewJob {
  id: string
  prNumber: number
  repo: string
  prTitle: string
  author: string
  filesChanged: number
  status: 'queued' | 'running' | 'complete' | 'error'
  startedAt?: number
  completedAt?: number
}

// ─── Mock replay system ───────────────────────────────────────────────────────

export type MockEventType = 'token' | 'tool_start' | 'tool_complete' | 'complete'

export interface MockTokenEvent {
  type: 'token'
  text: string
  delay: number             // ms to wait before emitting
}

export interface MockToolStartEvent {
  type: 'tool_start'
  tool: ToolName
  delay: number
}

export interface MockToolCompleteEvent {
  type: 'tool_complete'
  tool: ToolName
  durationMs: number
  outputSummary: string
  delay: number
}

export interface MockCompleteEvent {
  type: 'complete'
  delay: number
}

export type MockEvent =
  | MockTokenEvent
  | MockToolStartEvent
  | MockToolCompleteEvent
  | MockCompleteEvent

export interface MockSession {
  job: ReviewJob
  telemetrySnapshot: TelemetryState
  events: MockEvent[]
}

// ─── Replay handlers (consumed by useStream + useTrace) ───────────────────────

export interface ReplayHandlers {
  onToken: (text: string) => void
  onToolStart: (tool: ToolName) => void
  onToolComplete: (tool: ToolName, durationMs: number, outputSummary: string) => void
  onComplete: () => void
  onError: (message: string) => void
}

// ─── Stream parser ────────────────────────────────────────────────────────────

export type ParsedEventKind = 'token' | 'tool_start' | 'tool_end' | 'noop' | 'done'

export interface ParsedTokenEvent {
  kind: 'token'
  text: string
}

export interface ParsedToolStartEvent {
  kind: 'tool_start'
  name: ToolName
  id: string
}

export interface ParsedToolEndEvent {
  kind: 'tool_end'
  id: string
}

export interface ParsedNoopEvent {
  kind: 'noop'
}

export interface ParsedDoneEvent {
  kind: 'done'
}

export type ParsedEvent =
  | ParsedTokenEvent
  | ParsedToolStartEvent
  | ParsedToolEndEvent
  | ParsedNoopEvent
  | ParsedDoneEvent
