import { sanityClient } from './client'
import { toArticleDoc, toCmsCards } from './mappers'
import type { CmsPageDocument, CmsPost, CmsSiteSettings, CmsTopGuidesDocument } from './types'

const postProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  contentType,
  isMostLoved,
  heroImage,
  bigFeatureImage,
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

  try {
    const post = await sanityClient.fetch<CmsPost | null>(
      `*[_type == "post" && slug.current == $slug][0] ${postProjection}`,
      { slug },
    )
    return post ? toArticleDoc(post) : null
  } catch {
    return null
  }
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
    "post": @->${postProjection}
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

  try {
    return await sanityClient.fetch<CmsTopGuidesDocument | null>(`*[_type == "topGuidesLanding"][0] ${topGuidesProjection}`)
  } catch {
    return null
  }
}

export async function getCmsSiteSettings() {
  if (!sanityClient) return null

  try {
    return await sanityClient.fetch<CmsSiteSettings | null>(' *[_type == "siteSettings"][0]{helloBarText}')
  } catch {
    return null
  }
}
