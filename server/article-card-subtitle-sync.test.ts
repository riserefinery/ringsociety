import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '../src/components/GuideCard'
import type { ArticleDoc, Article as ResourceArticle } from '../src/lib/content'
import type { CmsPost } from '../src/sanity/types'

// Render landing pages after their CMS-card state has resolved, without any network.
const fixtureState = vi.hoisted(() => ({
  homeCards: null as Card[] | null,
  resourceCards: null as ResourceArticle[] | null,
  articles: {} as Record<string, ArticleDoc>,
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useState: ((initial: unknown) => {
      if (fixtureState.homeCards !== null && Array.isArray(initial) && initial.length === 0) {
        return [fixtureState.homeCards, () => {}]
      }
      if (fixtureState.resourceCards !== null && Array.isArray(initial) && initial[0] && typeof initial[0] === 'object' && 'filters' in initial[0]) {
        return [fixtureState.resourceCards, () => {}]
      }
      return actual.useState(initial)
    }) as typeof actual.useState,
  }
})

vi.mock('../src/sanity/image', () => ({
  imageUrl: (image: unknown) => image ? '/fixture-cms-image.jpg' : undefined,
}))

vi.mock('../src/sanity/queries', () => ({
  getCmsArticleCards: async () => [],
  getCmsArticle: async () => null,
  getCmsPage: async () => null,
  getCachedCmsArticle: (slug: string | undefined) => slug ? fixtureState.articles[slug] ?? null : null,
  prefetchCmsArticle: () => {},
}))

import GuideCard from '../src/components/GuideCard'
import GuideFeature from '../src/components/GuideFeature'
import { IMAGES } from '../src/lib/assets'
import { getRelated, mergePublishedArticleCards } from '../src/lib/content'
import Article from '../src/pages/Article'
import Home from '../src/pages/Home'
import Resources from '../src/pages/Resources'
import { toArticleDoc, toCmsCards, toTopGuideRows } from '../src/sanity/mappers'

const slugs = [
  'how-to-buy-an-engagement-ring',
  'how-to-choose-a-jeweler',
  'engagement-ring-settings-and-styles',
  'natural-vs-lab-grown-diamonds',
  'engagement-ring-budgets',
  '4cs-of-diamonds',
]

const posts: CmsPost[] = slugs.map((slug, index) => ({
  _id: `post-${slug}`,
  slug,
  title: `Revised title ${index + 1}`,
  excerpt: `Revised subtitle ${index + 1}`,
  heroImage: { mainImage: { asset: { _ref: 'image-test-1200x800-jpg' } }, alt: 'CMS image' },
}))

function render(element: ReactElement, path = '/') {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, element))
}

function renderArticle(slug: string) {
  return render(
    createElement(Routes, null, createElement(Route, { path: '/guides/:slug', element: createElement(Article) })),
    `/guides/${slug}`,
  )
}

afterEach(() => {
  fixtureState.homeCards = null
  fixtureState.resourceCards = null
  fixtureState.articles = {}
})

