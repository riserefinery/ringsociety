import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

const cms = vi.hoisted(() => ({ fetch: vi.fn() }))
vi.mock('../src/sanity/client', () => ({ sanityClient: { fetch: cms.fetch } }))

import Footer from '../src/components/Footer'
import SearchOverlay from '../src/components/SearchOverlay'
import {
  SEARCH_INDEX,
  getNavigationTitles,
  navigationTitlesFromPosts,
  popularEntries,
  refreshNavigationTitles,
  runSearch,
  withNavigationTitles,
} from '../src/lib/search'

const updates = [
  { slug: 'how-to-choose-a-jeweler', title: 'How to Choose a Jeweler: Our 10-Point Framework', term: 'choose a jeweler' },
  { slug: 'natural-vs-lab-grown-diamonds', title: 'Natural vs. Lab-Grown Diamonds: An Honest Side-by-Side Comparison', term: 'honest side-by-side' },
  { slug: 'ultimate-guide-to-diamond-clarity', title: 'The Diamond Clarity Guide: How to Choose the Right Grade for Your Ring and Budget', term: 'right grade' },
]

// Explicit local catalogue titles and current published paths: no private article
// packages, live CMS access, or title-derived URLs are needed by these tests.
const refreshedGuides = [
  { title: 'The Complete Guide to Engagement Ring Settings & Styles', path: '/guides/engagement-ring-settings-and-styles' },
  { title: 'How to Choose A Jeweler: Our 10-Point Framework', path: '/guides/how-to-choose-a-jeweler' },
  { title: 'Engagement Rings with Hidden Halos: The Subtle Sparkle Trend', path: '/guides/engagement-rings-with-hidden-halos' },
  { title: 'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison', path: '/guides/natural-vs-lab-grown-diamonds' },
  { title: 'Which Diamond Shape Looks the Biggest?', path: '/guides/which-diamond-shape-looks-biggest' },
  { title: 'The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget', path: '/guides/ultimate-guide-to-diamond-clarity' },
]

const render = (child: React.ReactElement) => renderToStaticMarkup(createElement(MemoryRouter, null, child))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  cms.fetch.mockReset()
})

