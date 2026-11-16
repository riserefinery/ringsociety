import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Root from './app/Root'
import Article from './pages/Article'
import type { ArticleDoc } from './lib/content'
import {
  APPROVED_ARTICLE_SLUG,
  APPROVED_ARTICLE_PATH,
  CANONICAL_ORIGIN,
  isArticleIndexable,
  articleMetadata,
  articleStructuredData,
} from './lib/articleSeo'
import { getCmsArticle, seedCmsArticle } from './sanity/queries'

export { APPROVED_ARTICLE_SLUG, APPROVED_ARTICLE_PATH, CANONICAL_ORIGIN }

function requireNonempty(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Approved article prerender refused: missing ${label}`)
  }
}

/** Only mapped, reader-visible article fields cross the server/client boundary. */
function publicSnapshot(article: ArticleDoc): ArticleDoc {
  return JSON.parse(JSON.stringify({
    slug: article.slug,
    category: article.category,
    badge: article.badge,
    title: article.title,
    subtitle: article.subtitle,
    readTime: article.readTime,
    hero: article.hero,
    heroImage: article.heroImage,
    shareTitle: article.shareTitle,
    shareDescription: article.shareDescription,
    shareImage: article.shareImage,
    shareImageAlt: article.shareImageAlt,
    canonicalPath: article.canonicalPath,
    categories: article.categories,
    keywordTags: article.keywordTags,
    noIndex: article.noIndex,
    cta: article.cta,
    intro: article.intro,
    body: article.body,
    articleRelatedGuides: article.articleRelatedGuides,
    sources: article.sources,
    related: article.related,
    popularRelated: article.popularRelated,
  })) as ArticleDoc
}

/** No URL parameter: this entry can render only the explicitly approved article. */
export async function renderApprovedArticle() {
  const fetched = await getCmsArticle(APPROVED_ARTICLE_SLUG)
  if (!fetched || fetched.slug !== APPROVED_ARTICLE_SLUG) {
    throw new Error('Approved article prerender refused: published article unavailable or slug mismatch')
  }
  if (fetched.noIndex !== false || !isArticleIndexable(fetched)) {
    throw new Error('Approved article prerender refused: explicit indexing approval is required')
  }
  requireNonempty(fetched.title, 'title')
  requireNonempty(fetched.subtitle, 'excerpt')
  requireNonempty(fetched.hero, 'hero image')
  if (!Array.isArray(fetched.body) || !fetched.body.length) {
    throw new Error('Approved article prerender refused: empty article body')
  }

  const doc = publicSnapshot(fetched)
  const meta = articleMetadata(doc)
  if (meta.noIndex !== false || meta.canonical !== `${CANONICAL_ORIGIN}${APPROVED_ARTICLE_PATH}`) {
    throw new Error('Approved article prerender refused: metadata is not approved for the exact canonical URL')
  }
  requireNonempty(meta.title, 'metadata title')
  requireNonempty(meta.description, 'metadata description')
  requireNonempty(meta.image, 'share image')

  // Article reads this cache synchronously; no browser effect is needed for SSR.
  seedCmsArticle(doc)
  const router = createMemoryRouter([
    {
      element: <Root />,
      children: [{ path: '/guides/:slug', element: <Article /> }],
    },
  ], { initialEntries: [APPROVED_ARTICLE_PATH] })

  try {
    const html = renderToString(<RouterProvider router={router} />)
    // Router error boundaries can turn render failures into HTML instead of throwing.
    if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1 || !html.includes('<footer')) {
      throw new Error('Approved article prerender refused: article or shared shell failed to render')
    }
    // Preserve the established organization-only attribution; never invent a personal author.
    const structuredData = articleStructuredData(doc)
    return { html, doc, meta, structuredData }
  } finally {
    router.dispose()
  }
}
