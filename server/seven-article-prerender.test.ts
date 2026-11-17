import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArticleDoc } from '../src/lib/content'
import { APPROVED_ARTICLE_SLUGS } from '../src/lib/articleSeo'
import { composeApprovedArticleHtml } from '../scripts/prerender-approved-article.mjs'

const state = vi.hoisted(() => ({
  posts: [] as any[], cache: new Map<string, any>(), fetch: vi.fn(), seed: vi.fn(),
}))
vi.mock('../src/sanity/client', () => ({ sanityClient: { fetch: state.fetch }, isSanityConfigured: true }))
vi.mock('../src/sanity/image', () => ({
  imageUrl: (image: any, width: number) => image?.asset?._ref ? `https://cdn.example/${image.asset._ref}?w=${width}` : undefined,
}))
vi.mock('../src/sanity/queries', () => ({
  seedCmsArticle: (doc: any) => { state.seed(doc); state.cache.set(doc.slug, doc) },
  getCachedCmsArticle: (slug: string) => state.cache.get(slug) ?? null,
  getCmsArticle: async (slug: string) => state.cache.get(slug) ?? null,
  prefetchCmsArticle: vi.fn(),
  getCmsSiteSettings: vi.fn(),
}))
import { renderApprovedArticle } from '../src/entry-article-prerender'
import { bootstrapApprovedArticleSnapshot } from '../src/lib/approvedArticleSnapshot'

const shell = '<html><head><title>Site</title><meta name="robots" content="noindex, nofollow"></head><body><div id="root"></div></body></html>'
function cmsPost(slug: string) {
  return {
    _id: `post-${slug}`, slug, title: `Published title ${slug}`, excerpt: `Published excerpt ${slug}`,
    heroImage: { mainImage: { asset: { _ref: `hero-${slug}` } }, alt: `Hero ${slug}` },
    intro: [{ _type: 'block', children: [{ text: `Introduction for ${slug}` }] }],
    body: [{ _type: 'block', style: 'h2', children: [{ text: `Section ${slug}` }] },
      { _type: 'block', children: [{ text: `Published body uniquely for ${slug}` }] }],
    seo: { noIndex: false, title: `SEO title ${slug}`, description: `SEO description ${slug}`, canonicalPath: `/guides/${slug}` },
  }
}
function snapshot(slug: string): ArticleDoc {
  return { slug, title: `Title ${slug}`, subtitle: `Excerpt ${slug}`, hero: 'https://cdn.example/hero.jpg', noIndex: false,
    canonicalPath: `/guides/${slug}`, category: 'Guide', readTime: '', categories: [], keywordTags: [],
    intro: [], body: [{ type: 'p', text: `Body ${slug}` }] }
}
function browser(pathname: string, hostname: string, value: unknown) {
  vi.stubGlobal('window', { location: { pathname, hostname } })
  vi.stubGlobal('document', { getElementById: (id: string) => id === 'ring-society-approved-article' ? { textContent: typeof value === 'string' ? value : JSON.stringify(value) } : null })
}
beforeEach(() => {
  state.cache.clear(); state.seed.mockClear(); state.fetch.mockReset(); state.posts = []
  state.fetch.mockImplementation(async (query: string) => query.includes('isMostLoved == true') ? [] : state.posts)
})
afterEach(() => vi.unstubAllGlobals())

