import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APPROVED_ARTICLE_PATHS, APPROVED_ARTICLE_SLUGS, articleMetadata, articleStructuredData, isArticleIndexable, SITE_ROBOTS_BASELINE } from '../src/lib/articleSeo'
import type { ArticleDoc } from '../src/lib/content'
import { approvedSlugs } from '../scripts/prerender-approved-article.mjs'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')
const expected = [
  'how-to-buy-an-engagement-ring', 'engagement-ring-settings-and-styles', 'how-to-choose-a-jeweler',
  'engagement-rings-with-hidden-halos', 'natural-vs-lab-grown-diamonds',
  'which-diamond-shape-looks-biggest', 'ultimate-guide-to-diamond-clarity',
]
const documentFor = (slug: string) => ({
  slug, title: `Title ${slug}`, subtitle: `Excerpt ${slug}`, hero: `https://cdn.sanity.io/${slug}.jpg`, noIndex: false,
  canonicalPath: `/guides/${slug}`,
} as ArticleDoc)
const config = JSON.parse(read('vercel.json'))
const routes: any[] = config.routes
const hostMatches = (route: any, host: string) => !route.has || route.has.every((rule: any) => rule.type !== 'host' || new RegExp(rule.value).test(host))
const match = (route: any, path: string, host: string) => route.src && new RegExp(`^(?:${route.src})`).test(path) && hostMatches(route, host)

