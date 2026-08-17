import { afterEach, describe, expect, it, vi } from 'vitest'
import leadCapture from '../api/lead-capture.mjs'

type ResponseCapture = {
  statusCode: number
  body: unknown
  status: (code: number) => ResponseCapture
  json: (body: unknown) => ResponseCapture
}

function createResponse(): ResponseCapture {
  return {
    statusCode: 0,
    body: undefined,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: unknown) {
      this.body = body
      return this
    },
  }
}

describe('n8n lead delivery', () => {
  const originalWebhook = process.env.N8N_LEAD_WEBHOOK_URL

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.N8N_LEAD_WEBHOOK_URL = originalWebhook
  })

  it('forwards the approved footer payload only to the private n8n endpoint', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.test/webhook/lead'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }))
    const response = createResponse()

    await leadCapture({
      method: 'POST',
      body: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', source: 'Footer CTA' },
    }, response)

    expect(response.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith('https://n8n.example.test/webhook/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', source: 'Footer CTA' }),
    })
  })
})
