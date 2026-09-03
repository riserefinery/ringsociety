import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('published legal pages', () => {
  it('registers all supplied legal documents on their public routes', () => {
    const routes = readFileSync(resolve(root, 'src/app/routes.tsx'), 'utf8')
    const expectedRoutes = [
      "'privacy-policy'",
      "'terms-and-conditions'",
      "'accessibility'",
      "'privacy-choices'",
      "'diamond-card-terms-and-eligibility'",
    ]

    expectedRoutes.forEach((route) => expect(routes).toContain(route))
    expect(routes).toContain('LegalPage')
  })

  it('includes each approved legal document in the source-controlled content library', () => {
    const documents = [
      ['privacy-policy.md', '# Privacy Policy'],
      ['terms-and-conditions.md', '# Terms and Conditions'],
      ['accessibility-statement.md', '# Accessibility Statement'],
      ['privacy-choices.md', '# Do Not Disclose My Personal Information'],
      ['diamond-card-terms-and-eligibility.md', '# Diamond Card Terms & Eligibility'],
    ] as const

    documents.forEach(([file, heading]) => {
      const content = readFileSync(resolve(root, 'src/content/legal', file), 'utf8')
      expect(content).toContain(heading)
    })
  })

  it('keeps the Diamond Card terms page out of search indexing and links the Terms promotion section to it', () => {
    const routes = readFileSync(resolve(root, 'src/app/routes.tsx'), 'utf8')
    const legalPage = readFileSync(resolve(root, 'src/pages/LegalPage.tsx'), 'utf8')
    const terms = readFileSync(resolve(root, 'src/content/legal/terms-and-conditions.md'), 'utf8')
    const diamondCard = readFileSync(resolve(root, 'src/content/legal/diamond-card-terms-and-eligibility.md'), 'utf8')
    const vercelConfig = readFileSync(resolve(root, 'vercel.json'), 'utf8')

    expect(routes).toContain('<LegalPage title="Diamond Card Terms & Eligibility" document={diamondCardTermsAndEligibility} noIndex />')
    expect(legalPage).toContain("robots.setAttribute('content', 'noindex, follow')")
    expect(vercelConfig).toContain('"src": "/diamond-card-terms-and-eligibility"')
    expect(vercelConfig).toContain('"X-Robots-Tag": "noindex, follow"')
    expect(terms).toContain('[Diamond Card Terms & Eligibility](/diamond-card-terms-and-eligibility)')
    expect(diamondCard).toContain('[Terms & Conditions](/terms-and-conditions)')
    expect(diamondCard).toContain('[Privacy Policy](/privacy-policy)')
  })

  it('uses the shorter privacy-choice label and makes mobile legal links route-aware', () => {
    const nav = readFileSync(resolve(root, 'src/lib/nav.ts'), 'utf8')
    const mobileNav = readFileSync(resolve(root, 'src/components/MobileNav.tsx'), 'utf8')
    const footer = readFileSync(resolve(root, 'src/components/Footer.tsx'), 'utf8')
    const routes = readFileSync(resolve(root, 'src/app/routes.tsx'), 'utf8')

    expect(nav).toContain("{ label: 'Your Privacy Choices', to: '/privacy-choices' }")
    expect(nav).not.toContain('Do Not Sell My Personal Information')
    expect(mobileNav).toContain("<Link to={l.to ?? '/'} prefetch=\"intent\" onClick={onNavigate}")
    expect(mobileNav).not.toContain('viewTransition')
    expect(footer).toContain('<Link key={label} to={i.to} prefetch="intent" viewTransition className={cls}>')

    const destinations = ['/privacy-policy', '/terms-and-conditions', '/accessibility', '/privacy-choices']
    destinations.forEach((destination) => {
      expect(nav).toContain(`to: '${destination}'`)
      expect(routes).toContain(`path: '${destination.slice(1)}'`)
    })
    expect(routes).toContain('path: \'do-not-sell\', element: <Navigate replace to="/privacy-choices" />')
  })
})