describe('seven-guide indexing policy', () => {
  it('has exactly the explicitly authorized slugs in every build allowlist', () => {
    expect([...APPROVED_ARTICLE_SLUGS]).toEqual(expected)
    expect(approvedSlugs).toEqual(expected)
    expect(APPROVED_ARTICLE_PATHS).toEqual(expected.map((slug) => `/guides/${slug}`))
  })
  it.each(expected)('allows only the exact canonical %s with an explicit CMS flag', (slug) => {
    const doc = documentFor(slug)
    const canonical = `https://ringsociety.com/guides/${slug}`
    expect(isArticleIndexable(doc)).toBe(true)
    expect(articleMetadata(doc)).toMatchObject({ title: doc.title, description: doc.subtitle, image: doc.hero, canonical, noIndex: false })
    expect(articleStructuredData(doc)).toMatchObject({ headline: doc.title, description: doc.subtitle, image: doc.hero, mainEntityOfPage: canonical })
    expect(isArticleIndexable({ ...doc, noIndex: true })).toBe(false)
    expect(isArticleIndexable({ ...doc, noIndex: undefined })).toBe(false)
    expect(isArticleIndexable({ ...doc, canonicalPath: '/guides/some-other-guide' })).toBe(false)
    expect(isArticleIndexable({ ...doc, canonicalPath: 'https://ringsociety.com/guides/' + slug })).toBe(false)
    expect(isArticleIndexable({ ...doc, canonicalPath: undefined })).toBe(true)
    for (const host of ['ringsociety-web.vercel.app', 'www.ringsociety.com', 'ringsocietyXcom', 'notringsociety.com']) {
      expect(isArticleIndexable(doc, host)).toBe(false)
      expect(articleMetadata(doc, host).noIndex).toBe(true)
    }
  })
  it('protects unapproved guides even when a CMS document sets noIndex false', () => {
    expect(isArticleIndexable(documentFor('engagement-ring-budgets'))).toBe(false)
    expect(articleMetadata(documentFor('another-guide')).noIndex).toBe(true)
  })
  it.each(expected)('routes %s ahead of blanket and social locks, and redirects its aliases', (slug) => {
    const path = `/guides/${slug}`
    const routeIndex = routes.findIndex((route) => route.src === `${path}$`)
    const lockIndex = routes.findIndex((route) => route.src === '/guides/(.*)')
    const socialIndex = routes.findIndex((route) => route.dest === '/api/guide-share?slug=$1')
    const route = routes[routeIndex]
    expect(routeIndex).toBeGreaterThanOrEqual(0)
    expect(routeIndex).toBeLessThan(lockIndex)
    expect(routeIndex).toBeLessThan(socialIndex)
    expect(route.headers['X-Robots-Tag']).toBe('index, follow')
    expect(route.continue).not.toBe(true)
    expect(route.dest).toBe(`/approved-articles/${slug}.html`)
    expect(match(route, path, 'ringsociety.com')).toBe(true)
    for (const host of ['www.ringsociety.com', 'ringsociety-web.vercel.app', 'ringsocietyXcom', 'notringsociety.com']) {
      expect(match(route, path, host)).toBe(false)
      expect(match(routes[lockIndex], path, host)).toBe(true)
    }
    for (const alias of [`${path}/`, `${path}/index`, `${path}/index/`, `${path}/index.html`, `${path}/index.html/`]) {
      const redirect = routes.find((candidate) => candidate.status === 308 && match(candidate, alias, 'ringsociety.com'))
      expect(redirect?.headers).toEqual({ Location: `https://ringsociety.com${path}`, 'X-Robots-Tag': 'noindex, follow' })
    }
    expect(match(route, `${path}-extra`, 'ringsociety.com')).toBe(false)
  })
  it('retains blanket guide, artifact, API, home, legal and host robots protections', () => {
    const guideLock = routes.find((route) => route.src === '/guides/(.*)')
    expect(guideLock.headers['X-Robots-Tag']).toBe('noindex, follow')
    const alias = routes.find((route) => route.src === '/approved-articles/(.*)')
    expect(alias.headers['X-Robots-Tag']).toBe('noindex, follow')
    expect(routes.find((route) => route.src === '/diamond-card-terms-and-eligibility').headers['X-Robots-Tag']).toBe('noindex, follow')
    expect(routes.find((route) => route.src?.startsWith('/text-us')).headers['X-Robots-Tag']).toBe('noindex, nofollow')
    const robots = routes.find((route) => route.dest === '/robots-production.txt')
    expect(match(robots, '/robots.txt', 'ringsociety.com')).toBe(true)
    expect(match(robots, '/robots.txt', 'ringsocietyXcom')).toBe(false)
    expect(match(robots, '/robots.txt', 'preview.vercel.app')).toBe(false)
    expect(JSON.parse(read('.figma/make/site.json')).robots.index).toBe(false)
    expect(read('vite.config.ts')).toContain('APPROVED_ARTICLE_PATHS.map')
    expect(read('vite.config.ts')).toContain('Disallow: /\\n')
    expect(read('vite.config.ts')).toContain('Allow: /assets/\\n')
    expect(read('docs/article-indexing-rollout.md')).toContain('Do not submit an XML sitemap at this stage.')
    expect(read('api/guide-share.mjs')).toContain("res.setHeader('X-Robots-Tag', 'noindex, follow')")
    expect(read('api/guide-share.mjs')).toContain('shareDocument({ ...meta, noIndex: true })')
  })
  it('keeps CMS defaults fail-closed and restores the site baseline on SPA navigation', () => {
    expect(SITE_ROBOTS_BASELINE).toBe('noindex, nofollow')
    expect(read('studio/schemas/documents.ts')).toContain('initialValue: { noIndex: true }')
    expect(read('src/sanity/mappers.ts')).toContain('noIndex: post.seo?.noIndex !== false')
    expect(read('src/pages/Article.tsx')).toContain("metadata.noIndex ? 'noindex, follow' : 'index, follow'")
    expect(read('src/pages/Article.tsx')).toContain("upsert('meta[name=\"robots\"]', 'name', SITE_ROBOTS_BASELINE)")
    expect(read('src/app/Root.tsx')).toContain("upsert('meta[name=\"robots\"]', 'name', SITE_ROBOTS_BASELINE)")
    expect(read('src/main.tsx')).toContain('bootstrapApprovedArticleSnapshot()')
  })
})
