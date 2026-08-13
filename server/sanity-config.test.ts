import { describe, expect, it } from 'vitest'

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET

describe('Sanity public configuration', () => {
  it('reaches the configured published-content endpoint', async () => {
    expect(projectId).toBe('p1o8iwkt')
    expect(dataset).toBe('production')

    const query = encodeURIComponent('*[_type == "__ring_society_configuration_probe__"][0]._id')
    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}?query=${query}`,
    )

    expect(response.ok).toBe(true)
    await expect(response.json()).resolves.toHaveProperty('result')
  })
})
