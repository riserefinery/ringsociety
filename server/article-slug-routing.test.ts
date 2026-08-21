import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { articleSlugForTitle, pillarGuides } from '../src/lib/content'

describe('requested article canonical URLs', () => {
  it('uses the new slugs for local fallback cards and pillar guides', () => {
    expect(articleSlugForTitle('Go Big or Shop Small? Big-Box vs. Local vs. Online')).toBe('big-box-vs-local-vs-online-jewelers')
    expect(articleSlugForTitle('The Most Popular & Trending Ring Styles and Diamonds in 2026')).toBe('engagement-ring-trends-2026')
    expect(pillarGuides.find((guide) => guide.title.startsWith('Go Big or Shop Small'))?.slug).toBe('big-box-vs-local-vs-online-jewelers')
  })

  it('redirects the prior guide paths to their requested canonical URLs', () => {
    const routes = readFileSync(resolve(import.meta.dirname, '../src/app/routes.tsx'), 'utf8')
    expect(routes).toContain('guides/go-big-or-shop-small')
    expect(routes).toContain('/guides/big-box-vs-local-vs-online-jewelers')
    expect(routes).toContain('guides/most-popular-trending-ring-styles-2026')
    expect(routes).toContain('/guides/engagement-ring-trends-2026')
  })
})
