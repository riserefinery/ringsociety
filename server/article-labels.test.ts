import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('CMS-managed article labels', () => {
  it('keeps a controlled Article Labels registry and exposes it in the Studio', () => {
    const schema = read('studio/schemas/documents.ts')
    const schemaIndex = read('studio/schemas/index.ts')
    const structure = read('studio/structure.ts')

    expect(schema).toContain("name: 'articleLabel'")
    expect(schema).toContain("name: 'articleLabel', title: 'Article Label'")
    expect(schema).toContain("to: [{ type: 'articleLabel' }]")
    expect(schemaIndex).toContain('articleLabel')
    expect(structure).toContain("S.documentTypeListItem('articleLabel').title('Article Labels')")
  })

  it('projects the selected label and maps it consistently into cards, Top Guides, and article pages', () => {
    const queries = read('src/sanity/queries.ts')
    const mappers = read('src/sanity/mappers.ts')

    expect(queries).toContain('"articleLabel": articleLabel->{_id, name}')
    expect(mappers).toContain('badge: post.articleLabel?.name')
    expect(mappers).toContain("post.articleLabel?.name ?? (post.isMostLoved ? 'most loved' : undefined)")
    expect(mappers).toContain('if (post.articleLabel?.name) return post.articleLabel.name')
  })

  it('uses a shared label primitive at the top-right of all mobile card image surfaces', () => {
    const guideCard = read('src/components/GuideCard.tsx')
    const guideFeature = read('src/components/GuideFeature.tsx')
    const editorialRow = read('src/components/EditorialRow.tsx')
    const article = read('src/pages/Article.tsx')

    expect(guideCard).toContain('absolute right-4 top-4 md:bottom-4 md:left-4 md:right-auto md:top-auto')
    expect(guideFeature).toContain('absolute right-4 top-4')
    expect(editorialRow).toContain('absolute right-6 top-5 md:bottom-4 md:left-6 md:right-auto md:top-auto')
    expect(article).toContain('absolute bottom-4 left-6')
    for (const source of [guideCard, guideFeature, editorialRow, article]) {
      expect(source).toContain('ArticleLabel')
    }
  })
})

describe('landing-page hero load-in', () => {
  it('uses a gated fade-and-zoom image reveal and the shared stagger/fade-up motion system', () => {
    const pageHeader = read('src/components/PageHeader.tsx')

    expect(pageHeader).toContain("from 'motion/react'")
    expect(pageHeader).toContain('fadeUp, staggerContainer')
    expect(pageHeader).toContain("animate={imageReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}")
    expect(pageHeader).toContain('variants={delayedTextStagger}')
    expect(pageHeader).toContain('variants={fadeUp}')
    expect(pageHeader).toContain('const [loadedImage, setLoadedImage]')
    expect(pageHeader).toContain('const imageReady = loadedImage === image')
    expect(pageHeader).toContain('<motion.img')
    expect(pageHeader).toContain('initial={{ opacity: 0, scale: 1.06 }}')
    expect(pageHeader).toContain('duration: 0.56')
    expect(pageHeader).toContain('delayChildren: 0.3')
  })

  it('sets the Our Mission pre-image loading surface to black', () => {
    const mission = read('src/pages/OurMission.tsx')
    expect(mission).toContain('imageBackground="#000000"')
  })
})
