export type CmsImageAsset = {
  _ref?: string
  _type?: 'reference'
}

export type CmsResponsiveImage = {
  mainImage?: { asset?: CmsImageAsset }
  mobileImage?: { asset?: CmsImageAsset }
  tabletImage?: { asset?: CmsImageAsset }
  xlImage?: { asset?: CmsImageAsset }
  alt?: string
  focalPoint?: string
}

export type CmsCategory = {
  title?: string
  filterKey?: 'jeweler' | 'trends' | 'perspectives' | 'diamonds'
}

export type CmsTextSpan = {
  _key?: string
  _type?: 'span'
  text?: string
  marks?: string[]
}

export type CmsLinkMark = {
  _key?: string
  _type?: 'link'
  href?: string
}

export type CmsPortableBlock = {
  _type?: string
  style?: string
  listItem?: 'bullet' | 'number'
  children?: CmsTextSpan[]
  markDefs?: CmsLinkMark[]
  asset?: CmsImageAsset
  alt?: string
  caption?: string
  note?: string
  label?: string
  text?: string
  items?: { term?: string; definition?: string }[]
}

export type CmsSidebarCta = {
  title?: string
  label?: string
  image?: CmsResponsiveImage
  background?: string
  to?: string
}

export type CmsArticleLabel = {
  _id?: string
  name?: string
}

export type CmsArticleRelatedGuide = {
  _key?: string
  title?: string
  url?: string
}

export type CmsSource = {
  _key?: string
  citation?: string
  url?: string
}

export type CmsPost = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  contentType?: string
  categories?: CmsCategory[]
  isMostLoved?: boolean
  heroImage?: CmsResponsiveImage
  bigFeatureImage?: CmsResponsiveImage
  articleLabel?: CmsArticleLabel
  topGuidesBadge?: 'none' | 'featured' | 'mostLoved'
  topGuidesTextTone?: 'light' | 'dark'
  intro?: CmsPortableBlock[]
  body?: CmsPortableBlock[]
  articleRelatedGuides?: CmsArticleRelatedGuide[]
  sources?: CmsSource[]
  keywordTags?: string[]
  sidebarCta?: CmsSidebarCta
  relatedPosts?: CmsPost[]
}

export type CmsTopGuidesSelection = {
  _key: string
  postId?: string
  post?: CmsPost | null
}

export type CmsPageDocument = {
  headline?: string
  introduction?: string
  eyebrow?: string
  heroImage?: CmsResponsiveImage
  supportEmail?: string
  responseTime?: string
}

export type CmsTopGuidesDocument = CmsPageDocument & {
  selectedPosts?: CmsTopGuidesSelection[]
}

export type CmsSiteSettings = {
  helloBarText?: string
}
