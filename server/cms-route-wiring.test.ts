import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('CMS route wiring', () => {
  it('keeps every resource route available while content is published incrementally', () => {
    const content = read('src/lib/content.ts')
    const resources = read('src/pages/Resources.tsx')
    const home = read('src/pages/Home.tsx')

    expect(content).toContain('articleSlugForTitle')
    expect(content).toContain('mergePublishedArticleCards')
    expect(content).toContain('temporaryArticleFor')
    expect(content).toContain('Replace this placeholder body in Sanity')
    expect(resources).toContain('mergePublishedArticleCards(cmsArticles)')
    expect(home).toContain('articlePathForTitle')
    expect(home).toContain('GuideCard card={{ ...c, to: articlePathForTitle(c.title) }}')
  })

  it('connects both Top Guides actions to the corresponding article route', () => {
    const feature = read('src/components/GuideFeature.tsx')
    const topGuides = read('src/pages/TopGuides.tsx')
    const editorialRow = read('src/components/EditorialRow.tsx')

    expect(feature).toContain('to={`/guides/${slug}`}')
    expect(feature).toContain('<Link\n                to={`/guides/${slug}`}')
    expect(feature).toContain('src={guideFeature ?? feature}')
    expect(feature).toContain('aria-label={`Read ${title}`}')
    expect(feature).toContain('inline-flex h-[41px] w-fit')
    expect(topGuides).toContain('const [cmsResolved, setCmsResolved] = useState(false)')
    expect(topGuides).toContain('const guides = cmsResolved ? mergeTopGuideRows')
    expect(topGuides).toContain('aria-busy={!cmsResolved}')
    expect(topGuides).toContain('{cmsResolved && (')
    expect(editorialRow).toContain('to?: string')
    expect(editorialRow).toContain('Read ${typeof title === \'string\' ? title : eyebrow}')
    expect(editorialRow).toContain("mobileCtaFullWidth ? 'w-full md:w-fit' : 'w-fit'")
    expect(read('src/pages/Home.tsx')).toContain('mobileCtaFullWidth')
  })
})