describe('CMS article title and subtitle synchronization', () => {
  it('renders each matching CMS title and subtitle on the homepage without deriving links from changed titles', () => {
    fixtureState.homeCards = toCmsCards(posts)
    const html = render(createElement(Home))

    for (const post of posts) {
      expect(html).toMatch(new RegExp(`<h[123][^>]*>${post.title}</h[123]>`))
      expect(html).toMatch(new RegExp(`<p[^>]*>${post.excerpt}</p>`))
      expect(html).toContain(`href="/guides/${post.slug}"`)
      expect(html).not.toContain(`href="/guides/${post.title?.toLowerCase().replaceAll(' ', '-')}"`)
    }

    // The homepage hero still uses its established art instead of the CMS card image.
    expect(html).toContain(IMAGES.hero)
  })

  it('preserves the three editorial fallbacks and intentional line breaks when no CMS record exists', () => {
    fixtureState.homeCards = []
    const html = render(createElement(Home))

    expect(html).toContain('How to Choose A Jeweler:<br/>Our 10-Point Framework')
    expect(html).toContain('The Complete Guide to Engagement Ring Settings &amp; Styles')
    expect(html).toContain('Natural vs. Lab-Grown Diamonds:<br/>The Honest, Unbiased Comparison')
    expect(html).toContain('Before you walk into any jeweler, there are 10 things you should be evaluating')
    expect(html).toContain('A visual guide detailing every major ring setting')
    expect(html).toContain('A transparent guide tackling the biggest question being asked right now.')
  })

  it('keeps the fallback editorial bodies if matching cards lack excerpts, even with updated titles', () => {
    const missingExcerpts = [undefined, '', '   ']
    fixtureState.homeCards = toCmsCards(posts.slice(1, 4).map((post, index) => ({ ...post, excerpt: missingExcerpts[index] })))
    const html = render(createElement(Home))

    for (const post of posts.slice(1, 4)) expect(html).toContain(post.title)
    expect(html).toContain('Before you walk into any jeweler, there are 10 things you should be evaluating')
    expect(html).toContain('A visual guide detailing every major ring setting')
    expect(html).toContain('A transparent guide tackling the biggest question being asked right now.')
  })

  it('retains the original headings when the matched CMS title is empty', () => {
    fixtureState.homeCards = toCmsCards(posts.slice(1, 4).map((post) => ({ ...post, title: '' })))
    const html = render(createElement(Home))

    expect(html).toContain('How to Choose A Jeweler:<br/>Our 10-Point Framework')
    expect(html).toContain('The Complete Guide to Engagement Ring Settings &amp; Styles')
    expect(html).toContain('Natural vs. Lab-Grown Diamonds:<br/>The Honest, Unbiased Comparison')
    for (const post of posts.slice(1, 4)) expect(html).toContain(post.excerpt)
  })

  it('does not substitute copy from a different slug even if its old title matches', () => {
    fixtureState.homeCards = toCmsCards([{
      ...posts[1],
      slug: 'unrelated-guide',
      title: 'How to Choose A Jeweler: Our 10-Point Framework',
      excerpt: 'Wrong article subtitle',
    }])
    const html = render(createElement(Home))

    expect(html).toContain('How to Choose A Jeweler:<br/>Our 10-Point Framework')
    expect(html).toContain('Before you walk into any jeweler, there are 10 things you should be evaluating')
    expect(html).not.toContain('Wrong article subtitle')
    expect(html).toContain('href="/guides/how-to-choose-a-jeweler"')
  })

  it('propagates each CMS record to the article hero, Top Guides and resource card with its original slug', () => {
    const cards = toCmsCards(posts)
    const resources = mergePublishedArticleCards(cards)
    const topGuides = toTopGuideRows(posts.map((post) => ({ _key: post.slug!, post })))
    fixtureState.resourceCards = resources
    const resourcesHtml = render(createElement(Resources), '/all-resources')

    for (const post of posts) {
      const path = `/guides/${post.slug}`
      const doc = toArticleDoc(post)!
      const resource = resources.find((card) => card.to === path)!
      const topGuide = topGuides.find((guide) => guide.slug === post.slug)!
      fixtureState.articles[post.slug!] = doc

      expect(doc).toMatchObject({ slug: post.slug, title: post.title, subtitle: post.excerpt })
      const articleHtml = renderArticle(post.slug!)
      expect(articleHtml).toMatch(new RegExp(`<h1[^>]*>${post.title}</h1>`))
      expect(articleHtml).toContain(post.excerpt)

      const resourceHtml = render(createElement(GuideCard, { card: resource }))
      expect(resourceHtml).toContain(post.title)
      expect(resourceHtml).toContain(`<p class="body-copy text-[#111]">${post.excerpt}</p>`)
      expect(resourceHtml).toContain(`href="${path}"`)
      expect(resourcesHtml).toContain(`<p class="body-copy text-[#111]">${post.excerpt}</p>`)
      expect(resourcesHtml).toContain(`href="${path}"`)

      const topGuideHtml = render(createElement(GuideFeature, { guide: topGuide }))
      expect(topGuideHtml).toContain(post.title)
      expect(topGuideHtml).toContain(post.excerpt)
      expect(topGuideHtml).toContain(`href="${path}"`)
    }
  })

  it('renders the subtitle on related cards and leaves missing or blank excerpts visually unchanged', () => {
    const related = getRelated(toArticleDoc({ ...posts[0], relatedPosts: [posts[1]] })!)[0]
    const html = render(createElement(GuideCard, { card: related }))
    expect(html).toContain(`<p class="body-copy text-[#111]">${posts[1].excerpt}</p>`)
    expect(html.indexOf(posts[1].title!)).toBeLessThan(html.indexOf(posts[1].excerpt!))
    expect(html.indexOf(posts[1].excerpt!)).toBeLessThan(html.lastIndexOf('view the guide'))
    expect(html).toContain(`href="/guides/${posts[1].slug}"`)

    const fallback: Card = { category: 'Guide', title: 'Legacy card', cta: 'Read more', image: '/legacy.jpg', alt: 'Legacy image' }
    const legacyHtml = render(createElement(GuideCard, { card: fallback }))
    expect(render(createElement(GuideCard, { card: { ...fallback, excerpt: '' } }))).toBe(legacyHtml)
    expect(render(createElement(GuideCard, { card: { ...fallback, excerpt: '   ' } }))).toBe(legacyHtml)
    expect(legacyHtml).not.toContain('body-copy')
    expect(legacyHtml).toContain('Legacy card')
    expect(legacyHtml).toContain('Read more')
  })
})
