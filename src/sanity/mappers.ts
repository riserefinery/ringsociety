import type { Article, ArticleBlock, ArticleCta, ArticleDoc, FilterKey, Guide } from '../lib/content'
import { imageUrl } from './image'
import type { CmsPortableBlock, CmsPost, CmsSidebarCta, CmsTopGuidesSelection } from './types'

function textFromBlock(block: CmsPortableBlock): string {
  return block.children?.map((child) => child.text ?? '').join('').trim() ?? ''
}

function toBlocks(blocks: CmsPortableBlock[] | undefined): ArticleBlock[] {
  const mapped: ArticleBlock[] = []

  for (const block of blocks ?? []) {
    if (block._type === 'block') {
      const text = textFromBlock(block)
      if (!text) continue
      mapped.push(block.style === 'h2' ? { type: 'h2', text, toc: text.replace(/^\d+\.\s*/, '') } : { type: 'p', text })
      continue
    }

    if (block._type === 'image') {
      const src = imageUrl(block, 1440)
      if (src) mapped.push({ type: 'image', src, alt: block.alt ?? '', caption: block.caption, note: block.note })
      continue
    }

    if (block._type === 'callout' && block.text) {
      mapped.push({ type: 'note', label: block.label || 'Note', text: block.text })
      continue
    }

    if (block._type === 'definitionList' && block.items?.length) {
      mapped.push({ type: 'deflist', items: block.items.map((item) => ({ term: item.term ?? '', def: item.definition ?? '' })) })
    }
  }

  return mapped
}

function toFilters(post: CmsPost): FilterKey[] {
  const categoryKeys: FilterKey[] = (post.categories ?? [])
    .flatMap((category) => (category.filterKey ? [category.filterKey] : []))

  return Array.from(new Set<FilterKey>(post.isMostLoved ? ['most-loved', ...categoryKeys] : categoryKeys))
}

function toCta(value: CmsSidebarCta | undefined): ArticleCta | undefined {
  const image = imageUrl(value?.image?.mainImage, 800)
  if (!value?.title || !value.label || !image) return undefined

  return { title: value.title, label: value.label, image, background: value.background, to: value.to }
}

export function toCmsCard(post: CmsPost): Article {
  const image = imageUrl(post.heroImage?.mainImage, 1200) ?? ''
  const category = post.contentType || post.categories?.[0]?.title || 'Guide'

  return {
    category,
    title: post.title ?? 'Untitled guide',
    cta: 'view the guide',
    image,
    alt: post.heroImage?.alt ?? '',
    responsiveImage: post.heroImage,
    to: post.slug ? `/guides/${post.slug}` : undefined,
    filters: toFilters(post),
  }
}

export function toArticleDoc(post: CmsPost): ArticleDoc | null {
  const hero = imageUrl(post.heroImage?.mainImage, 1800)
  if (!post.slug || !post.title || !post.excerpt || !hero) return null

  const related = (post.relatedPosts ?? []).map(toCmsCard).filter((card) => Boolean(card.image))

  return {
    slug: post.slug,
    category: post.contentType || post.categories?.[0]?.title || 'Guide',
    badge: post.isMostLoved ? 'most loved' : undefined,
    title: post.title,
    subtitle: post.excerpt,
    readTime: '',
    hero,
    heroImage: post.heroImage,
    categories: (post.categories ?? []).map((category) => category.title).filter(Boolean) as string[],
    keywordTags: post.keywordTags ?? [],
    cta: toCta(post.sidebarCta),
    intro: toBlocks(post.intro),
    body: toBlocks(post.body),
    related: related.length ? related : undefined,
  }
}

export function toCmsCards(posts: CmsPost[]): Article[] {
  return posts.map(toCmsCard).filter((card) => Boolean(card.image && card.to))
}

function toTopGuideBadge(post: CmsPost): Guide['badge'] | undefined {
  if (post.topGuidesBadge === 'featured') return 'Featured'
  if (post.topGuidesBadge === 'mostLoved' || post.isMostLoved) return 'most loved'
  return undefined
}

function toTopGuide(post: CmsPost): Guide | null {
  const feature = imageUrl(post.heroImage?.mainImage, 1200)
  if (!post.slug || !post.title || !post.excerpt || !feature) return null

  return {
    slug: post.slug,
    category: post.contentType || post.categories?.[0]?.title || 'Guide',
    badge: toTopGuideBadge(post),
    title: post.title,
    excerpt: post.excerpt,
    cardCta: 'view the guide',
    feature,
    guideFeature: imageUrl(post.bigFeatureImage?.mainImage, 1800),
    tone: post.topGuidesTextTone === 'dark' ? 'dark' : 'light',
    imagePosition: post.bigFeatureImage?.focalPoint ?? post.heroImage?.focalPoint ?? 'center center',
  }
}

export function toTopGuideRows(selections: CmsTopGuidesSelection[] | undefined): Guide[] {
  return (selections ?? []).flatMap((selection) => (selection.post ? [toTopGuide(selection.post)].filter((guide): guide is Guide => Boolean(guide)) : []))
}
