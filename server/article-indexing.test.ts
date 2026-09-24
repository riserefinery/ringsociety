import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('article indexing safeguards', () => {
  it('keeps the preview hostname no-indexed while reserving an authoritative guide lock for production rollout', () => {
    const siteConfig = read('.figma/make/site.json')
    const vercel = read('vercel.json')
    const rollout = read('docs/article-indexing-rollout.md')

    expect(siteConfig).toContain('"index": false')
    expect(vercel).toContain('"src": "/guides/(.*)"')
    expect(vercel).toContain('"X-Robots-Tag": "noindex, follow"')
    expect(rollout).toContain('Do not submit an XML sitemap at this stage.')
  })

  it('exposes a per-guide CMS control that defaults new guides to no-index', () => {
    const seoSchema = read('studio/schemas/common.ts')
    const postSchema = read('studio/schemas/documents.ts')
    const queries = read('src/sanity/queries.ts')
    const mapper = read('src/sanity/mappers.ts')
    const article = read('src/pages/Article.tsx')

    expect(seoSchema).toContain("name: 'noIndex'")
    expect(postSchema).toContain('initialValue: { noIndex: true }')
    expect(queries).toContain('"seo": seo{noIndex}')
    expect(mapper).toContain('noIndex: post.seo?.noIndex === true')
    expect(article).toContain("robots.setAttribute('content', 'noindex, follow')")
  })
})
