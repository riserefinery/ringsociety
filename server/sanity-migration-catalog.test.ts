import { describe, expect, it } from 'vitest'

const projectId = process.env.VITE_SANITY_PROJECT_ID ?? 'p1o8iwkt'
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'

type MigrationCatalog = {
  guideCount: number
  legalCount: number
  jewelerHeroAsset?: string
}

describe('Sanity migrated content catalog', () => {
  it('retains editable guide and legal-page drafts with the supplied Jeweler Framework asset', async () => {
    const token = process.env.SANITY_AUTH_TOKEN
    expect(token).toBeTruthy()

    const query = `{
      "guideCount": count(*[_type == "post" && _id match "drafts.**"]),
      "legalCount": count(*[_type == "legalPage" && _id match "drafts.**"]),
      "jewelerHeroAsset": *[_id == "drafts.post-how-to-choose-a-jeweler"][0].heroImage.mainImage.asset._ref
    }`
    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2026-08-13/data/query/${dataset}?perspective=raw&query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    expect(response.ok).toBe(true)
    const payload = (await response.json()) as { result: MigrationCatalog }

    expect(payload.result.guideCount).toBe(15)
    expect(payload.result.legalCount).toBe(4)
    expect(payload.result.jewelerHeroAsset).toBe('image-b326d3006e0d637442eb00c087fbc53130793ac8-1340x895-jpg')
  })
})
