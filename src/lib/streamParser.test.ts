import { describe, it, expect } from 'vitest'
import { createStreamParser } from './streamParser'

describe('createStreamParser', () => {

  // ── Defensive input handling ─────────────────────────────────────────────

  it('returns noop for null', () => {
    expect(createStreamParser()(null)).toEqual({ kind: 'noop' })
  })

  it('returns noop for a plain string', () => {
    expect(createStreamParser()('data: ping')).toEqual({ kind: 'noop' })
  })

  it('returns noop for an empty object', () => {
    expect(createStreamParser()({})).toEqual({ kind: 'noop' })
  })

  it('returns noop for an unrecognised event type', () => {
    expect(createStreamParser()({ type: 'message_start' })).toEqual({ kind: 'noop' })
  })

  // ── tool_start ───────────────────────────────────────────────────────────

  it('emits tool_start for a known tool name', () => {
    const parse = createStreamParser()
    expect(
      parse({
        type: 'content_block_start',
        content_block: { type: 'tool_use', id: 'tu_001', name: 'fetch_pr_diff' },
      })
    ).toEqual({ kind: 'tool_start', name: 'fetch_pr_diff', id: 'tu_001' })
  })

  it('returns noop for an unknown tool name — no crash, no corrupt state', () => {
    const parse = createStreamParser()
    expect(
      parse({
        type: 'content_block_start',
        content_block: { type: 'tool_use', id: 'tu_002', name: 'unknown_tool' },
      })
    ).toEqual({ kind: 'noop' })
  })

  it('returns noop for a text content block start', () => {
    const parse = createStreamParser()
    expect(
      parse({ type: 'content_block_start', content_block: { type: 'text' } })
    ).toEqual({ kind: 'noop' })
  })

  it('returns noop when content_block is missing', () => {
    const parse = createStreamParser()
    expect(parse({ type: 'content_block_start' })).toEqual({ kind: 'noop' })
  })

  // ── token ────────────────────────────────────────────────────────────────

  it('emits token for text_delta', () => {
    const parse = createStreamParser()
    expect(
      parse({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } })
    ).toEqual({ kind: 'token', text: 'Hello' })
  })

  it('emits token with an empty string when text is empty', () => {
    const parse = createStreamParser()
    expect(
      parse({ type: 'content_block_delta', delta: { type: 'text_delta', text: '' } })
    ).toEqual({ kind: 'token', text: '' })
  })

  it('returns noop for non-text delta types (input_json_delta)', () => {
    const parse = createStreamParser()
    expect(
      parse({ type: 'content_block_delta', delta: { type: 'input_json_delta', partial_json: '{"pr"' } })
    ).toEqual({ kind: 'noop' })
  })

  it('returns noop when delta is missing', () => {
    const parse = createStreamParser()
    expect(parse({ type: 'content_block_delta' })).toEqual({ kind: 'noop' })
  })

  // ── tool_end ─────────────────────────────────────────────────────────────

  it('emits tool_end with the correct id when a tool block closes', () => {
    const parse = createStreamParser()
    parse({
      type: 'content_block_start',
      content_block: { type: 'tool_use', id: 'tu_003', name: 'check_type_safety' },
    })
    expect(parse({ type: 'content_block_stop' })).toEqual({ kind: 'tool_end', id: 'tu_003' })
  })

  it('returns noop when a text block closes — no id to emit', () => {
    const parse = createStreamParser()
    parse({ type: 'content_block_start', content_block: { type: 'text' } })
    expect(parse({ type: 'content_block_stop' })).toEqual({ kind: 'noop' })
  })

  it('returns noop on a second stop with no open block', () => {
    const parse = createStreamParser()
    parse({
      type: 'content_block_start',
      content_block: { type: 'tool_use', id: 'tu_004', name: 'scan_runtime_risks' },
    })
    parse({ type: 'content_block_stop' })           // closes the block
    expect(parse({ type: 'content_block_stop' })).toEqual({ kind: 'noop' })  // no open block
  })

  // ── done ─────────────────────────────────────────────────────────────────

  it('emits done for message_stop', () => {
    expect(createStreamParser()({ type: 'message_stop' })).toEqual({ kind: 'done' })
  })

  // ── State isolation — critical for concurrent sessions ───────────────────

  it('two parser instances do not share state', () => {
    const parse1 = createStreamParser()
    const parse2 = createStreamParser()

    // Open a tool block in parse1 only
    parse1({
      type: 'content_block_start',
      content_block: { type: 'tool_use', id: 'tu_session_1', name: 'fetch_pr_diff' },
    })

    // parse2 has no open block — stop should return noop, not tu_session_1's id
    expect(parse2({ type: 'content_block_stop' })).toEqual({ kind: 'noop' })

    // parse1's block should still close correctly with its own id
    expect(parse1({ type: 'content_block_stop' })).toEqual({ kind: 'tool_end', id: 'tu_session_1' })
  })

  // ── Full sequence — all six tools ────────────────────────────────────────

  it('handles a complete six-tool sequence without error', () => {
    const parse = createStreamParser()
    const tools = [
      'fetch_pr_diff',
      'analyze_file_structure',
      'check_type_safety',
      'scan_runtime_risks',
      'assess_performance',
      'generate_summary',
    ] as const

    const events: string[] = []

    for (const tool of tools) {
      const start = parse({
        type: 'content_block_start',
        content_block: { type: 'tool_use', id: `id_${tool}`, name: tool },
      })
      events.push(start.kind)

      const end = parse({ type: 'content_block_stop' })
      events.push(end.kind)
    }

    // Should be: tool_start, tool_end, tool_start, tool_end ... × 6
    expect(events).toEqual(
      Array.from({ length: 6 }, () => ['tool_start', 'tool_end']).flat()
    )
  })
})
