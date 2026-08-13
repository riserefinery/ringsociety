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

export type CmsTextSpan = { text?: string }

export type CmsPortableBlock = {
  _type?: string
  style?: string
  children?: CmsTextSpan[]
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

export type CmsPost = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  contentType?: string
  categories?: CmsCategory[]
  isMostLoved?: boolean
  heroImage?: CmsResponsiveImage
  intro?: CmsPortableBlock[]
  body?: CmsPortableBlock[]
  keywordTags?: string[]
  sidebarCta?: CmsSidebarCta
  relatedPosts?: CmsPost[]
  publishedAt?: string
}
