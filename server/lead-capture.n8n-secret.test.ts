import { describe, expect, it } from 'vitest'

describe('n8n lead workflow configuration', () => {
  it('uses a secure configured production webhook URL', () => {
    const workflowUrl = process.env.N8N_LEAD_WEBHOOK_URL
    expect(workflowUrl).toMatch(/^https:\/\//)
    expect(new URL(workflowUrl!).protocol).toBe('https:')
  })
})
