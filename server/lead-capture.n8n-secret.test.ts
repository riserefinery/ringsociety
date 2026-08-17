import { describe, expect, it } from 'vitest'

describe('n8n lead workflow configuration', () => {
  it('reaches the configured production webhook without submitting a lead', async () => {
    const workflowUrl = process.env.N8N_LEAD_WEBHOOK_URL
    expect(workflowUrl).toMatch(/^https:\/\//)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const response = await fetch(workflowUrl!, {
        method: 'OPTIONS',
        signal: controller.signal,
      })

      // Any non-server response proves the private endpoint is reachable without creating a lead.
      expect(response.status).toBeLessThan(500)
    } finally {
      clearTimeout(timeout)
    }
  })
})
