import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('Top Guides loading resilience', () => {
  it('renders established fallback guide rows immediately while the CMS selection resolves', () => {
    const topGuides = read('src/pages/TopGuides.tsx')

    expect(topGuides).toContain('const guides = mergeTopGuideRows(pageSettings?.selectedPosts, pillarGuides)')
    expect(topGuides).not.toContain("const guides = cmsResolved ? mergeTopGuideRows(pageSettings?.selectedPosts, pillarGuides) : []")
    expect(topGuides).not.toContain('h-[420px] w-full md:h-[560px]')
    expect(topGuides).toContain('<Newsletter />')
  })

  it('keeps the Top Guides CMS request focused on card-required fields and shares an in-flight request', () => {
    const queries = read('src/sanity/queries.ts')

    expect(queries).toContain('let topGuidesRequestCache')
    expect(queries).toContain('if (topGuidesRequestCache) return topGuidesRequestCache')
    expect(queries).toContain('bigFeatureImage')
    expect(queries).not.toContain('"post": @->${postProjection}')
  })
})
