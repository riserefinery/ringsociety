import { sanityClient } from './client'
import { toArticleDoc, toCmsCards } from './mappers'
import type { CmsPageDocument, CmsPost, CmsSiteSettings, CmsTopGuidesDocument } from './types'

const articleRequestCache = new Map<string, Promise<ReturnType<typeof toArticleDoc> | null>>()
const articleResultCache = new Map<string, ReturnType<typeof toArticleDoc> | null>()
let topGuidesRequestCache: Promise<CmsTopGuidesDocument | null> | null = null

const postProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  contentType,
  isMostLoved,
  heroImage,
  bigFeatureImage,
  "articleLabel": articleLabel->{_id, name},
  topGuidesBadge,
  topGuidesTextTone,
  intro,
  body,
  keywordTags,
  sidebarCta,
  "categories": categories[]->{title, filterKey},
  "relatedPosts": relatedPosts[]->{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    contentType,
    isMostLoved,
    heroImage,
    "articleLabel": articleLabel->{_id, name},
    "categories": categories[]->{title, filterKey}
  }
}`

export async function getCmsArticleCards() {
  if (!sanityClient) return []

  try {
    const posts = await sanityClient.fetch<CmsPost[]>(
      `*[_type == "post" && defined(slug.current)] | order(_updatedAt desc) ${postProjection}`,
    )
    return toCmsCards(posts)
  } catch {
    return []
  }
}

export async function getCmsArticle(slug: string | undefined) {
  if (!sanityClient || !slug) return null

  const cached = articleRequestCache.get(slug)
  if (cached) return cached

  const request = (async () => {
    try {
    const [post, popularPosts] = await Promise.all([
      sanityClient.fetch<CmsPost | null>(
        `*[_type == "post" && slug.current == $slug][0] ${postProjection}`,
        { slug },
      ),
      sanityClient.fetch<CmsPost[]>(
        `*[_type == "post" && isMostLoved == true && defined(slug.current) && slug.current != $slug] | order(_updatedAt desc)[0...6] ${postProjection}`,
        { slug },
      ),
    ])
    const article = post ? toArticleDoc(post) : null
      return article ? { ...article, popularRelated: toCmsCards(popularPosts) } : null
    } catch {
      return null
    }
  })()
  const trackedRequest = request.then((article) => {
    articleResultCache.set(slug, article)
    return article
  })
  articleRequestCache.set(slug, trackedRequest)
  return trackedRequest
}

/** Return a prewarmed post synchronously when a prior card interaction completed its CMS request. */
export function getCachedCmsArticle(slug: string | undefined) {
  return slug ? articleResultCache.get(slug) ?? null : null
}

/** Prewarm the CMS record before a card navigation without blocking the interaction. */
export function prefetchCmsArticle(slug: string | undefined) {
  if (slug) void getCmsArticle(slug)
}

const pageProjection = `{headline, introduction, eyebrow, heroImage, supportEmail, responseTime}`

const topGuidesProjection = `{
  headline,
  introduction,
  eyebrow,
  heroImage,
  supportEmail,
  responseTime,
  "selectedPosts": selectedPosts[]{
    _key,
    "postId": @._ref,
    "post": @->{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      contentType,
      isMostLoved,
      heroImage,
      bigFeatureImage,
      "articleLabel": articleLabel->{_id, name},
      topGuidesBadge,
      topGuidesTextTone,
      "categories": categories[]->{title, filterKey}
    }
  }
}`

export async function getCmsPage(documentType: 'blogLanding' | 'topGuidesLanding' | 'missionPage' | 'contactPage') {
  if (!sanityClient) return null

  try {
    return await sanityClient.fetch<CmsPageDocument | null>(`*[_type == $documentType][0] ${pageProjection}`, { documentType })
  } catch {
    return null
  }
}

export async function getCmsTopGuidesPage() {
  if (!sanityClient) return null

  if (topGuidesRequestCache) return topGuidesRequestCache

  topGuidesRequestCache = sanityClient
    .fetch<CmsTopGuidesDocument | null>(`*[_type == "topGuidesLanding"][0] ${topGuidesProjection}`)
    .catch(() => null)

  return topGuidesRequestCache
}

export async function getCmsSiteSettings() {
  if (!sanityClient) return null

  try {
    return await sanityClient.fetch<CmsSiteSettings | null>(' *[_type == "siteSettings"][0]{helloBarText}')
  } catch {
    return null
  }
}
