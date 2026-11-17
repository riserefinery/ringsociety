import type { Article, ArticleBlock, ArticleCta, ArticleDoc, ArticleTableCell, FilterKey, Guide } from '../lib/content'
import { imageUrl } from './image'
import type { CmsPortableBlock, CmsPost, CmsSidebarCta, CmsTopGuidesSelection } from './types'

function inlineFromBlock(block: CmsPortableBlock) {
  const links = new Map(
    (Array.isArray(block.markDefs) ? block.markDefs : [])
      .filter((definition) => definition && definition._key && definition._type === 'link' && typeof definition.href === 'string' && definition.href)
      .map((definition) => [definition._key as string, definition.href as string]),
  )

  return (Array.isArray(block.children) ? block.children : [])
    .filter((child) => child && typeof child === 'object')
    .map((child) => {
      const marks = Array.isArray(child.marks) ? child.marks : []
      return {
        text: typeof child.text === 'string' ? child.text : '',
        strong: marks.includes('strong') || marks.includes('b'),
        em: marks.includes('em') || marks.includes('i'),
        code: marks.includes('code'),
        href: marks.map((mark) => links.get(mark)).find(Boolean),
      }
    })
    .filter((child) => child.text)
}

function textFromInline(inline: ReturnType<typeof inlineFromBlock>): string {
  return inline.map((child) => child.text).join('').trim()
}

// HTML limits colSpan to 1000 and rowSpan to 65534. Ignore invalid values
// rather than letting a malformed CMS cell produce surprising browser layout.
function validSpan(value: unknown, max: number): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= max ? value : undefined
}

function tableCell(value: unknown): ArticleTableCell {
  const cell = value && typeof value === 'object' ? value as { isHeader?: unknown; colSpan?: unknown; rowSpan?: unknown; content?: unknown } : {}
  const content = Array.isArray(cell.content) ? cell.content : []
  const paragraphs = content.flatMap((paragraph) => {
    if (!paragraph || typeof paragraph !== 'object' || paragraph._type !== 'block') return []
    const inline = inlineFromBlock(paragraph as CmsPortableBlock)
    // Keep empty paragraphs as well as text-bearing paragraphs in their source order.
    return [{ text: inline.map((segment) => segment.text).join(''), inline }]
  })
  return {
    isHeader: cell.isHeader === true,
    colSpan: validSpan(cell.colSpan, 1000),
    rowSpan: validSpan(cell.rowSpan, 65534),
    paragraphs,
  }
}

function toBlocks(blocks: CmsPortableBlock[] | undefined): ArticleBlock[] {
  const mapped: ArticleBlock[] = []

  for (const block of blocks ?? []) {
    if (!block || typeof block !== 'object') continue
    if (block._type === 'block') {
      const inline = inlineFromBlock(block)
      const text = textFromInline(inline)
      if (!text) continue

      if (block.listItem) {
        const ordered = block.listItem === 'number'
        const last = mapped[mapped.length - 1]
        if (last?.type === 'list' && last.ordered === ordered) {
          last.items.push({ text, inline })
        } else {
          mapped.push({ type: 'list', ordered, items: [{ text, inline }] })
        }
        continue
      }

      if (block.style === 'h2') {
        mapped.push({ type: 'h2', text, inline, toc: text.replace(/^\d+\.\s*/, '') })
      } else if (block.style === 'h3') {
        mapped.push({ type: 'h3', text, inline })
      } else if (block.style === 'h4') {
        mapped.push({ type: 'h4', text, inline })
      } else if (block.style === 'blockquote') {
        mapped.push({ type: 'blockquote', text, inline })
      } else {
        mapped.push({ type: 'p', text, inline })
      }
      continue
    }

    if (block._type === 'articleTable') {
      const rows = (Array.isArray(block.rows) ? block.rows : []).map((row) => ({
        cells: row && Array.isArray(row.cells) ? row.cells.map(tableCell) : [],
      }))
      mapped.push({ type: 'table', rows })
      continue
    }

    if (block._type === 'image') {
      const src = imageUrl(block, 1440)
      const mobileSrc = imageUrl(block.mobileImage, 900)
      if (src) mapped.push({ type: 'image', src, mobileSrc, alt: block.alt ?? '', caption: block.caption, note: block.note, ...(block.displayStyle === 'editorial' ? { displayStyle: 'editorial' } : {}) })
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
    excerpt: post.excerpt,
    cta: 'view the guide',
    image,
    alt: post.heroImage?.alt ?? '',
    responsiveImage: post.heroImage,
    badge: post.articleLabel?.name,
    to: post.slug ? `/guides/${post.slug}` : undefined,
    filters: toFilters(post),
  }
}

export function toArticleDoc(post: CmsPost): ArticleDoc | null {
  const hero = imageUrl(post.heroImage?.mainImage, 1800)
  if (!post.slug || !post.title || !post.excerpt || !hero) return null

  const shareImage = imageUrl(post.seo?.openGraphImage ?? post.heroImage?.mainImage, 1200) ?? hero
  const canonicalPath = post.seo?.canonicalPath?.startsWith('/') ? post.seo.canonicalPath : `/guides/${post.slug}`

  const related = (post.relatedPosts ?? [])
    .map(toCmsCard)
    .filter((card) => Boolean(card.image && card.to && card.to !== `/guides/${post.slug}`))

  return {
    slug: post.slug,
    category: post.contentType || post.categories?.[0]?.title || 'Guide',
    badge: post.articleLabel?.name ?? (post.isMostLoved ? 'most loved' : undefined),
    title: post.title,
    subtitle: post.excerpt,
    readTime: '',
    hero,
    heroImage: post.heroImage,
    shareTitle: post.seo?.title ?? post.title,
    shareDescription: post.seo?.description ?? post.excerpt,
    shareImage,
    shareImageAlt: post.heroImage?.alt ?? post.title,
    canonicalPath,
    categories: (post.categories ?? []).map((category) => category.title).filter(Boolean) as string[],
    keywordTags: post.keywordTags ?? [],
    cta: toCta(post.sidebarCta),
    intro: toBlocks(post.intro),
    body: toBlocks(post.body),
    noIndex: post.seo?.noIndex !== false,
    articleRelatedGuides: (post.articleRelatedGuides ?? [])
      .filter((guide) => Boolean(guide.title && guide.url))
      .map((guide) => ({ title: guide.title as string, url: guide.url as string })),
    sources: (post.sources ?? [])
      .filter((source) => Boolean(source.citation && source.url))
      .map((source) => ({ citation: source.citation as string, url: source.url as string })),
    related: related.length ? related : undefined,
  }
}

export function toCmsCards(posts: CmsPost[]): Article[] {
  return posts.map(toCmsCard).filter((card) => Boolean(card.image && card.to))
}

function toTopGuideBadge(post: CmsPost): Guide['badge'] | undefined {
  if (post.articleLabel?.name) return post.articleLabel.name
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

export function mergeTopGuideRows(selections: CmsTopGuidesSelection[] | undefined, fallbackRows: Guide[]): Guide[] {
  if (!selections?.length) return fallbackRows

  const fallbackBySlug = new Map(fallbackRows.map((guide) => [guide.slug, guide]))
  return selections.flatMap((selection) => {
    const publishedGuide = selection.post ? toTopGuide(selection.post) : null
    if (publishedGuide) return [publishedGuide]

    const fallbackSlug = selection.postId?.replace(/^post-/, '')
    const fallbackGuide = fallbackSlug ? fallbackBySlug.get(fallbackSlug) : undefined
    return fallbackGuide ? [fallbackGuide] : []
  })
}
