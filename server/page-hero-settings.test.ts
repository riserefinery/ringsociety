import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('CMS page hero settings and contact layout', () => {
  it('exposes focal alignment controls for the requested page heroes in Sanity', () => {
    const responsiveImage = read('studio/schemas/common.ts')
    const documents = read('studio/schemas/documents.ts')
    const structure = read('studio/structure.ts')

    expect(responsiveImage).toContain("name: 'focalPoint'")
    expect(responsiveImage).toContain("value: 'center center'")
    expect(documents).toContain("name: 'topGuidesLanding'")
    expect(documents).toContain("name: 'missionPage'")
    expect(documents).toContain("title: 'Hero Image and Alignment'")
    expect(structure).toContain("singleton(S, 'topGuidesLanding', 'Top Guides')")
    expect(structure).toContain("singleton(S, 'missionPage', 'Our Mission')")
  })

  it('maps page hero focal alignment into the public hero components', () => {
    const helper = read('src/sanity/pageHero.ts')
    const pageHeader = read('src/components/PageHeader.tsx')
    const mission = read('src/pages/OurMission.tsx')
    const resources = read('src/pages/Resources.tsx')
    const topGuides = read('src/pages/TopGuides.tsx')

    expect(helper).toContain("hero?.focalPoint ?? 'center center'")
    expect(pageHeader).toContain('imagePosition = \'center center\'')
    expect(mission).toContain('imagePosition={hero.imagePosition}')
    expect(resources).toContain('matchResourcesHeight')
    expect(topGuides).toContain('matchResourcesHeight')
    expect(topGuides).toContain('md:pt-16')
  })

  it('centralizes Top Guides selection, order, copy, and feature backgrounds in Sanity posts', () => {
    const documents = read('studio/schemas/documents.ts')
    const queries = read('src/sanity/queries.ts')
    const mappers = read('src/sanity/mappers.ts')
    const topGuides = read('src/pages/TopGuides.tsx')

    expect(documents).toContain("name: 'bigFeatureImage'")
    expect(documents).toContain("name: 'topGuidesBadge'")
    expect(documents).toContain("name: 'topGuidesTextTone'")
    expect(documents).toContain("name: 'selectedPosts'")
    expect(documents).toContain("title: 'Top Guides Order'")
    expect(queries).toContain('getCmsTopGuidesPage')
    expect(queries).toContain('"selectedPosts": selectedPosts[]')
    expect(queries).toContain('bigFeatureImage')
    expect(mappers).toContain('toTopGuideRows')
    expect(mappers).toContain('post.bigFeatureImage?.focalPoint')
    expect(topGuides).toContain('selectedRows.length === pageSettings.selectedPosts.length')
  })

  it('centralizes the shared hello-bar text in Site Settings', () => {
    const documents = read('studio/schemas/documents.ts')
    const queries = read('src/sanity/queries.ts')
    const header = read('src/components/Header.tsx')

    expect(documents).toContain("name: 'helloBarText'")
    expect(documents).toContain("title: 'Hello Bar Text'")
    expect(queries).toContain('getCmsSiteSettings')
    expect(queries).toContain('{helloBarText}')
    expect(header).toContain('getCmsSiteSettings')
    expect(header).toContain('{helloBarText}')
  })

  it('does not require editors to maintain publishing dates on posts', () => {
    const documents = read('studio/schemas/documents.ts')
    const queries = read('src/sanity/queries.ts')

    expect(documents).not.toContain("name: 'publishedAt'")
    expect(documents).not.toContain("name: 'lastReviewed'")
    expect(documents).toContain("subtitle: 'contentType'")
    expect(queries).not.toContain('defined(publishedAt)')
    expect(queries).toContain('order(_updatedAt desc)')
  })

  it('keeps the Contact page within the approved Ring Society form and content system', () => {
    const contact = read('src/pages/Contact.tsx')
    const leadForm = read('src/components/LeadForm.tsx')

    expect(contact).toContain("title={pageSettings?.headline ?? \"We're Here to Help\"}")
    expect(contact).toContain('How can we help you?')
    expect(contact).toContain('General Inquiries')
    expect(contact).toContain('Response Time')
    expect(contact).toContain('source="Contact Page" variant="contact"')
    expect(leadForm).toContain('name="firstName"')
    expect(leadForm).toContain('name="lastName"')
    expect(leadForm).toContain('name="email"')
    expect(leadForm).toContain('name="topic"')
    expect(leadForm).toContain('name="message"')
    expect(leadForm).toContain('General question about engagement rings')
    expect(leadForm).toContain('Jeweler partnership inquiry')
    expect(leadForm).toContain('Press or media inquiry')
    expect(leadForm).toContain('Feedback or suggestion')
    expect(leadForm).toContain("'Other'")
  })
})
