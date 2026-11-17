/* ---------------------------------------------------------------
   Client-side search.
   Builds one flat, de-duplicated index over the whole catalogue
   (pillar guides, articles, the article docs) plus the browsable
   categories, overlays published CMS titles, and scores queries
   predictably over titles, categories and tags.
----------------------------------------------------------------*/
import { useEffect, useSyncExternalStore } from 'react'
import { sanityClient } from '../sanity/client'
import { pillarGuides, allArticles, articleDocs, articlePathForTitle, FILTERS } from './content'

export type SearchGroup = 'Guides' | 'Articles' | 'Categories'

export type SearchEntry = {
  id: string
  group: SearchGroup
  title: string
  /** small line under the title in results (category label / descriptor) */
  meta: string
  image?: string
  to: string
  /** Catalogue path used to match CMS records; `to` remains the established link. */
  canonicalPath?: string
  /** lowercased strings the query is matched against (title, category, tags) */
  haystack: string[]
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Canonical route for an article title, preferring a real pillar-guide/doc slug. */
function routeForTitle(title: string): string {
  const norm = title.trim().toLowerCase()
  const guide = pillarGuides.find((g) => g.title.trim().toLowerCase() === norm)
  if (guide) return `/guides/${guide.slug}`
  const doc = articleDocs.find((d) => d.title.trim().toLowerCase() === norm)
  if (doc) return `/guides/${doc.slug}`
  return `/guides/${slugify(title)}`
}

/** Keyword tags authored on an article doc, matched onto a title where present. */
function keywordsForTitle(title: string): string[] {
  const norm = title.trim().toLowerCase()
  const doc = articleDocs.find((d) => d.title.trim().toLowerCase() === norm)
  return doc ? doc.keywordTags : []
}

// These six refreshed guides have verified current catalogue paths. Keep every
// other result's established destination, even when it differs from that path.
const REFRESHED_ARTICLE_PATHS = new Set([
  '/guides/engagement-ring-settings-and-styles',
  '/guides/how-to-choose-a-jeweler',
  '/guides/engagement-rings-with-hidden-halos',
  '/guides/natural-vs-lab-grown-diamonds',
  '/guides/which-diamond-shape-looks-biggest',
  '/guides/ultimate-guide-to-diamond-clarity',
])

function buildIndex(): SearchEntry[] {
  const byTitle = new Map<string, SearchEntry>()

  const add = (title: string, category: string, image: string | undefined, extraKeywords: string[], canonicalPath: string) => {
    const key = title.trim().toLowerCase()
    const group: SearchGroup = category === 'Guide' ? 'Guides' : 'Articles'
    const keywords = [...extraKeywords, ...keywordsForTitle(title)]
    const existing = byTitle.get(key)
    if (existing) {
      // enrich an already-seen title (e.g. article that is also a pillar guide)
      if (!existing.image && image) existing.image = image
      existing.haystack = Array.from(new Set([...existing.haystack, ...keywords.map((k) => k.toLowerCase())]))
      return
    }
    byTitle.set(key, {
      id: slugify(title),
      group,
      title,
      meta: category,
      image,
      to: REFRESHED_ARTICLE_PATHS.has(canonicalPath) ? canonicalPath : routeForTitle(title),
      canonicalPath,
      haystack: Array.from(
        new Set([title, category, ...keywords].map((s) => s.toLowerCase())),
      ),
    })
  }

  // articles carry images + filter tags
  for (const a of allArticles) {
    const filterLabels = a.filters
      .map((f) => FILTERS.find((x) => x.key === f)?.label as string | undefined)
      .filter((x): x is string => !!x)
    add(a.title, a.category, a.image, filterLabels, a.to ?? articlePathForTitle(a.title))
  }
  // pillar guides contribute canonical slugs + excerpts
  for (const g of pillarGuides) add(g.title, g.category, g.feature, [], `/guides/${g.slug}`)
  // rich article docs
  for (const d of articleDocs) add(d.title, d.category, d.hero, [...d.categories, ...d.keywordTags], `/guides/${d.slug}`)

  const entries = Array.from(byTitle.values())

  // browsable categories (jump to a pre-filtered All Resources)
  for (const f of FILTERS) {
    if (f.key === 'all') continue
    entries.push({
      id: `category-${f.key}`,
      group: 'Categories',
      title: f.label,
      meta: 'Browse category',
      to: `/all-resources?filter=${f.key}`,
      haystack: [f.label.toLowerCase(), f.key],
    })
  }

  return entries
}

export const SEARCH_INDEX: SearchEntry[] = buildIndex()

// Keep route identity, tags, images, ordering and the old title's search terms.
// CMS titles are a display/search overlay, never a source for route construction.
export function withNavigationTitles(index: SearchEntry[], titles: ReadonlyMap<string, string>): SearchEntry[] {
  return index.map((entry) => {
    const title = entry.group === 'Categories' ? undefined : titles.get(entry.canonicalPath ?? entry.to)?.trim()
    if (!title || title === entry.title) return entry
    return { ...entry, title, haystack: Array.from(new Set([...entry.haystack, title.toLowerCase()])) }
  })
}

/** Read only valid, published title/slug pairs; the newest valid duplicate wins. */
export function navigationTitlesFromPosts(posts: unknown): ReadonlyMap<string, string> {
  const titles = new Map<string, string>()
  if (!Array.isArray(posts)) return titles
  for (const post of posts) {
    if (!post || typeof post !== 'object') continue
    const { slug, title } = post as { slug?: unknown; title?: unknown }
    if (typeof slug !== 'string' || !slug || /[/?#\s]/.test(slug) || slug === '.' || slug === '..') continue
    if (typeof title !== 'string' || !title.trim()) continue
    const path = `/guides/${slug}`
    if (!titles.has(path)) titles.set(path, title.trim())
  }
  return titles
}

const EMPTY_TITLES: ReadonlyMap<string, string> = new Map()
const TITLE_CACHE_MS = 5 * 60 * 1000
const TITLE_RETRY_MS = 30 * 1000
let navigationTitles = EMPTY_TITLES
let titlesLoadedAt: number | null = null
let titlesRetryAt = 0
let titleRequest: Promise<void> | null = null
const titleListeners = new Set<() => void>()

function subscribeToNavigationTitles(listener: () => void) {
  titleListeners.add(listener)
  return () => { titleListeners.delete(listener) }
}

export function getNavigationTitles(): ReadonlyMap<string, string> {
  return navigationTitles
}

/** Share a small query across components; never start a request during SSR. */
export function refreshNavigationTitles(): Promise<void> {
  if (typeof window === 'undefined' || !sanityClient) return Promise.resolve()
  const client = sanityClient
  if (titleRequest) return titleRequest
  const now = Date.now()
  if (now < titlesRetryAt || (titlesLoadedAt !== null && now - titlesLoadedAt < TITLE_CACHE_MS)) return Promise.resolve()

  titleRequest = Promise.resolve()
    .then(() => client.fetch<unknown>(
      `*[_type == "post" && defined(slug.current)] | order(_updatedAt desc){title, "slug": slug.current}`,
    ))
    .then((posts) => {
      if (!Array.isArray(posts)) throw new Error('Invalid CMS navigation titles')
      const next = navigationTitlesFromPosts(posts)
      titlesLoadedAt = Date.now()
      titlesRetryAt = 0
      const unchanged = next.size === navigationTitles.size &&
        Array.from(next).every(([path, title]) => navigationTitles.get(path) === title)
      if (!unchanged) {
        navigationTitles = next
        titleListeners.forEach((listener) => listener())
      }
    })
    .catch(() => {
      // Keep the last good snapshot, or the local fallback, and allow a later retry.
      titlesRetryAt = Date.now() + TITLE_RETRY_MS
    })
    .finally(() => { titleRequest = null })
  return titleRequest
}

/** Initial SSR/hydration uses local fallbacks; the browser refreshes after mount. */
export function useNavigationTitles(enabled = true): ReadonlyMap<string, string> {
  const titles = useSyncExternalStore(
    subscribeToNavigationTitles,
    getNavigationTitles,
    () => EMPTY_TITLES,
  )
  useEffect(() => {
    if (enabled) void refreshNavigationTitles()
  }, [enabled])
  return titles
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function scoreEntry(entry: SearchEntry, q: string, terms: string[]): number {
  const title = entry.title.toLowerCase()
  let s = 0
  if (title === q) s = 1000
  else if (title.startsWith(q)) s = 720
  else if (new RegExp(`\\b${escapeRe(q)}`).test(title)) s = 540
  else if (title.includes(q)) s = 340

  // direct hit on a category / keyword tag
  for (const h of entry.haystack) {
    if (h === title) continue
    if (h.startsWith(q)) s = Math.max(s, 300)
    else if (h.includes(q)) s = Math.max(s, 180)
  }

  // multi-term: every term must appear somewhere in the haystack
  if (terms.length > 1) {
    const all = terms.every((t) => entry.haystack.some((h) => h.includes(t)))
    if (all) s = Math.max(s, 140 + terms.length * 15)
  }

  return s
}

export function runSearch(query: string, limit = 24, index = SEARCH_INDEX): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)
  return index.map((e) => ({ e, s: scoreEntry(e, q, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.title.length - b.e.title.length)
    .slice(0, limit)
    .map((x) => x.e)
}

/** Popular fallbacks for the empty state — the most-loved guides. */
export function popularEntries(limit = 5, index = SEARCH_INDEX): SearchEntry[] {
  return index.filter((e) => e.haystack.includes('most-loved guides')).slice(0, limit)
}
