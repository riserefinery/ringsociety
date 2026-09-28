import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import leadCapture, { resetLeadRateLimits } from '../api/lead-capture.mjs'

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

  beforeEach(() => {
    resetLeadRateLimits()
  })

  it('uses the explicit lead-magnet source in the above-footer form and contact source on the Contact page', () => {
    const newsletter = readFileSync(resolve(import.meta.dirname, '../src/components/Newsletter.tsx'), 'utf8')
    const contact = readFileSync(resolve(import.meta.dirname, '../src/pages/Contact.tsx'), 'utf8')
    expect(newsletter).toContain('source="lead-magnet"')
    expect(contact).toContain('source="contact"')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetLeadRateLimits()
    process.env.N8N_LEAD_WEBHOOK_URL = originalWebhook
  })

  it('forwards the lead-magnet payload only to the private n8n endpoint', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.test/webhook/lead'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }))
    const response = createResponse()

    await leadCapture({
      method: 'POST',
      headers: { origin: 'https://ringsociety.com', 'x-forwarded-for': '203.0.113.10' },
      body: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', source: 'lead-magnet', formStartedAt: Date.now() - 2_000 },
    }, response)

    expect(response.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith('https://n8n.example.test/webhook/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', source: 'lead-magnet' }),
    })
  })

  it('rejects requests that do not come from a Ring Society page before they reach n8n', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.test/webhook/lead'
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const response = createResponse()

    await leadCapture({
      method: 'POST',
      headers: { origin: 'https://spam.example', 'x-forwarded-for': '203.0.113.10' },
      body: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', source: 'contact', topic: 'Other', formStartedAt: Date.now() - 2_000 },
    }, response)

    expect(response.statusCode).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects bot-speed submissions, filled traps, and bursts before they reach n8n', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.test/webhook/lead'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }))
    const request = {
      method: 'POST',
      headers: { origin: 'https://ringsociety.com', 'x-forwarded-for': '203.0.113.10' },
      body: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', source: 'contact', topic: 'Other', formStartedAt: Date.now() - 2_000 },
    }

    await leadCapture({ ...request, body: { ...request.body, formStartedAt: Date.now() } }, createResponse())
    await leadCapture({ ...request, body: { ...request.body, website: 'https://spam.example' } }, createResponse())
    expect(fetchMock).not.toHaveBeenCalled()

    await leadCapture(request, createResponse())
    await leadCapture(request, createResponse())
    await leadCapture(request, createResponse())
    const limitedResponse = createResponse()
    await leadCapture(request, limitedResponse)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(limitedResponse.statusCode).toBe(429)
  })
})
