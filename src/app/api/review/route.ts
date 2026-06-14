import { anthropic, PR_REVIEW_TOOLS, PR_REVIEW_PROMPT } from '@/lib/anthropic'

export const runtime = 'nodejs'

export async function POST() {
  if (process.env.DEMO_MODE !== 'false') {
    return new Response(JSON.stringify({ error: 'Live mode disabled' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = anthropic.messages.stream({
    model:      'claude-sonnet-4-6',
    max_tokens: 4096,
    tools:      PR_REVIEW_TOOLS,
    messages:   [{ role: 'user', content: PR_REVIEW_PROMPT }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
