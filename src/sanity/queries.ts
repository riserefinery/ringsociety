import { sanityClient } from './client'
import { toArticleDoc, toCmsCards } from './mappers'
import type { CmsPost } from './types'
import type { CmsPageDocument } from './types'

const postProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  contentType,
  isMostLoved,
  heroImage,
  intro,
  body,
  keywordTags,
  sidebarCta,
  publishedAt,
  "categories": categories[]->{title, filterKey},
  "relatedPosts": relatedPosts[]->{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    contentType,
    isMostLoved,
    heroImage,
    "categories": categories[]->{title, filterKey}
  }
}`

export async function getCmsArticleCards() {
  if (!sanityClient) return []

  try {
    const posts = await sanityClient.fetch<CmsPost[]>(
      `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) ${postProjection}`,
    )
    return toCmsCards(posts)
  } catch {
    return []
  }
}

export async function getCmsArticle(slug: string | undefined) {
  if (!sanityClient || !slug) return null

  try {
    const post = await sanityClient.fetch<CmsPost | null>(
      `*[_type == "post" && slug.current == $slug && defined(publishedAt)][0] ${postProjection}`,
      { slug },
    )
    return post ? toArticleDoc(post) : null
  } catch {
    return null
  }
}

const pageProjection = `{headline, introduction, eyebrow, heroImage, supportEmail, responseTime}`

export async function getCmsPage(documentType: 'blogLanding' | 'topGuidesLanding' | 'missionPage' | 'contactPage') {
  if (!sanityClient) return null

  try {
    return await sanityClient.fetch<CmsPageDocument | null>(`*[_type == $documentType][0] ${pageProjection}`, { documentType })
  } catch {
    return null
  }
}
