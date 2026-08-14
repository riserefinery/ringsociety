import { describe, expect, it } from 'vitest'

const projectId = process.env.VITE_SANITY_PROJECT_ID ?? 'p1o8iwkt'
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'

describe('Sanity content migration credential', () => {
  it('authenticates against the configured Ring Society dataset', async () => {
    const token = process.env.SANITY_AUTH_TOKEN
    expect(token).toBeTruthy()

    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2026-08-13/data/query/${dataset}?query=${encodeURIComponent('*[_type == "system.group"][0]._id')}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    expect(response.ok).toBe(true)
  })
})
