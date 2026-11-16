import { describe, expect, it } from 'vitest'
import { composeApprovedArticleHtml, serializeJson } from '../scripts/prerender-approved-article.mjs'

const shell = `<!doctype html><html><head><title>Old</title><meta name="description" content="one"><meta name="description" content="two"><meta name="robots" content="noindex, nofollow"><meta property="og:title" content="Old"><link rel="canonical" href="https://ringsociety.com/"><script type="application/ld+json">{}</script><script type="module" src="/assets/app-a1.js"></script><link rel="stylesheet" href="/assets/app-a1.css"></head><body><div id="root"></div></body></html>`
const doc = { slug: 'how-to-buy-an-engagement-ring', title: 'Approved <Guide>', subtitle: 'Excerpt', hero: 'https://cdn.sanity.io/ring.jpg', noIndex: false, intro: [], body: [{ type: 'p', text: 'Article content' }] }
const meta = { title: doc.title, description: 'Approved & exact description', canonical: 'https://ringsociety.com/guides/how-to-buy-an-engagement-ring', image: doc.hero, imageAlt: 'Original hero', noIndex: false }
const result = { doc, meta, html: '<main><h1>Approved &lt;Guide&gt;</h1><p>Article content</p></main><footer>Footer</footer>', structuredData: { '@context': 'https://schema.org', '@type': 'Article', headline: doc.title } }

describe('approved article initial HTML', () => {
  it('replaces all conflicting head tags and retains built assets and article body', () => {
    const html = composeApprovedArticleHtml(shell, result)
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html.match(/name="robots"/g)).toHaveLength(1)
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain('<meta name="robots" content="index, follow" />')
    expect(html).toContain('Approved &amp; exact description')
    expect(html).toContain('/assets/app-a1.js')
    expect(html).toContain('/assets/app-a1.css')
    expect(html).toContain('<p>Article content</p>')
    expect(html).toContain('id="ring-society-approved-article" type="application/json"')
    expect(html).not.toContain('noindex, nofollow')
  })

  it('safely roundtrips HTML script delimiters in public CMS strings', () => {
    const value = { text: '</script><script>alert(1)</script>\u2028\u2029<>' }
    const encoded = serializeJson(value)
    expect(encoded).not.toContain('</script>')
    expect(encoded).not.toContain('<')
    expect(encoded).not.toContain('>')
    expect(JSON.parse(encoded)).toEqual(value)
  })

  it('refuses an unapproved, empty, or mismatched canonical article', () => {
    expect(() => composeApprovedArticleHtml(shell, { ...result, doc: { ...doc, noIndex: true } })).toThrow()
    expect(() => composeApprovedArticleHtml(shell, { ...result, doc: { ...doc, slug: 'other-guide' } })).toThrow()
    expect(() => composeApprovedArticleHtml(shell, { ...result, doc: { ...doc, body: [] } })).toThrow()
    expect(() => composeApprovedArticleHtml(shell, { ...result, meta: { ...meta, canonical: 'https://other.example/' } })).toThrow()
    expect(() => composeApprovedArticleHtml(shell.replace('<div id="root"></div>', ''), result)).toThrow()
  })
})
