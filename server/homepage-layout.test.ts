import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('homepage full-bleed layout', () => {
  it('opts only the homepage hero into a full-bleed desktop surface', () => {
    const home = readFileSync(resolve(root, 'src/pages/Home.tsx'), 'utf8')
    const hero = readFileSync(resolve(root, 'src/components/Hero.tsx'), 'utf8')

    expect(home).toContain('fullBleedDesktop')
    expect(hero).toContain('fullBleedDesktop?: boolean')
    expect(hero).toContain("fullBleedDesktop ? 'hidden w-full md:block'")
    expect(hero).toContain("paddingLeft: 'max(136px, calc((100vw - 1440px) / 2 + 136px))'")
  })

  it('makes the shared CTA full-bleed only at desktop and removes the desktop footer gap', () => {
    const home = readFileSync(resolve(root, 'src/pages/Home.tsx'), 'utf8')
    const newsletter = readFileSync(resolve(root, 'src/components/Newsletter.tsx'), 'utf8')

    expect(newsletter).toContain('md:max-w-none md:px-0')
    expect(newsletter).toContain('rounded-lg md:rounded-none')
    expect(home).toContain('md:pb-0 md:pt-24')
    expect(home).toContain('pb-16 pt-16')
  })
})
