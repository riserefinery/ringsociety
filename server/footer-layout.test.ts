import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('footer responsive layout', () => {
  it('uses a deliberate four-column small-laptop grid without changing the mobile stack', () => {
    const footer = readFileSync(resolve(root, 'src/components/Footer.tsx'), 'utf8')

    expect(footer).toContain('grid grid-cols-1 gap-16 md:grid-cols-2')
    expect(footer).toContain('lg:grid-cols-[1.25fr_1.1fr_.7fr_.9fr]')
    expect(footer).toContain('md:gap-x-10 md:gap-y-14')
    expect(footer).toContain("col('Most-Loved Guides', guides, 'w-full min-w-0')")
    expect(footer).toContain("col('More', [{ label: 'Our Mission', to: '/our-mission' }, { label: 'Contact Us', to: '/contact' }], 'w-full min-w-0')")
    expect(footer).toContain('Ready to Find Your Ring?')
    expect(footer).toContain('Get the Perfect Match')
    expect(footer).toContain('onClick={openMatchingFunnel}')
  })
})
