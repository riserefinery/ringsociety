import { describe, expect, it } from 'vitest'
import { parseLead } from '../api/lead-capture.mjs'

describe('GoHighLevel lead payload validation', () => {
  it('normalizes the approved three-field lead payload', () => {
    expect(parseLead({ firstName: ' Ada ', lastName: ' Lovelace ', email: 'ADA@EXAMPLE.COM', source: 'Footer CTA' })).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      source: 'Footer CTA',
    })
  })

  it('rejects incomplete or invalid lead payloads', () => {
    expect(parseLead({ firstName: 'Ada', lastName: '', email: 'ada@example.com' })).toBeNull()
    expect(parseLead({ firstName: 'Ada', lastName: 'Lovelace', email: 'not-an-email' })).toBeNull()
  })

  it('silently blocks honeypot submissions', () => {
    expect(parseLead({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', website: 'bot.example' })).toEqual({ blocked: true })
  })
})
