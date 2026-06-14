import type { ParsedEvent, ToolName } from '@/types'

const KNOWN_TOOL_NAMES = new Set<string>([
  'fetch_pr_diff',
  'analyze_file_structure',
  'check_type_safety',
  'scan_runtime_risks',
  'assess_performance',
  'generate_summary',
])

function isToolName(name: unknown): name is ToolName {
  return typeof name === 'string' && KNOWN_TOOL_NAMES.has(name)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

export function createStreamParser() {
  let currentBlockType: 'text' | 'tool_use' | null = null
  let currentToolId: string | null = null
  let currentToolName: ToolName | null = null

  return function parse(chunk: unknown): ParsedEvent {
    if (!isObject(chunk)) return { kind: 'noop' }

    if (chunk.type === 'content_block_start') {
      const block = chunk.content_block
      if (!isObject(block)) return { kind: 'noop' }

      currentBlockType = block.type === 'tool_use' ? 'tool_use' : 'text'

      if (
        block.type === 'tool_use' &&
        typeof block.id === 'string' &&
        isToolName(block.name)
      ) {
        currentToolId = block.id
        currentToolName = block.name
        return { kind: 'tool_start', name: currentToolName, id: currentToolId }
      }

      return { kind: 'noop' }
    }

    if (chunk.type === 'content_block_delta') {
      const delta = chunk.delta
      if (!isObject(delta)) return { kind: 'noop' }

      if (delta.type === 'text_delta' && typeof delta.text === 'string') {
        return { kind: 'token', text: delta.text }
      }
      return { kind: 'noop' }
    }

    if (chunk.type === 'content_block_stop') {
      if (currentBlockType === 'tool_use' && currentToolId) {
        const id = currentToolId
        currentBlockType = null
        currentToolId = null
        currentToolName = null
        return { kind: 'tool_end', id }
      }
      currentBlockType = null
      return { kind: 'noop' }
    }

    if (chunk.type === 'message_stop') {
      return { kind: 'done' }
    }

    return { kind: 'noop' }
  }
}
