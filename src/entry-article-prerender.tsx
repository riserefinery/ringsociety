import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Root from './app/Root'
import Article from './pages/Article'
import type { ArticleDoc } from './lib/content'
import type { CmsPost } from './sanity/types'
import {
  APPROVED_ARTICLE_SLUG, APPROVED_ARTICLE_PATH, APPROVED_ARTICLE_SLUGS, CANONICAL_ORIGIN,
  isApprovedArticleSlug, isArticleIndexable, hasArticleBodyContent, articleMetadata, articleStructuredData,
} from './lib/articleSeo'
import { sanityClient } from './sanity/client'
import { toArticleDoc, toCmsCards } from './sanity/mappers'
import { seedCmsArticle } from './sanity/queries'

export { APPROVED_ARTICLE_SLUG, APPROVED_ARTICLE_PATH, APPROVED_ARTICLE_SLUGS, CANONICAL_ORIGIN }

// The ordinary article mapper intentionally normalizes invalid canonical values. For
// this security boundary inspect the raw, published post before applying that mapper.
// Keep this projection aligned with the reader's CMS article query.
const postProjection = `{
  _id, title, "slug": slug.current, excerpt, contentType, isMostLoved, heroImage,
  bigFeatureImage, "articleLabel": articleLabel->{_id, name}, topGuidesBadge, topGuidesTextTone,
  intro, body, articleRelatedGuides, sources, keywordTags, sidebarCta,
  "seo": seo{title, description, canonicalPath, openGraphImage, noIndex},
  "categories": categories[]->{title, filterKey},
  "relatedPosts": relatedPosts[]->{_id, title, "slug": slug.current, excerpt, contentType,
    isMostLoved, heroImage, "articleLabel": articleLabel->{_id, name},
    "categories": categories[]->{title, filterKey}}
}`

function requireNonempty(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Approved article prerender refused: missing ${label}`)
  }
}

function hasRenderedBodyText(doc: ArticleDoc, html: string) {
  // Inline spans may split text with markup. Look for at least one nonblank
  // reader-visible body segment, escaped exactly as React emits it.
  const pieces: string[] = []
  for (const block of doc.body) {
    if (block.type === 'p' || block.type === 'blockquote') {
      pieces.push(...(block.inline?.length ? block.inline.map((part) => part.text) : [block.text]))
    } else if (block.type === 'note') {
      pieces.push(block.text)
    } else if (block.type === 'list') {
      for (const item of block.items) pieces.push(...(item.inline?.length ? item.inline.map((part) => part.text) : [item.text]))
    } else if (block.type === 'deflist') {
      for (const item of block.items) pieces.push(item.term, item.def)
    }
  }
  return pieces.some((piece) => piece.trim() && html.includes(renderToStaticMarkup(<>{piece.trim()}</>)))
}

/** Only mapped, reader-visible article fields cross the server/client boundary. */
function publicSnapshot(article: ArticleDoc): ArticleDoc {
  return JSON.parse(JSON.stringify({
    slug: article.slug, category: article.category, badge: article.badge, title: article.title,
    subtitle: article.subtitle, readTime: article.readTime, hero: article.hero, heroImage: article.heroImage,
    shareTitle: article.shareTitle, shareDescription: article.shareDescription, shareImage: article.shareImage,
    shareImageAlt: article.shareImageAlt, canonicalPath: article.canonicalPath,
    categories: article.categories, keywordTags: article.keywordTags, noIndex: article.noIndex,
    cta: article.cta, intro: article.intro, body: article.body, articleRelatedGuides: article.articleRelatedGuides,
    sources: article.sources, related: article.related, popularRelated: article.popularRelated,
  })) as ArticleDoc
}

/** Accepts only the seven explicit slugs, never an arbitrary URL or fallback article. */
export async function renderApprovedArticle(slug: string = APPROVED_ARTICLE_SLUG) {
  if (!isApprovedArticleSlug(slug)) throw new Error('Approved article prerender refused: unapproved slug')
  if (!sanityClient) throw new Error('Approved article prerender refused: published CMS unavailable')
  // The configured client uses perspective: published, useCdn: false and no credentials.
  const [posts, popularPosts] = await Promise.all([
    sanityClient.fetch<CmsPost[]>(`*[_type == "post" && slug.current == $slug] ${postProjection}`, { slug }),
    sanityClient.fetch<CmsPost[]>(`*[_type == "post" && isMostLoved == true && defined(slug.current) && slug.current != $slug] | order(_updatedAt desc)[0...6] ${postProjection}`, { slug }),
  ])
  if (!Array.isArray(posts) || posts.length !== 1 || posts[0]?.slug !== slug || !posts[0]?._id || posts[0]._id.startsWith('drafts.') || posts[0]._id.startsWith('versions.')) {
    throw new Error(`Approved article prerender refused: published article unavailable or slug mismatch: ${slug}`)
  }
  const post = posts[0]
  if (post.seo?.noIndex !== false) throw new Error(`Approved article prerender refused: explicit indexing approval is required: ${slug}`)
  if (post.seo?.canonicalPath != null && post.seo.canonicalPath !== `/guides/${slug}`) {
    throw new Error(`Approved article prerender refused: canonical path mismatch: ${slug}`)
  }
  requireNonempty(post.title, 'title')
  requireNonempty(post.excerpt, 'excerpt')
  const mapped = toArticleDoc(post)
  if (!mapped) throw new Error(`Approved article prerender refused: missing hero image or article: ${slug}`)
  requireNonempty(mapped.hero, 'hero image')
  if (!hasArticleBodyContent(mapped.body)) throw new Error(`Approved article prerender refused: empty article body: ${slug}`)

  const doc = publicSnapshot({ ...mapped, popularRelated: toCmsCards(popularPosts) })
  const meta = articleMetadata(doc)
  if (!isArticleIndexable(doc) || meta.noIndex !== false || meta.canonical !== `${CANONICAL_ORIGIN}/guides/${slug}`) {
    throw new Error(`Approved article prerender refused: metadata is not approved for the exact canonical URL: ${slug}`)
  }
  requireNonempty(meta.title, 'metadata title')
  requireNonempty(meta.description, 'metadata description')
  requireNonempty(meta.image, 'share image')

  // Article reads this per-slug cache synchronously; no browser effect is needed for SSR.
  seedCmsArticle(doc)
  const router = createMemoryRouter([
    { element: <Root />, children: [{ path: '/guides/:slug', element: <Article /> }] },
  ], { initialEntries: [`/guides/${slug}`] })
  try {
    const html = renderToString(<RouterProvider router={router} />)
    if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1 || !html.includes('<footer') || !hasRenderedBodyText(doc, html)) {
      throw new Error(`Approved article prerender refused: article or shared shell failed to render: ${slug}`)
    }
    return { html, doc, meta, structuredData: articleStructuredData(doc) }
  } finally {
    router.dispose()
  }
}
