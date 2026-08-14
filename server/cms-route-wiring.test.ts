import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('CMS route wiring', () => {
  it('keeps every resource route available while content is published incrementally', () => {
    const content = read('src/lib/content.ts')
    const resources = read('src/pages/Resources.tsx')

    expect(content).toContain('articleSlugForTitle')
    expect(content).toContain('mergePublishedArticleCards')
    expect(content).toContain('temporaryArticleFor')
    expect(content).toContain('Replace this placeholder body in Sanity')
    expect(resources).toContain('mergePublishedArticleCards(cmsArticles)')
  })

  it('connects both Top Guides actions to the corresponding article route', () => {
    const feature = read('src/components/GuideFeature.tsx')

    expect(feature).toContain('to={`/guides/${slug}`}')
    expect(feature).toContain('<Link to={`/guides/${slug}`}>')
  })
})
