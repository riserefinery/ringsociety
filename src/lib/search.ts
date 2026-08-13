/* ---------------------------------------------------------------
   Client-side search.
   Builds one flat, de-duplicated index over the whole catalogue
   (pillar guides, articles, the article docs) plus the browsable
   categories, and scores it against a query. No dependencies —
   a small, predictable scorer over titles, categories and tags.
----------------------------------------------------------------*/
import { pillarGuides, allArticles, articleDocs, FILTERS } from './content'

export type SearchGroup = 'Guides' | 'Articles' | 'Categories'

export type SearchEntry = {
  id: string
  group: SearchGroup
  title: string
  /** small line under the title in results (category label / descriptor) */
  meta: string
  image?: string
  to: string
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

function buildIndex(): SearchEntry[] {
  const byTitle = new Map<string, SearchEntry>()

  const add = (title: string, category: string, image: string | undefined, extraKeywords: string[]) => {
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
      to: routeForTitle(title),
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
    add(a.title, a.category, a.image, filterLabels)
  }
  // pillar guides contribute canonical slugs + excerpts
  for (const g of pillarGuides) add(g.title, g.category, g.feature, [])
  // rich article docs
  for (const d of articleDocs) add(d.title, d.category, d.hero, [...d.categories, ...d.keywordTags])

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

export function runSearch(query: string, limit = 24): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)
  return SEARCH_INDEX.map((e) => ({ e, s: scoreEntry(e, q, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.title.length - b.e.title.length)
    .slice(0, limit)
    .map((x) => x.e)
}

/** Popular fallbacks for the empty state — the most-loved guides. */
export function popularEntries(limit = 5): SearchEntry[] {
  return SEARCH_INDEX.filter((e) => e.haystack.includes('most-loved guides')).slice(0, limit)
}
