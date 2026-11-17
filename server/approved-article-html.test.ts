import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { composeApprovedArticleHtml, serializeJson, approvedSlugs, writeApprovedArticleArtifacts } from '../scripts/prerender-approved-article.mjs'

const shell = `<!doctype html><html><head><title>Old</title><meta name="description" content="one"><meta name="description" content="two"><meta name="robots" content="noindex, nofollow"><meta property="og:title" content="Old"><link rel="canonical" href="https://ringsociety.com/"><script type="application/ld+json">{}</script><script type="module" src="/assets/app-a1.js"></script><link rel="stylesheet" href="/assets/app-a1.css"></head><body><div id="root"></div></body></html>`
function resultFor(slug: string) {
  const doc = {
    slug, title: `Article <${slug}>`, subtitle: `Excerpt ${slug}`, hero: `https://cdn.sanity.io/${slug}.jpg`,
    shareTitle: `SEO title ${slug}`, shareDescription: `Approved & exact ${slug}`, shareImageAlt: `Hero ${slug}`,
    canonicalPath: `/guides/${slug}`, noIndex: false, intro: [], body: [{ type: 'p', text: `Actual CMS body ${slug}` }],
  }
  const meta = { title: doc.shareTitle, description: doc.shareDescription, canonical: `https://ringsociety.com/guides/${slug}`, image: doc.hero, imageAlt: doc.shareImageAlt, noIndex: false }
  const structuredData = { '@context': 'https://schema.org', '@type': 'Article', headline: meta.title, description: meta.description, image: meta.image, mainEntityOfPage: meta.canonical, author: { '@type': 'Organization', name: 'Ring Society' }, publisher: { '@type': 'Organization', name: 'Ring Society', url: 'https://ringsociety.com/' } }
  return { doc, meta, structuredData, html: `<main><h1>Article ${slug}</h1><p>${doc.body[0].text}</p></main><footer>Footer</footer>` }
}

describe('approved article initial HTML', () => {
  it.each(approvedSlugs)('emits one body, own metadata, schema, and snapshot for %s', (slug: string) => {
    const result = resultFor(slug)
    const html = composeApprovedArticleHtml(shell, result, slug)
    for (const pattern of [/<title>/g, /name="description"/g, /name="robots"/g, /rel="canonical"/g, /property="og:title"/g]) {
      expect(html.match(pattern)).toHaveLength(1)
    }
    expect(html).toContain(`<title>SEO title ${slug}</title>`)
    expect(html).toContain(`<meta name="description" content="Approved &amp; exact ${slug}" />`)
    expect(html).toContain(`<link rel="canonical" href="https://ringsociety.com/guides/${slug}" />`)
    expect(html).toContain(`<meta property="og:url" content="https://ringsociety.com/guides/${slug}" />`)
    expect(html).toContain(`<meta name="twitter:title" content="SEO title ${slug}" />`)
    expect(html).toContain('<meta name="robots" content="index, follow" />')
    expect(html).toContain(`/assets/app-a1.js`)
    expect(html).toContain(`/assets/app-a1.css`)
    expect(html).toContain(`<p>Actual CMS body ${slug}</p>`)
    const snapshot = html.match(/<script id="ring-society-approved-article" type="application\/json">(.*?)<\/script>/)?.[1]
    expect(JSON.parse(snapshot!)).toEqual(result.doc)
    const schema = html.match(/<script id="ring-society-article-schema" type="application\/ld\+json">(.*?)<\/script>/)?.[1]
    expect(JSON.parse(schema!)).toEqual(result.structuredData)
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
  it.each(approvedSlugs)('refuses incomplete, misrouted or mismatched input for %s', (slug: string) => {
    const result = resultFor(slug)
    const { doc, meta, structuredData } = result
    for (const bad of [
      { ...result, doc: { ...doc, noIndex: true } },
      { ...result, doc: { ...doc, noIndex: undefined } },
      { ...result, doc: { ...doc, slug: 'other-guide' } },
      { ...result, doc: { ...doc, body: [] } },
      { ...result, doc: { ...doc, body: [{ type: 'p', text: '  ' }] } },
      { ...result, doc: { ...doc, body: [{ type: 'h2', text: 'Heading only' }] } },
      { ...result, doc: { ...doc, title: ' ' } },
      { ...result, doc: { ...doc, subtitle: '' } },
      { ...result, doc: { ...doc, hero: '' } },
      { ...result, doc: { ...doc, intro: undefined } },
      { ...result, doc: { ...doc, canonicalPath: '/guides/other-guide' } },
      { ...result, meta: { ...meta, canonical: 'https://other.example/' } },
      { ...result, meta: { ...meta, title: 'Other title' } },
      { ...result, meta: { ...meta, description: '' } },
      { ...result, structuredData: { ...structuredData, mainEntityOfPage: 'https://other.example/' } },
      { ...result, structuredData: { ...structuredData, headline: 'Other title' } },
      { ...result, html: '<main><h1>Bad</h1></main>' },
    ]) expect(() => composeApprovedArticleHtml(shell, bad, slug)).toThrow()
    expect(() => composeApprovedArticleHtml(shell.replace('<div id="root"></div>', ''), result, slug)).toThrow()
    expect(() => composeApprovedArticleHtml(shell, result, 'other-guide')).toThrow()
    expect(() => composeApprovedArticleHtml(shell, result, approvedSlugs.find((s: string) => s !== slug))).toThrow()
  })
  it('writes all seven distinct artifacts together and removes stale output on any late failure', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'ring-society-indexing-'))
    const directory = join(temporary, 'approved-articles')
    const entry = { CANONICAL_ORIGIN: 'https://ringsociety.com', APPROVED_ARTICLE_SLUGS: approvedSlugs, renderApprovedArticle: async (slug: string) => resultFor(slug) }
    try {
      await mkdir(directory)
      await writeFile(join(directory, 'stale.html'), 'stale')
      const files = await writeApprovedArticleArtifacts(shell, entry, directory)
      expect(files).toHaveLength(7)
      expect((await readdir(directory)).sort()).toEqual(approvedSlugs.map((slug: string) => `${slug}.html`).sort())
      for (const slug of approvedSlugs) expect(await readFile(join(directory, `${slug}.html`), 'utf8')).toContain(`Actual CMS body ${slug}`)
      const failingEntry = { ...entry, renderApprovedArticle: async (slug: string) => {
        if (slug === approvedSlugs[6]) throw new Error('last record is noindexed')
        return resultFor(slug)
      } }
      await expect(writeApprovedArticleArtifacts(shell, failingEntry, directory)).rejects.toThrow('last record is noindexed')
      await expect(readdir(directory)).rejects.toMatchObject({ code: 'ENOENT' })
      await mkdir(directory)
      await writeFile(join(directory, 'stale.html'), 'stale')
      await expect(writeApprovedArticleArtifacts(shell, { ...entry, APPROVED_ARTICLE_SLUGS: approvedSlugs.slice(0, 6) }, directory)).rejects.toThrow(/allowlist/)
      await expect(readdir(directory)).rejects.toMatchObject({ code: 'ENOENT' })
    } finally {
      await rm(temporary, { recursive: true, force: true })
    }
  })
})
