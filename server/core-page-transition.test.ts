import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('core-page navigation transitions', () => {
  it('keeps a named transition surface for core pages while leaving article image transitions independent', () => {
    const appRoot = read('src/app/Root.tsx')
    const styles = read('src/index.css')

    expect(appRoot).toContain("viewTransitionName: 'core-page-shell'")
    expect(appRoot).toContain("pathname.startsWith('/guides/')")
    expect(styles).toContain('::view-transition-old(core-page-shell)')
    expect(styles).toContain('::view-transition-new(core-page-shell)')
    expect(styles).toContain('prefers-reduced-motion: reduce')
  })

  it('prefetches and transitions primary internal links', () => {
    const header = read('src/components/Header.tsx')
    const mobileNav = read('src/components/MobileNav.tsx')
    const footer = read('src/components/Footer.tsx')
    const hero = read('src/components/Hero.tsx')

    for (const source of [header, footer, hero]) {
      expect(source).toContain('prefetch="intent"')
      expect(source).toContain('viewTransition')
    }

    expect(mobileNav).toContain('prefetch="intent"')
    expect(mobileNav).toContain('onClick={onNavigate}')
    expect(mobileNav).not.toContain('viewTransition')
    expect(header).toContain('closeMenuForNavigation')
    expect(mobileNav).toContain("from 'motion/react'")
    expect(mobileNav).toContain("animate={{ x: open ? '0%' : '-100%' }}")
    expect(mobileNav).not.toContain('opacity: open ? 1 : 0')
    expect(mobileNav).toContain('duration: 0.28')
    expect(mobileNav).toContain('duration: 0.22')
  })
})
