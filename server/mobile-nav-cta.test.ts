import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('mobile navigation external CTA', () => {
  it('places the Shopfine CTA last and renders it as an external link', () => {
    const nav = readFileSync(resolve(root, 'src/lib/nav.ts'), 'utf8')
    const mobileNav = readFileSync(resolve(root, 'src/components/MobileNav.tsx'), 'utf8')

    expect(nav).toContain("{ label: 'Find Your Perfect Ring', href: 'https://app.ringsociety.com/' }")
    expect(nav.indexOf("{ label: 'Our Mission', to: '/our-mission' }")).toBeLessThan(nav.indexOf("{ label: 'Find Your Perfect Ring', href: 'https://app.ringsociety.com/' }"))
    expect(mobileNav).toContain('item.href ? (')
    expect(mobileNav).toContain('<a href={item.href} onClick={onNavigate} className="block w-full">')
  })
})
