import React from 'react'
import { createRoot } from 'react-dom/client'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import Header from '../../src/components/Header'
import Article from '../../src/pages/Article'
import type { ArticleBlock, ArticleDoc, ArticleTableCell } from '../../src/lib/content'
import { seedCmsArticle } from '../../src/sanity/queries'
import '../../src/index.css'

// The article and header are production components, not stand-ins. Seed the
// same CMS cache used by real article navigations so the test is deterministic
// and never needs live content or images.
const cell = (text: string, isHeader = false, paragraphs = 1): ArticleTableCell => ({
  isHeader,
  paragraphs: Array.from({ length: paragraphs }, (_, i) => ({
    text: i ? `${text} detail ${i}` : text,
    inline: [{ text: i ? `${text} detail ${i}` : text }],
  })),
})
const table: ArticleBlock = {
  type: 'table',
  rows: [
    { cells: [cell('Fade pinned label', true, 4), cell('Column one', true, 4), cell('Column two', true, 4), cell('Column three', true, 4)] },
    { cells: [cell('Second label', true), cell('First value'), cell('Second value'), cell('Third value')] },
  ],
}
const paragraph = 'A carefully chosen ring begins with practical knowledge and clear comparisons. Readers can consider the details, understand their options, and make a thoughtful decision with confidence. '
const body: ArticleBlock[] = Array.from({ length: 8 }, (_, index) => [
  { type: 'h2' as const, text: `Fixture section ${index + 1}`, toc: `Fixture section ${index + 1}` },
  { type: 'p' as const, text: paragraph.repeat(4) },
  ...(index === 2 ? [table] : []),
  ...(index === 4 ? [{ type: 'image' as const, src: '/__fade_images/diagram.webp', alt: 'Fade fixture diagram' }] : []),
  { type: 'p' as const, text: paragraph.repeat(3) },
]).flat()
const doc: ArticleDoc = {
  slug: 'bottom-fade-fixture', category: 'Guide', title: 'Fade fixture guide', subtitle: 'A locally seeded guide for viewport tests.',
  readTime: '5 minute read', hero: '/__fade_images/hero.webp', categories: [], keywordTags: [],
  cta: { title: 'A fixture guide', label: 'View guide', image: '/__fade_images/cta.webp' },
  intro: [{ type: 'p', text: 'Fade fixture introduction' }], body,
  articleRelatedGuides: [{ title: 'Fixture related guide', url: '/guides/other' }],
  sources: Array.from({ length: 14 }, (_, i) => ({ citation: `Fixture source ${i + 1}: a deliberately long reference with useful detail.`, url: `https://example.invalid/source-${i + 1}` })),
  related: [], popularRelated: [],
}

seedCmsArticle(doc)
createRoot(document.getElementById('root')!).render(
  <MemoryRouter initialEntries={['/guides/bottom-fade-fixture']}>
    <div className="flex w-full flex-col items-center bg-white">
      <Header showHelloBar />
      <main className="w-full">
        <Routes>
          <Route path="/guides/:slug" element={<Article />} />
          <Route path="/" element={<div><h1>Fixture route exit</h1><Link to="/guides/bottom-fade-fixture">Return to guide</Link></div>} />
        </Routes>
      </main>
    </div>
  </MemoryRouter>,
)
