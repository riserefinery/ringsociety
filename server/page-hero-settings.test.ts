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

  it('keeps the Contact page within the approved Ring Society form and content system', () => {
    const contact = read('src/pages/Contact.tsx')
    const leadForm = read('src/components/LeadForm.tsx')

    expect(contact).toContain("title={pageSettings?.headline ?? \"We're Here to Help\"}")
    expect(contact).toContain('How can we help you?')
    expect(contact).toContain('General Inquiries')
    expect(contact).toContain('Response Time')
    expect(contact).toContain('source="Contact Page"')
    expect(leadForm).toContain('name="firstName"')
    expect(leadForm).toContain('name="lastName"')
    expect(leadForm).toContain('name="email"')
  })
})
