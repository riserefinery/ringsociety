import type { ArticleBlock, ArticleDoc } from './content'

// Keep the original exports for callers that refer to the first released guide.
export const APPROVED_ARTICLE_SLUG = 'how-to-buy-an-engagement-ring'
export const APPROVED_ARTICLE_PATH = `/guides/${APPROVED_ARTICLE_SLUG}`
export const APPROVED_ARTICLE_SLUGS = [
  APPROVED_ARTICLE_SLUG,
  'engagement-ring-settings-and-styles',
  'how-to-choose-a-jeweler',
  'engagement-rings-with-hidden-halos',
  'natural-vs-lab-grown-diamonds',
  'which-diamond-shape-looks-biggest',
  'ultimate-guide-to-diamond-clarity',
] as const
export const APPROVED_ARTICLE_PATHS = APPROVED_ARTICLE_SLUGS.map((slug) => `/guides/${slug}`)
export const CANONICAL_ORIGIN = 'https://ringsociety.com'
export const SITE_ROBOTS_BASELINE = 'noindex, nofollow'

export function isApprovedArticleSlug(slug: string): boolean {
  return (APPROVED_ARTICLE_SLUGS as readonly string[]).includes(slug)
}

/** Only a specifically authorized guide with its own canonical path may be indexed. */
export function isArticleIndexable(doc: ArticleDoc, hostname = 'ringsociety.com') {
  return hostname === 'ringsociety.com' && isApprovedArticleSlug(doc.slug) && doc.noIndex === false
    && (doc.canonicalPath == null || doc.canonicalPath === `/guides/${doc.slug}`)
}

/** A non-empty block array is insufficient if it has only images, headings, or empty text. */
export function hasArticleBodyContent(body: unknown): body is ArticleBlock[] {
  if (!Array.isArray(body)) return false
  const nonempty = (value: unknown) => typeof value === 'string' && value.trim().length > 0
  return body.some((block) => {
    if (!block || typeof block !== 'object') return false
    switch (block.type) {
      case 'p': case 'blockquote': case 'note': return nonempty(block.text)
      case 'list': return Array.isArray(block.items) && block.items.some((item: { text?: unknown }) => nonempty(item?.text))
      case 'deflist': return Array.isArray(block.items) && block.items.some((item: { term?: unknown; def?: unknown }) => nonempty(item?.term) || nonempty(item?.def))
      default: return false
    }
  })
}

export function articleMetadata(doc: ArticleDoc, hostname = 'ringsociety.com') {
  return {
    title: doc.shareTitle ?? doc.title,
    description: doc.shareDescription ?? doc.subtitle,
    canonical: `${CANONICAL_ORIGIN}${doc.canonicalPath ?? `/guides/${doc.slug}`}`,
    image: doc.shareImage ?? doc.hero,
    imageAlt: doc.shareImageAlt ?? doc.title,
    noIndex: !isArticleIndexable(doc, hostname),
  }
}

export function articleStructuredData(doc: ArticleDoc) {
  const meta = articleMetadata(doc)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    image: meta.image,
    mainEntityOfPage: meta.canonical,
    author: { '@type': 'Organization', name: 'Ring Society' },
    publisher: { '@type': 'Organization', name: 'Ring Society', url: `${CANONICAL_ORIGIN}/` },
  }
}
