import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APPROVED_ARTICLE_PATH, APPROVED_ARTICLE_SLUG, articleMetadata, isArticleIndexable } from '../src/lib/articleSeo'
import type { ArticleDoc } from '../src/lib/content'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')
const doc = { slug: APPROVED_ARTICLE_SLUG, title: 'Guide', subtitle: 'Description', hero: 'https://cdn.sanity.io/image.jpg', noIndex: false } as ArticleDoc

describe('single approved article indexing', () => {
  it('requires the exact approved slug, explicit approval, and canonical host', () => {
    expect(isArticleIndexable(doc)).toBe(true)
    expect(isArticleIndexable({ ...doc, slug: 'another-guide' })).toBe(false)
    expect(isArticleIndexable({ ...doc, noIndex: true })).toBe(false)
    expect(isArticleIndexable({ ...doc, noIndex: undefined })).toBe(false)
    expect(isArticleIndexable(doc, 'ringsociety-web.vercel.app')).toBe(false)
    expect(isArticleIndexable(doc, 'www.ringsociety.com')).toBe(false)
    expect(articleMetadata(doc).canonical).toBe(`https://ringsociety.com${APPROVED_ARTICLE_PATH}`)
  })

  it('terminates the canonical article route before the guide lock and crawler rewrite', () => {
    const config = JSON.parse(read('vercel.json'))
    const routes = config.routes
    const approvedIndex = routes.findIndex((route: any) => route.src === `${APPROVED_ARTICLE_PATH}$`)
    const lockIndex = routes.findIndex((route: any) => route.src === '/guides/(.*)')
    const socialIndex = routes.findIndex((route: any) => route.dest === '/api/guide-share?slug=$1')
    expect(approvedIndex).toBeGreaterThanOrEqual(0)
    expect(approvedIndex).toBeLessThan(lockIndex)
    expect(approvedIndex).toBeLessThan(socialIndex)
    expect(routes[approvedIndex].has).toEqual([{ type: 'host', value: 'ringsociety.com' }])
    expect(routes[approvedIndex].continue).not.toBe(true)
    expect(routes[approvedIndex].headers['X-Robots-Tag']).toBe('index, follow')
    expect(routes[approvedIndex].dest).toBe('/approved-articles/how-to-buy-an-engagement-ring.html')
    expect(routes[lockIndex].headers['X-Robots-Tag']).toBe('noindex, follow')
    const aliasGuard = routes.find((route: any) => route.src === '/approved-articles/(.*)')
    expect(aliasGuard.headers['X-Robots-Tag']).toBe('noindex, follow')
    const trailingSlash = routes.find((route: any) => route.status === 308)
    expect(trailingSlash.headers.Location).toBe(`https://ringsociety.com${APPROVED_ARTICLE_PATH}`)
  })

  it('keeps the global site and preview robots blocked, with one canonical robots variant', () => {
    const config = JSON.parse(read('vercel.json'))
    const robots = config.routes.find((route: any) => route.dest === '/robots-production.txt')
    expect(robots.has).toEqual([{ type: 'host', value: 'ringsociety.com' }])
    expect(JSON.parse(read('.figma/make/site.json')).robots.index).toBe(false)
    expect(read('vite.config.ts')).toContain('Allow: ${APPROVED_ARTICLE_PATH}$')
    expect(read('vite.config.ts')).not.toContain('Allow: /guides/\\n')
    expect(read('docs/article-indexing-rollout.md')).toContain('Do not submit an XML sitemap at this stage.')
  })

  it('keeps CMS controls fail-closed and resets site protection when leaving the guide', () => {
    expect(read('studio/schemas/documents.ts')).toContain('initialValue: { noIndex: true }')
    expect(read('src/sanity/mappers.ts')).toContain('noIndex: post.seo?.noIndex !== false')
    expect(read('src/pages/Article.tsx')).toContain("metadata.noIndex ? 'noindex, follow' : 'index, follow'")
    expect(read('src/pages/Article.tsx')).toContain("upsert('meta[name=\"robots\"]', 'name', SITE_ROBOTS_BASELINE)")
    expect(read('src/app/Root.tsx')).toContain("upsert('meta[name=\"robots\"]', 'name', SITE_ROBOTS_BASELINE)")
    expect(read('src/main.tsx')).toContain('bootstrapApprovedArticleSnapshot()')
  })

  it('does not make the empty-body metadata API a separately indexable URL', () => {
    const handler = read('api/guide-share.mjs')
    expect(handler).toContain("res.setHeader('X-Robots-Tag', 'noindex, follow')")
    expect(handler).toContain('shareDocument({ ...meta, noIndex: true })')
  })
})