describe('navigation CMS title synchronization', () => {
  it.each(refreshedGuides)('links the refreshed "$title" search result to its current route before and after title updates', ({ title, path }) => {
    const originals = SEARCH_INDEX.filter((entry) => entry.title === title)
    expect(originals).toHaveLength(1)
    const original = originals[0]
    expect(original.canonicalPath).toBe(path)
    expect(original.to).toBe(path)
    expect(runSearch(title)).toContain(original)

    const slug = path.slice('/guides/'.length)
    const firstTitle = `A brand new editor title for ${slug}`
    const secondTitle = `Another revised title for ${slug}`
    const firstIndex = withNavigationTitles(SEARCH_INDEX, navigationTitlesFromPosts([{ slug, title: firstTitle }]))
    const updated = firstIndex.find((entry) => entry.id === original.id)!
    expect(updated.title).toBe(firstTitle)
    expect(updated.canonicalPath).toBe(path)
    expect(updated.to).toBe(path)
    expect(runSearch(firstTitle, 24, firstIndex)).toContain(updated)
    expect(runSearch(title, 24, firstIndex)).toContain(updated)

    const secondIndex = withNavigationTitles(firstIndex, navigationTitlesFromPosts([{ slug, title: secondTitle }]))
    const revised = secondIndex.find((entry) => entry.id === original.id)!
    expect(revised.title).toBe(secondTitle)
    expect(revised.canonicalPath).toBe(path)
    expect(revised.to).toBe(path)
    expect(runSearch(secondTitle, 24, secondIndex)).toContain(revised)
    expect(secondIndex.map((entry) => entry.id)).toEqual(SEARCH_INDEX.map((entry) => entry.id))
  })

  it('preserves the complete established search order and all unrelated result destinations', () => {
    expect(SEARCH_INDEX.map((entry) => entry.to)).toEqual([
      '/guides/how-to-buy-an-engagement-ring',
      '/guides/how-to-choose-a-jeweler',
      '/guides/the-most-popular-and-trending-ring-styles-and-diamond-shapes-in-2026',
      '/guides/engagement-rings-with-hidden-halos',
      '/guides/engagement-ring-budgets',
      '/guides/engagement-ring-settings-and-styles',
      '/guides/how-to-find-her-ring-size-without-ruining-the-surprise',
      '/guides/which-diamond-shape-looks-biggest',
      '/guides/the-4cs-of-diamonds-explained-in-plain-english',
      '/guides/go-big-or-shop-small-big-box-vs-local-vs-online-jewelers',
      '/guides/natural-vs-lab-grown-diamonds',
      '/guides/what-drives-diamond-pricing',
      '/guides/ultimate-guide-to-diamond-clarity',
      '/guides/the-ideal-diamond-cut-how-to-choose-the-right-diamond-for-your-ring-setting-and-budget',
      '/guides/big-box-vs-local-vs-online-jewelers',
      '/guides/the-definitive-engagement-ring-buying-guide-2026',
      '/all-resources?filter=most-loved',
      '/all-resources?filter=jeweler',
      '/all-resources?filter=trends',
      '/all-resources?filter=perspectives',
      '/all-resources?filter=diamonds',
    ])
  })

  it('updates search titles by stable canonical path while retaining old terms, tags, routes, categories and order', () => {
    const titles = navigationTitlesFromPosts(updates)
    const index = withNavigationTitles(SEARCH_INDEX, titles)
    expect(index).toHaveLength(SEARCH_INDEX.length)
    expect(index.map((entry) => [entry.id, entry.to, entry.group, entry.meta, entry.image, entry.canonicalPath]))
      .toEqual(SEARCH_INDEX.map((entry) => [entry.id, entry.to, entry.group, entry.meta, entry.image, entry.canonicalPath]))

    for (const { slug, title, term } of updates) {
      const path = `/guides/${slug}`
      const original = SEARCH_INDEX.find((entry) => entry.canonicalPath === path)!
      const updated = index.find((entry) => entry.canonicalPath === path)!
      expect(updated.title).toBe(title)
      expect(updated.to).toBe(original.to)
      expect(updated.haystack).toEqual(expect.arrayContaining(original.haystack))
      expect(runSearch(term, 24, index)).toContain(updated)
      expect(runSearch(title, 24, index)).toContain(updated)
      expect(original.title).not.toBe(title)
    }
    expect(runSearch('unbiased', 24, index).some((entry) => entry.canonicalPath === '/guides/natural-vs-lab-grown-diamonds')).toBe(true)
    expect(runSearch('finding a jeweler', 24, index).some((entry) => entry.canonicalPath === '/guides/how-to-choose-a-jeweler')).toBe(true)
    expect(runSearch('budget guide', 24, index).some((entry) => entry.canonicalPath === '/guides/the-definitive-engagement-ring-buying-guide-2026')).toBe(true)
    expect(popularEntries(5, index).map((entry) => entry.id)).toEqual(popularEntries(5).map((entry) => entry.id))
    expect(index.find((entry) => entry.group === 'Categories' && entry.title === 'Diamonds'))
      .toBe(SEARCH_INDEX.find((entry) => entry.group === 'Categories' && entry.title === 'Diamonds'))
  })

  it('uses the catalogue canonical path even for a legacy result URL, without changing the URL', () => {
    const original = SEARCH_INDEX.find((entry) => entry.canonicalPath === '/guides/4cs-of-diamonds')!
    const index = withNavigationTitles(SEARCH_INDEX, navigationTitlesFromPosts([
      { slug: '4cs-of-diamonds', title: 'A Revised Four Cs Guide' },
    ]))
    const updated = index.find((entry) => entry.id === original.id)!
    expect(updated.title).toBe('A Revised Four Cs Guide')
    expect(updated.to).toBe(original.to)
    expect(runSearch('revised four cs', 24, index)).toContain(updated)
  })

  it('rejects invalid or blank records, matches only the exact path and uses the newest valid duplicate', () => {
    const original = SEARCH_INDEX.find((entry) => entry.canonicalPath === '/guides/how-to-choose-a-jeweler')!
    const titles = navigationTitlesFromPosts([
      null, {}, { slug: 'how-to-choose-a-jeweler', title: '   ' },
      { slug: 'another-guide', title: original.title },
      { slug: 'bad/path', title: 'Bad path' },
      { slug: 'bad?query', title: 'Bad query' },
      { slug: 'natural-vs-lab-grown-diamonds', title: ' First valid ' },
      { slug: 'natural-vs-lab-grown-diamonds', title: 'Older title' },
    ])
    const index = withNavigationTitles(SEARCH_INDEX, titles)
    expect(index.find((entry) => entry.id === original.id)).toBe(original)
    expect(titles.get('/guides/natural-vs-lab-grown-diamonds')).toBe('First valid')
    expect(titles.has('/guides/bad/path')).toBe(false)
    expect(navigationTitlesFromPosts(null).size).toBe(0)
    expect(withNavigationTitles(SEARCH_INDEX, new Map()).map((entry) => entry.title)).toEqual(SEARCH_INDEX.map((entry) => entry.title))
    expect(runSearch('unbiased')).toEqual(runSearch('unbiased', 24, withNavigationTitles(SEARCH_INDEX, new Map())))
  })

  it('renders the accessible local footer and search fallbacks on the server with no CMS network effects', async () => {
    vi.stubGlobal('window', undefined)
    const html = render(createElement(Footer))
    const search = render(createElement(SearchOverlay, { open: true, onClose: () => {} }))
    await refreshNavigationTitles()
    expect(cms.fetch).not.toHaveBeenCalled()
    expect(html).toContain('How to Choose A Jeweler: Our 10-Point Framework')
    expect(html).toContain('Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison')
    expect(html).toContain('href="/guides/how-to-choose-a-jeweler"')
    expect(html).toContain('href="/guides/natural-vs-lab-grown-diamonds"')
    expect(html.indexOf('How to Choose A Jeweler')).toBeLessThan(html.indexOf('Natural vs. Lab-Grown Diamonds'))
    expect(search).toContain('role="dialog"')
    expect(search).toContain('aria-modal="true"')
    expect(search).toContain('aria-label="Close search"')
    expect(search).toContain('How to Choose A Jeweler: Our 10-Point Framework')
  })

  it('shares one focused in-flight request, caches successes, and retries failures without losing the last good titles', async () => {
    vi.stubGlobal('window', {})
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    let resolveRequest!: (posts: unknown) => void
    cms.fetch.mockImplementationOnce(() => new Promise((resolve) => { resolveRequest = resolve }))
    const first = refreshNavigationTitles()
    const concurrent = refreshNavigationTitles()
    expect(concurrent).toBe(first)
    await Promise.resolve()
    expect(cms.fetch).toHaveBeenCalledTimes(1)
    const query = cms.fetch.mock.calls[0][0] as string
    expect(query).toContain('"slug": slug.current')
    expect(query).toContain('title')
    expect(query).not.toContain('heroImage')
    resolveRequest(updates)
    await first
    expect(getNavigationTitles().get('/guides/how-to-choose-a-jeweler')).toBe(updates[0].title)
    // An SSR render must not depend on process-global browser state.
    expect(render(createElement(Footer))).toContain('How to Choose A Jeweler: Our 10-Point Framework')
    await refreshNavigationTitles()
    expect(cms.fetch).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5 * 60 * 1000)
    cms.fetch.mockRejectedValueOnce(new Error('CMS unavailable'))
    await refreshNavigationTitles()
    expect(cms.fetch).toHaveBeenCalledTimes(2)
    expect(getNavigationTitles().get('/guides/how-to-choose-a-jeweler')).toBe(updates[0].title)
    await refreshNavigationTitles()
    expect(cms.fetch).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(30 * 1000)
    cms.fetch.mockResolvedValueOnce([{ slug: updates[0].slug, title: 'A later editor change' }])
    await refreshNavigationTitles()
    expect(cms.fetch).toHaveBeenCalledTimes(3)
    expect(getNavigationTitles().get('/guides/how-to-choose-a-jeweler')).toBe('A later editor change')
    expect(getNavigationTitles().has('/guides/natural-vs-lab-grown-diamonds')).toBe(false)
  })
})
