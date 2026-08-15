export const ARTICLE_ARRIVAL_EVENT = 'ring-society:article-arrival'

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
}

/** Marks an article-card navigation before the router changes routes, preventing stale chrome from sitting above the destination load. */
export function beginMobileArticleArrival() {
  if (!isMobileViewport()) return
  document.documentElement.dataset.ringSocietyArticleLoading = 'true'
  window.dispatchEvent(new CustomEvent(ARTICLE_ARRIVAL_EVENT, { detail: { state: 'loading' } }))
}

/** Releases the persistent chrome only after the destination hero image is usable. */
export function finishMobileArticleArrival(slug: string) {
  document.documentElement.dataset.ringSocietyArticleLoading = 'false'
  window.dispatchEvent(new CustomEvent(ARTICLE_ARRIVAL_EVENT, { detail: { state: 'ready', slug } }))
}
