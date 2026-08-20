import { describe, expect, it } from 'vitest'
import { parseLead } from '../api/lead-capture.mjs'

describe('GoHighLevel lead payload validation', () => {
  it('normalizes the approved three-field lead payload', () => {
    expect(parseLead({ firstName: ' Ada ', lastName: ' Lovelace ', email: 'ADA@EXAMPLE.COM', source: 'footer' })).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      source: 'footer',
    })
  })

  it('rejects incomplete or invalid lead payloads', () => {
    expect(parseLead({ firstName: 'Ada', lastName: '', email: 'ada@example.com' })).toBeNull()
    expect(parseLead({ firstName: 'Ada', lastName: 'Lovelace', email: 'not-an-email' })).toBeNull()
  })

  it('marks honeypot submissions for explicit rejection instead of false success', () => {
    expect(parseLead({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', website: 'bot.example' })).toEqual({ blocked: true })
  })

  it('includes the Contact-only topic and message while keeping the footer payload compact', () => {
    expect(parseLead({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      source: 'contact',
      topic: ' General question about engagement rings ',
      message: ' Can you help us compare settings? ',
    })).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      source: 'contact',
      topic: 'General question about engagement rings',
      message: 'Can you help us compare settings?',
    })
  })
})
