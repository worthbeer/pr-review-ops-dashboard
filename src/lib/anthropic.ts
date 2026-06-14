import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const PR_REVIEW_TOOLS: Anthropic.Tool[] = [
  {
    name: 'fetch_pr_diff',
    description: 'Fetch the full diff for the pull request including all changed files',
    input_schema: {
      type: 'object',
      properties: {
        pr_number: { type: 'number', description: 'The PR number to fetch' },
        repo:      { type: 'string', description: 'Repository in org/name format' },
      },
      required: ['pr_number', 'repo'],
    },
  },
  {
    name: 'analyze_file_structure',
    description: 'Analyze the file structure and component architecture of changed files',
    input_schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of changed file paths',
        },
      },
      required: ['files'],
    },
  },
  {
    name: 'check_type_safety',
    description: 'Check TypeScript type safety, detect implicit any and unsafe casts',
    input_schema: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'File to check for type safety issues' },
      },
      required: ['file'],
    },
  },
  {
    name: 'scan_runtime_risks',
    description: 'Scan for runtime risks: memory leaks, missing cleanup, unhandled rejections',
    input_schema: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'File to scan for runtime risks' },
      },
      required: ['file'],
    },
  },
  {
    name: 'assess_performance',
    description: 'Assess rendering performance, virtualization, and bundle impact',
    input_schema: {
      type: 'object',
      properties: {
        component: { type: 'string', description: 'Component name to assess' },
      },
      required: ['component'],
    },
  },
  {
    name: 'generate_summary',
    description: 'Generate a structured code review summary with severity breakdown and verdict',
    input_schema: {
      type: 'object',
      properties: {
        findings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity:    { type: 'string', enum: ['critical', 'warning', 'info'] },
              description: { type: 'string' },
            },
            required: ['severity', 'description'],
          },
          description: 'Findings from the review',
        },
      },
      required: ['findings'],
    },
  },
]

export const PR_REVIEW_PROMPT = `You are a senior engineer performing a code review for a pull request in a compliance-critical banking application.

Repository: acme-bank/ledger-ui
PR #247: "feat: add real-time transaction stream to compliance dashboard"
Author: @dev-team
Files changed (4):
  - TransactionStream.tsx
  - useWebSocket.ts
  - api/transactions/route.ts
  - types/index.ts

Use your tools in this order to perform a thorough review:
1. fetch_pr_diff — get the full diff (pr_number: 247, repo: "acme-bank/ledger-ui")
2. analyze_file_structure — examine the 4 changed files
3. check_type_safety — audit useWebSocket.ts for type safety
4. scan_runtime_risks — check useWebSocket.ts for memory leaks and cleanup
5. assess_performance — evaluate TransactionStream component
6. generate_summary — produce structured findings

After completing all tool calls, write a detailed review covering:
- Memory management and cleanup (useEffect cleanup, WebSocket lifecycle)
- Type safety (untyped WebSocket messages, any types)
- Error handling and boundaries (ErrorBoundary coverage, reconnection)
- Performance (list virtualization, scroll handling)
- Final verdict: approve or request changes

Be specific — reference exact file names and line numbers. Maintain compliance-focused perspective.`
