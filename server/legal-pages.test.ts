import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('published legal pages', () => {
  it('registers all four supplied legal documents on their public routes', () => {
    const routes = readFileSync(resolve(root, 'src/app/routes.tsx'), 'utf8')
    const expectedRoutes = [
      "'privacy-policy'",
      "'terms-and-conditions'",
      "'accessibility'",
      "'do-not-sell'",
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
    ] as const

    documents.forEach(([file, heading]) => {
      const content = readFileSync(resolve(root, 'src/content/legal', file), 'utf8')
      expect(content).toContain(heading)
    })
  })

  it('uses the shorter privacy-choice label and makes mobile legal links route-aware', () => {
    const nav = readFileSync(resolve(root, 'src/lib/nav.ts'), 'utf8')
    const mobileNav = readFileSync(resolve(root, 'src/components/MobileNav.tsx'), 'utf8')
    const footer = readFileSync(resolve(root, 'src/components/Footer.tsx'), 'utf8')
    const routes = readFileSync(resolve(root, 'src/app/routes.tsx'), 'utf8')

    expect(nav).toContain("{ label: 'Your Privacy Choices', to: '/do-not-sell' }")
    expect(nav).not.toContain('Do Not Sell My Personal Information')
    expect(mobileNav).toContain("<Link to={l.to ?? '/'} prefetch=\"intent\" onClick={onNavigate}")
    expect(mobileNav).not.toContain('viewTransition')
    expect(footer).toContain('<Link key={label} to={i.to} prefetch="intent" viewTransition className={cls}>')

    const destinations = ['/privacy-policy', '/terms-and-conditions', '/accessibility', '/do-not-sell']
    destinations.forEach((destination) => {
      expect(nav).toContain(`to: '${destination}'`)
      expect(routes).toContain(`path: '${destination.slice(1)}'`)
    })
  })
})
