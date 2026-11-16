import type { ArticleDoc } from './content'

export const APPROVED_ARTICLE_SLUG = 'how-to-buy-an-engagement-ring'
export const APPROVED_ARTICLE_PATH = `/guides/${APPROVED_ARTICLE_SLUG}`
export const CANONICAL_ORIGIN = 'https://ringsociety.com'
export const SITE_ROBOTS_BASELINE = 'noindex, nofollow'

/** Only the reviewed guide on the canonical host is eligible for this release. */
export function isArticleIndexable(doc: ArticleDoc, hostname = 'ringsociety.com') {
  return hostname === 'ringsociety.com' && doc.slug === APPROVED_ARTICLE_SLUG && doc.noIndex === false
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
