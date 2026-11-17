import type { ArticleDoc } from './content'
import { APPROVED_ARTICLE_PATHS, articleMetadata, hasArticleBodyContent, isArticleIndexable } from './articleSeo'
import { seedCmsArticle } from '../sanity/queries'

export const APPROVED_ARTICLE_SNAPSHOT_ID = 'ring-society-approved-article'

export function bootstrapApprovedArticleSnapshot() {
  const pathname = window.location.pathname
  if (!APPROVED_ARTICLE_PATHS.includes(pathname)) return
  const element = document.getElementById(APPROVED_ARTICLE_SNAPSHOT_ID)
  if (!element?.textContent) return
  try {
    const article = JSON.parse(element.textContent) as ArticleDoc
    const nonempty = (value: unknown) => typeof value === 'string' && Boolean(value.trim())
    if (
      !article || `/guides/${article.slug}` !== pathname ||
      !isArticleIndexable(article, window.location.hostname) ||
      !hasArticleBodyContent(article.body) || !Array.isArray(article.intro) ||
      !nonempty(article.title) || !nonempty(article.subtitle) || !nonempty(article.hero)
    ) return
    const meta = articleMetadata(article, window.location.hostname)
    if (!nonempty(meta.title) || !nonempty(meta.description) || !nonempty(meta.image)) return
    seedCmsArticle(article)
  } catch {
    // Invalid or missing snapshots retain the existing published-CMS lookup.
  }
}