describe('published CMS to real article prerender', () => {
  it.each(APPROVED_ARTICLE_SLUGS)('renders the matched published content and exact metadata for %s', async (slug) => {
    state.posts = [cmsPost(slug)]
    const result = await renderApprovedArticle(slug)
    expect(state.fetch).toHaveBeenCalledWith(expect.stringContaining('slug.current == $slug'), { slug })
    expect(result.doc.slug).toBe(slug)
    expect(result.doc.body).toContainEqual(expect.objectContaining({ text: `Published body uniquely for ${slug}` }))
    expect(result.html).toContain(`Published body uniquely for ${slug}`)
    expect(result.html).toContain(`Published title ${slug}`)
    expect(result.html).not.toContain('Lorem ipsum')
    const html = composeApprovedArticleHtml(shell, result, slug)
    expect(html).toContain(`<title>SEO title ${slug}</title>`)
    expect(html).toContain(`content="SEO description ${slug}"`)
    expect(html).toContain(`href="https://ringsociety.com/guides/${slug}"`)
    expect(JSON.parse(html.match(/id="ring-society-approved-article" type="application\/json">(.*?)<\/script>/)![1])).toEqual(result.doc)
    expect(JSON.parse(html.match(/id="ring-society-article-schema" type="application\/ld\+json">(.*?)<\/script>/)![1]).mainEntityOfPage).toBe(`https://ringsociety.com/guides/${slug}`)
  })
  it.each(APPROVED_ARTICLE_SLUGS)('refuses missing, mismatched, unapproved, empty, and malformed CMS data for %s', async (slug) => {
    const post = cmsPost(slug)
    const variants = [
      [], [post, post], [{ ...post, slug: 'another-guide' }], [{ ...post, _id: 'drafts.example' }],
      [{ ...post, _id: 'versions.release.example' }],
      [{ ...post, seo: { ...post.seo, noIndex: true } }],
      [{ ...post, seo: { ...post.seo, noIndex: undefined } }],
      [{ ...post, seo: { ...post.seo, canonicalPath: '/guides/another-guide' } }],
      [{ ...post, seo: { ...post.seo, canonicalPath: 'https://ringsociety.com/guides/' + slug } }],
      [{ ...post, seo: { ...post.seo, canonicalPath: '' } }],
      [{ ...post, seo: { ...post.seo, title: ' ' } }],
      [{ ...post, seo: { ...post.seo, description: '' } }],
      [{ ...post, title: ' ' }], [{ ...post, excerpt: '' }], [{ ...post, heroImage: {} }],
      [{ ...post, body: [] }], [{ ...post, body: [{ _type: 'block', children: [{ text: ' ' }] }] }],
      [{ ...post, body: [{ _type: 'block', style: 'h2', children: [{ text: 'Only a heading' }] }] }],
    ]
    for (const variant of variants) { state.posts = variant; await expect(renderApprovedArticle(slug)).rejects.toThrow() }
  })
  it('refuses arbitrary slugs before any CMS request', async () => {
    await expect(renderApprovedArticle('engagement-ring-budgets')).rejects.toThrow(/unapproved slug/)
    expect(state.fetch).not.toHaveBeenCalled()
  })
  it('allows an absent CMS canonical override but never normalizes a supplied wrong value', async () => {
    const slug = APPROVED_ARTICLE_SLUGS[0]
    const post = cmsPost(slug)
    state.posts = [{ ...post, seo: { ...post.seo, canonicalPath: undefined } }]
    expect((await renderApprovedArticle(slug)).meta.canonical).toBe(`https://ringsociety.com/guides/${slug}`)
  })
})

describe('first browser render snapshot', () => {
  it.each(APPROVED_ARTICLE_SLUGS)('seeds only the matching canonical route snapshot for %s', (slug) => {
    const doc = snapshot(slug)
    browser(`/guides/${slug}`, 'ringsociety.com', doc)
    bootstrapApprovedArticleSnapshot()
    expect(state.seed).toHaveBeenCalledTimes(1)
    expect(state.seed).toHaveBeenCalledWith(doc)
    expect(state.cache.get(slug)).toEqual(doc)
  })
  it.each(APPROVED_ARTICLE_SLUGS)('does not seed a preview, alias, mismatched route, or invalid snapshot for %s', (slug) => {
    const doc = snapshot(slug)
    const other = APPROVED_ARTICLE_SLUGS.find((s) => s !== slug)!
    for (const [path, host, value] of [
      [`/guides/${slug}`, 'preview.vercel.app', doc], [`/guides/${slug}`, 'www.ringsociety.com', doc],
      [`/guides/${slug}/`, 'ringsociety.com', doc], [`/approved-articles/${slug}.html`, 'ringsociety.com', doc],
      [`/guides/${other}`, 'ringsociety.com', doc], [`/guides/unapproved`, 'ringsociety.com', doc],
      [`/guides/${slug}`, 'ringsociety.com', { ...doc, noIndex: true }],
      [`/guides/${slug}`, 'ringsociety.com', { ...doc, canonicalPath: `/guides/${other}` }],
      [`/guides/${slug}`, 'ringsociety.com', { ...doc, body: [] }],
      [`/guides/${slug}`, 'ringsociety.com', { ...doc, subtitle: ' ' }],
      [`/guides/${slug}`, 'ringsociety.com', '{bad json'],
    ] as [string, string, unknown][]) {
      browser(path, host, value); bootstrapApprovedArticleSnapshot()
      expect(state.seed).not.toHaveBeenCalled()
    }
  })
})
