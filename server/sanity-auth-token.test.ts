import { describe, expect, it } from 'vitest'

describe('Sanity deployment authentication', () => {
  it('authenticates a lightweight read query against the Ring Society production dataset', async () => {
    const token = process.env.SANITY_AUTH_TOKEN
    expect(token).toBeTruthy()

    const response = await fetch(
      'https://p1o8iwkt.api.sanity.io/v2023-05-03/data/query/production?query=*%5B0%5D._id',
      { headers: { Authorization: `Bearer ${token}` } },
    )

    expect(response.ok).toBe(true)
  })
})
