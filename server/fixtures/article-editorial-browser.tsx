import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router'
import Article from '../../src/pages/Article'
import type { ArticleDoc } from '../../src/lib/content'
import { seedCmsArticle } from '../../src/sanity/queries'
import '../../src/index.css'

// Intentionally include a stale mobile override and caption on the editorial
// image: the editorial contract must use one source and show no image text.
const doc: ArticleDoc = {
  slug: 'editorial-fixture', category: 'Guide', title: 'Fixture guide', subtitle: 'Fixture excerpt',
  readTime: '1 minute read', hero: '/__images/hero.webp', categories: [], keywordTags: [],
  intro: [{ type: 'p', text: 'Fixture introduction' }],
  body: [
    { type: 'image', src: '/__images/editorial.webp', mobileSrc: '/__images/editorial-mobile-must-not-load.webp', alt: 'Editorial portrait', displayStyle: 'editorial', caption: 'Editorial caption must not appear', note: 'Editorial note must not appear' },
    { type: 'h2', text: 'First heading', toc: 'First heading' },
    { type: 'p', text: 'Existing paragraph' },
    { type: 'image', src: '/__images/diagram-desktop.webp', mobileSrc: '/__images/diagram-mobile.webp', alt: 'Existing diagram', caption: 'Existing diagram caption', note: 'Existing diagram note' },
    { type: 'p', text: 'More text' },
    { type: 'h2', text: 'Second heading', toc: 'Second heading' },
  ],
  related: [], popularRelated: [],
}

seedCmsArticle(doc)
createRoot(document.getElementById('root')!).render(
  <MemoryRouter initialEntries={['/guides/editorial-fixture']}>
    <Routes><Route path="/guides/:slug" element={<Article />} /></Routes>
  </MemoryRouter>,
)
