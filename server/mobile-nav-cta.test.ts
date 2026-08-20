import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('mobile navigation external CTA', () => {
  it('places the Shopfine CTA last and opens it through the in-page matching-funnel action', () => {
    const nav = readFileSync(resolve(root, 'src/lib/nav.ts'), 'utf8')
    const mobileNav = readFileSync(resolve(root, 'src/components/MobileNav.tsx'), 'utf8')

    expect(nav).toContain("{ label: 'Find Your Perfect Ring', action: 'matching-funnel' }")
    expect(nav.indexOf("{ label: 'Our Mission', to: '/our-mission' }")).toBeLessThan(nav.indexOf("{ label: 'Find Your Perfect Ring', action: 'matching-funnel' }"))
    expect(mobileNav).toContain("item.action === 'matching-funnel' ? (")
    expect(mobileNav).toContain('openMatchingFunnel()')
  })
})
