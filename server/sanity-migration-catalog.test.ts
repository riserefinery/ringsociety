import { describe, expect, it } from 'vitest'

const projectId = process.env.VITE_SANITY_PROJECT_ID ?? 'p1o8iwkt'
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'

type MigrationCatalog = {
  guideCount: number
  legalCount: number
  jewelerHeroAsset?: string
  jewelerBigFeatureAsset?: string
  topGuideSelectionCount: number
  helloBarText?: string
}

describe('Sanity migrated content catalog', () => {
  it('retains the complete migrated guide and legal-page catalog as editors publish individual records', async () => {
    const token = process.env.SANITY_AUTH_TOKEN
    expect(token).toBeTruthy()

    const query = `{
      "guideCount": count(*[_type == "post" && (_id match "drafts.post-**" || _id match "post-**")]),
      "legalCount": count(*[_type == "legalPage" && _id match "drafts.**"]),
      "jewelerHeroAsset": coalesce(*[_id == "drafts.post-how-to-choose-a-jeweler"][0].heroImage.mainImage.asset._ref, *[_id == "post-how-to-choose-a-jeweler"][0].heroImage.mainImage.asset._ref),
      "jewelerBigFeatureAsset": coalesce(*[_id == "drafts.post-how-to-choose-a-jeweler"][0].bigFeatureImage.mainImage.asset._ref, *[_id == "post-how-to-choose-a-jeweler"][0].bigFeatureImage.mainImage.asset._ref),
      "topGuideSelectionCount": count(coalesce(*[_id == "drafts.topGuidesLanding"][0].selectedPosts, *[_id == "topGuidesLanding"][0].selectedPosts)),
      "helloBarText": coalesce(*[_id == "drafts.siteSettings"][0].helloBarText, *[_id == "siteSettings"][0].helloBarText)
    }`
    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2026-08-13/data/query/${dataset}?perspective=raw&query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    expect(response.ok).toBe(true)
    const payload = (await response.json()) as { result: MigrationCatalog }

    expect(payload.result.guideCount).toBeGreaterThanOrEqual(15)
    expect(payload.result.legalCount).toBe(4)
    expect(payload.result.jewelerHeroAsset).toBe('image-b326d3006e0d637442eb00c087fbc53130793ac8-1340x895-jpg')
    expect(payload.result.jewelerBigFeatureAsset).toMatch(/^image-/)
    expect(payload.result.topGuideSelectionCount).toBe(8)
    expect(payload.result.helloBarText).toBe('Your trusted guide to the perfect Engagement ring')
  })
})
