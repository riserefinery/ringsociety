import type { ArticleDoc } from './content'
import { APPROVED_ARTICLE_PATH, APPROVED_ARTICLE_SLUG, isArticleIndexable } from './articleSeo'
import { seedCmsArticle } from '../sanity/queries'

export const APPROVED_ARTICLE_SNAPSHOT_ID = 'ring-society-approved-article'

export function bootstrapApprovedArticleSnapshot() {
  if (window.location.pathname !== APPROVED_ARTICLE_PATH) return
  const element = document.getElementById(APPROVED_ARTICLE_SNAPSHOT_ID)
  if (!element?.textContent) return
  try {
    const article = JSON.parse(element.textContent) as ArticleDoc
    if (
      article.slug !== APPROVED_ARTICLE_SLUG ||
      !isArticleIndexable(article, window.location.hostname) ||
      !Array.isArray(article.body) ||
      !Array.isArray(article.intro) ||
      !article.title ||
      !article.hero
    ) return
    seedCmsArticle(article)
  } catch {
    // Invalid or missing snapshots retain the existing published-CMS lookup.
  }
}
