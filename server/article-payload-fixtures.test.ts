import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { CmsPortableBlock, CmsPost, CmsTableCell } from '../src/sanity/types'

// The normalized packages do not include the post envelope. Configure a harmless
// local project/dataset so the actual Sanity image URL builder can run offline.
vi.hoisted(() => {
  vi.stubEnv('VITE_SANITY_PROJECT_ID', 'realpayloadtest')
  vi.stubEnv('VITE_SANITY_DATASET', 'production')
})

import Root from '../src/app/Root'
import Article from '../src/pages/Article'
import { toArticleDoc } from '../src/sanity/mappers'
import { seedCmsArticle } from '../src/sanity/queries'

// Portable synthetic fixtures carry source-derived structural shapes only, not
// published copy, production guide slugs, or external package dependencies.
const cases = [
  { name: 'settings-styles', slug: 'compat-fixture-1', intro: 4, rawBody: 98, mappedBody: 96, headings: [7, 12, 2], images: 4, tables: 0, guides: 5, sources: 4 },
  { name: 'jeweler', slug: 'compat-fixture-2', intro: 3, rawBody: 91, mappedBody: 91, headings: [5, 13, 3], images: 2, tables: 0, guides: 5, sources: 0 },
  { name: 'hidden-halos', slug: 'compat-fixture-3', intro: 3, rawBody: 66, mappedBody: 62, headings: [8, 10, 0], images: 2, tables: 1, guides: 5, sources: 4 },
  { name: 'natural-lab', slug: 'compat-fixture-4', intro: 2, rawBody: 49, mappedBody: 48, headings: [6, 4, 0], images: 2, tables: 1, guides: 6, sources: 14 },
  { name: 'shape', slug: 'compat-fixture-5', intro: 3, rawBody: 65, mappedBody: 57, headings: [10, 0, 0], images: 2, tables: 4, guides: 6, sources: 3 },
  { name: 'clarity', slug: 'compat-fixture-6', intro: 3, rawBody: 84, mappedBody: 73, headings: [7, 20, 0], images: 2, tables: 1, guides: 8, sources: 8 },
] as const

type Payload = {
  title: string
  excerpt: string
  intro: CmsPortableBlock[]
  body: CmsPortableBlock[]
  articleRelatedGuides: { title: string; url: string }[]
  sources: { citation: string; url: string }[]
}
// Compact source-derived block order only: 2/3/4 = heading levels, p =
// paragraph, b/n = bullet/number, i = image, t = table, c = callout. Table
// dimensions and spans below also reflect the six real package structures.
const shapes: Record<string, string> = {
  'settings-styles': '2ppppipc2pppppppppp2i3ppppppp3pppppp3ppppp3pppppc2i3ppp3pppp3pppp34ppp4ppp2pibbb2pppp23ppp3p3pp3pp',
  jeweler: '4p4p4ppi2p3ppppp3pppp3pppppp2p3pppp3ppppp3pppppp3ppppp2p3pppppp3pppppp3ppippppp2pppp23p3p3p',
  'hidden-halos': '2pbbipp2ptpp2pi3pp3pppp3pppp2p3ppp3ppp2pbb2pbbb2pp23pp3pp3pp3pp3pp',
  'natural-lab': '2tp2pp23pppi3pppbbpipp3ppp3pppp2pppp2p2pppppppppp',
  shape: '2ptip2pppbbpp2pppbbpp2pppp2ptippp2ptp2ppnnnnp2pbbbbp2ptp2pppppppp',
  clarity: '2ppp3pbbbbbbbpp3p2ptpp2p3p3pi3p3pp3pip2pp3ppp2p3pp3p3ppp2p3p3p3p3pbbbbbbp23p3p3p3p3p',
}
const tableShapes: Record<string, [number, number][]> = {
  'settings-styles': [], jeweler: [], 'hidden-halos': [[4, 4]], 'natural-lab': [[8, 3]],
  shape: [[13, 3], [4, 4], [7, 3], [7, 3]], clarity: [[7, 3]],
}
function portableFixture(name: string): Payload {
  const spec = cases.find((entry) => entry.name === name)
  if (!spec) throw new Error(`Unknown fixture ${name}`)
  let imageIndex = 0
  let tableIndex = 0
  const reference = (label: string, dimensions: string) => `image-${createHash('sha1').update(label).digest('hex')}-${dimensions}-jpg`
  const makeBlock = (key: string, style = 'normal', listItem?: 'bullet' | 'number'): CmsPortableBlock => ({
    _type: 'block', _key: key, style, listItem,
    children: [
      { _type: 'span', text: `${key} plain ` },
      { _type: 'span', text: `${key} strong`, marks: ['strong'] },
      { _type: 'span', text: ` ${key} ` },
      { _type: 'span', text: `${key} link`, marks: ['link'] },
    ],
    markDefs: [{ _type: 'link', _key: 'link', href: `https://example.test/${key}` }],
  })
  const makeTable = (): CmsPortableBlock => {
    const index = tableIndex++
    const [rowCount, columns] = tableShapes[name][index]
    return {
      _type: 'articleTable', _key: `${name}-table-${index}`,
      rows: Array.from({ length: rowCount }, (_, row) => {
        const merged = name === 'shape' && index === 0 && [1, 5, 9].includes(row)
        return { cells: Array.from({ length: merged ? 1 : columns }, (_, column) => ({
          isHeader: row === 0 || merged,
          ...(merged ? { colSpan: 3 } : {}),
          content: [makeBlock(`${name}-table-${index}-row-${row}-cell-${column}`)],
        })) }
      }),
    }
  }
  const body = [...shapes[name]].map((kind, index): CmsPortableBlock => {
    const key = `${name}-body-${index}`
    if (kind === 'i') {
      const label = `${name}-image-${imageIndex++}`
      return { _type: 'image', _key: key, asset: { _ref: reference(`${label}-desktop`, '1600x1000') }, mobileImage: { asset: { _ref: reference(`${label}-mobile`, '1080x2200') } }, alt: `Synthetic alt for ${label}` }
    }
    if (kind === 't') return makeTable()
    if (kind === 'c') return { _type: 'callout', _key: key, text: `Synthetic callout ${key}` }
    return makeBlock(key, /[234]/.test(kind) ? `h${kind}` : 'normal', kind === 'b' ? 'bullet' : kind === 'n' ? 'number' : undefined)
  })
  return {
    title: `Synthetic title ${name}`, excerpt: `Synthetic excerpt ${name}`,
    intro: Array.from({ length: spec.intro }, (_, index) => makeBlock(`${name}-intro-${index}`)), body,
    articleRelatedGuides: Array.from({ length: spec.guides }, (_, index) => ({ title: `Synthetic guide ${name} ${index}`, url: `https://example.test/guide/${name}/${index}` })),
    sources: Array.from({ length: spec.sources }, (_, index) => ({ citation: `Synthetic citation ${name} ${index} end`, url: `https://example.test/source/${name}/${index}` })),
  }
}
const load = (name: string): Payload => portableFixture(name)
const text = (block: CmsPortableBlock) => (block.children ?? []).map((child) => child.text ?? '').join('')
const escape = (value: string) => renderToStaticMarkup(createElement('span', null, value)).replace(/^<span>|<\/span>$/g, '')
const visible = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
const matches = (html: string, pattern: RegExp) => [...html.matchAll(pattern)]
const count = (html: string, value: string) => html.split(value).length - 1
const paragraphs = (cell: CmsTableCell) => (cell.content ?? []).filter((p) => p._type === 'block')

function mapAndRender(payload: Payload, slug: string) {
  const firstImage = payload.body.find((block) => block._type === 'image')
  if (!firstImage?.asset) throw new Error(`Missing an image in ${slug}`)
  // Only the CMS envelope is added: the fixture payload fields pass through unchanged.
  const post: CmsPost = {
    _id: `post-${slug}`, slug, heroImage: { mainImage: { asset: firstImage.asset }, alt: 'Test hero' },
    ...payload,
  }
  const doc = toArticleDoc(post)
  if (!doc) throw new Error(`Could not map ${slug}`)
  seedCmsArticle(doc)
  const router = createMemoryRouter([
    { element: createElement(Root), children: [{ path: '/guides/:slug', element: createElement(Article) }] },
  ], { initialEntries: [`/guides/${slug}`] })
  try {
    const html = renderToString(createElement(RouterProvider, { router }))
    // Limit content checks to the rendered reading column, excluding the TOC,
    // shared navigation and recommended cards, which legitimately repeat text.
    const marker = '<div class="flex w-full flex-col gap-8 md:gap-12">'
    const start = html.indexOf(marker)
    const end = html.indexOf('<section aria-label="Article resources"', start)
    if (start < 0 || end < 0) throw new Error(`Missing rendered body/resources in ${slug}`)
    const resourceEnd = html.indexOf('</section>', end)
    if (resourceEnd < 0) throw new Error(`Missing end of resources in ${slug}`)
    return { doc, html, bodyHtml: html.slice(start, end), resourcesHtml: html.slice(end, resourceEnd + '</section>'.length) }
  } finally {
    router.dispose()
  }
}

function expectedBodyTypes(blocks: CmsPortableBlock[]) {
  const result: string[] = []
  let previousList: string | undefined
  for (const block of blocks) {
    if (block._type === 'block') {
      if (!text(block).trim()) continue
      if (block.listItem) {
        if (previousList !== block.listItem) result.push('list')
        previousList = block.listItem
        continue
      }
      result.push(['h2', 'h3', 'h4', 'blockquote'].includes(block.style ?? '') ? block.style! : 'p')
    } else if (block._type === 'articleTable') result.push('table')
    else if (block._type === 'image') result.push('image')
    else if (block._type === 'callout') result.push('note')
    else throw new Error(`Unexpected payload block type: ${block._type}`)
    previousList = undefined
  }
  return result
}

function linkSpans(blocks: CmsPortableBlock[]) {
  return blocks.flatMap((block) => {
    const definitions = new Map((block.markDefs ?? []).map((mark) => [mark._key, mark.href]))
    return (block.children ?? []).flatMap((child) => {
      const href = (child.marks ?? []).map((mark) => definitions.get(mark)).find(Boolean)
      return href && child.text ? [{ href: escape(href), text: escape(child.text) }] : []
    })
  })
}
function portableBlocksInOrder(blocks: CmsPortableBlock[]): CmsPortableBlock[] {
  return blocks.flatMap((block) => block._type === 'articleTable'
    ? (block.rows ?? []).flatMap((row) => (row.cells ?? []).flatMap(paragraphs))
    : block._type === 'block' ? [block] : [])
}
function anchors(html: string) {
  return matches(html, /<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)
    .map((match) => ({ href: match[1], text: visible(match[2]) }))
}
function assetPart(ref: string) {
  return ref.replace(/^image-/, '').replace(/-([^-]+)$/, '.$1')
}

describe('portable article payload shapes: mapping and SSR', () => {
  it('has the complete corpus with seven tables and fourteen image pairs', () => {
    const all = cases.map(({ name }) => load(name))
    expect(all.flatMap((payload) => payload.body).filter((block) => block._type === 'articleTable')).toHaveLength(7)
    expect(all.flatMap((payload) => payload.body).filter((block) => block._type === 'image' && block.asset?._ref && block.mobileImage?.asset?._ref)).toHaveLength(14)
  })

  it.each(cases)('maps and renders the complete $name article', (fixture) => {
    const payload = load(fixture.name)
    const { doc, html, bodyHtml, resourcesHtml } = mapAndRender(payload, fixture.slug)
    expect(payload.intro).toHaveLength(fixture.intro)
    expect(payload.body).toHaveLength(fixture.rawBody)
    expect(doc.intro).toHaveLength(fixture.intro)
    expect(doc.body).toHaveLength(fixture.mappedBody)
    expect(doc.body.map((block) => block.type)).toEqual(expectedBodyTypes(payload.body))
    expect(doc.title).toBe(payload.title)
    expect(doc.subtitle).toBe(payload.excerpt)
    expect(matches(html, /<h1(?:\s|>)/g)).toHaveLength(1)
    expect(html).toContain('<footer')
    expect(count(visible(html), escape(payload.excerpt))).toBe(1)
    expect(count(html, '<section aria-label="Article resources"')).toBe(1)

    // Count the actual reader-visible structures, not just the mapped array.
    const bodyParagraphs = payload.body.filter((block) => block._type === 'block' && !block.listItem && !['h2', 'h3', 'h4', 'blockquote'].includes(block.style ?? '')).length
    const cellParagraphs = payload.body.filter((block) => block._type === 'articleTable').flatMap((table) => table.rows ?? []).flatMap((row) => row.cells ?? []).flatMap(paragraphs).length
    const calloutParagraphs = payload.body.filter((block) => block._type === 'callout').length
    const imageNoteParagraphs = payload.body.filter((block) => block._type === 'image' && block.note).length
    expect(matches(bodyHtml, /<p(?:\s|>)/g)).toHaveLength(payload.intro.length + bodyParagraphs + cellParagraphs + calloutParagraphs + imageNoteParagraphs)
    expect(matches(bodyHtml, /<li(?:\s|>)/g)).toHaveLength(payload.body.filter((block) => block._type === 'block' && block.listItem).length)
    expect(matches(bodyHtml, /<(?:ul|ol)(?:\s|>)/g)).toHaveLength(doc.body.filter((block) => block.type === 'list').length)

    // All nonempty prose and headings survive in source order, even with inline
    // marks, consecutive list grouping, intervening tables and callouts.
    const renderedText = visible(bodyHtml)
    let cursor = 0
    for (const block of [...payload.intro, ...payload.body]) {
      const sourceText = block._type === 'block' ? text(block).trim() : block._type === 'callout' ? block.text?.trim() : undefined
      if (!sourceText) continue
      const needle = escape(sourceText).replace(/\s+/g, ' ')
      const found = renderedText.indexOf(needle, cursor)
      expect(found, `${fixture.name}: prose missing or out of order at ${block._key}`).toBeGreaterThanOrEqual(cursor)
      cursor = found + needle.length
    }

    for (const [index, level] of ['h2', 'h3', 'h4'].entries()) {
      const sourceHeadings = payload.body.filter((block) => block._type === 'block' && block.style === level).map((block) => text(block).trim())
      const actualHeadings = matches(bodyHtml, new RegExp(`<${level}\\b[^>]*>([\\s\\S]*?)<\\/${level}>`, 'g')).map((match) => visible(match[1]))
      expect(sourceHeadings).toHaveLength(fixture.headings[index])
      expect(actualHeadings).toEqual(sourceHeadings.map(escape))
      for (const heading of actualHeadings) expect(heading).not.toMatch(/\*\*|__|&lt;\/?(?:strong|b|h[1-6])\b|^#{1,6}\s/i)
    }
    const asideStart = html.indexOf('<aside', html.indexOf(resourcesHtml) + resourcesHtml.length)
    const asideEnd = html.indexOf('</aside>', asideStart)
    const tocHtml = html.slice(asideStart, asideEnd).match(/<nav\b[^>]*>[\s\S]*?<\/nav>/)?.[0]
    expect(tocHtml).toBeTruthy()
    const sourceToc = payload.body.filter((block) => block._type === 'block' && block.style === 'h2').map((block) => text(block).trim().replace(/^\d+\.\s*/, ''))
    expect(anchors(tocHtml!)).toEqual(sourceToc.map((label, index) => ({
      href: `#${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      text: `${String(index + 1).padStart(2, '0')}. ${escape(label)}`,
    })))

    // Every actual inline hyperlink, in order, including any inside table cells.
    expect(anchors(bodyHtml)).toEqual(linkSpans(portableBlocksInOrder([...payload.intro, ...payload.body])))

    const sourceImages = payload.body.filter((block) => block._type === 'image')
    const mappedImages = doc.body.filter((block) => block.type === 'image')
    const figures = matches(bodyHtml, /<figure\b[^>]*>[\s\S]*?<\/figure>/g).map((match) => match[0])
    expect(sourceImages).toHaveLength(fixture.images)
    expect(mappedImages).toHaveLength(fixture.images)
    expect(figures).toHaveLength(fixture.images)
    sourceImages.forEach((image, index) => {
      const desktopRef = image.asset?._ref
      const mobileRef = image.mobileImage?.asset?._ref
      expect(desktopRef).toBeTruthy()
      expect(mobileRef).toBeTruthy()
      expect(image.alt?.trim()).toBeTruthy()
      expect(mappedImages[index].src).toContain(assetPart(desktopRef!))
      expect(mappedImages[index].src).toContain('w=1440')
      expect(mappedImages[index].mobileSrc).toContain(assetPart(mobileRef!))
      expect(mappedImages[index].mobileSrc).toContain('w=900')
      expect(mappedImages[index].alt).toBe(image.alt)
      const figure = figures[index]
      expect(figure).toContain(`<source media="(max-width: 767px)" srcSet="${escape(mappedImages[index].mobileSrc!)}"`)
      expect(figure).toContain(`src="${escape(mappedImages[index].src)}"`)
      expect(figure).toContain(`alt="${escape(image.alt!)}"`)
    })

    const sourceTables = payload.body.filter((block) => block._type === 'articleTable')
    const mappedTables = doc.body.filter((block) => block.type === 'table')
    const htmlTables = matches(bodyHtml, /<table\b[^>]*>[\s\S]*?<\/table>/g).map((match) => match[0])
    expect(sourceTables).toHaveLength(fixture.tables)
    expect(mappedTables).toHaveLength(fixture.tables)
    expect(htmlTables).toHaveLength(fixture.tables)
    const tableRowCounts: Record<string, number[]> = { 'settings-styles': [], jeweler: [], 'hidden-halos': [4], 'natural-lab': [8], shape: [13, 4, 7, 7], clarity: [7] }
    expect(sourceTables.map((table) => table.rows?.length)).toEqual(tableRowCounts[fixture.name])
    sourceTables.forEach((sourceTable, tableIndex) => {
      const sourceRows = sourceTable.rows ?? []
      const mappedRows = mappedTables[tableIndex].rows
      const renderedRows = matches(htmlTables[tableIndex], /<tr\b[^>]*>[\s\S]*?<\/tr>/g).map((match) => match[0])
      expect(mappedRows).toHaveLength(sourceRows.length)
      expect(renderedRows).toHaveLength(sourceRows.length)
      sourceRows.forEach((row, rowIndex) => {
        const sourceCells = row.cells ?? []
        const mappedCells = mappedRows[rowIndex].cells
        const renderedCells = matches(renderedRows[rowIndex], /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/g)
        expect(mappedCells).toHaveLength(sourceCells.length)
        expect(renderedCells).toHaveLength(sourceCells.length)
        sourceCells.forEach((cell, cellIndex) => {
          const mapped = mappedCells[cellIndex]
          const rendered = renderedCells[cellIndex]
          expect(mapped.isHeader).toBe(cell.isHeader === true)
          expect(mapped.colSpan).toBe(cell.colSpan)
          expect(mapped.rowSpan).toBe(cell.rowSpan)
          // These fixtures have nonempty column headings and no rowspans, so
          // the first cell of each multi-cell data row is an inferred row label.
          const isRowLabel = !cell.isHeader && rowIndex > 0 && cellIndex === 0 && sourceCells.length > 1
          expect(rendered[1]).toBe(cell.isHeader || isRowLabel ? 'th' : 'td')
          if (isRowLabel) expect(rendered[2]).toMatch(/\bscope="row"/)
          if (cell.colSpan) expect(rendered[2]).toContain(`colSpan="${cell.colSpan}"`)
          if (cell.rowSpan) expect(rendered[2]).toContain(`rowSpan="${cell.rowSpan}"`)
          const sourceParagraphs = paragraphs(cell)
          expect(mapped.paragraphs.map((p) => p.text)).toEqual(sourceParagraphs.map(text))
          sourceParagraphs.forEach((sourceParagraph, paragraphIndex) => {
            const sourceSpans = (sourceParagraph.children ?? []).filter((span) => span.text)
            const mappedSpans = mapped.paragraphs[paragraphIndex].inline
            expect(mappedSpans).toHaveLength(sourceSpans.length)
            sourceSpans.forEach((span, spanIndex) => {
              expect(mappedSpans[spanIndex]).toMatchObject({
                text: span.text,
                strong: (span.marks ?? []).includes('strong') || (span.marks ?? []).includes('b'),
                em: (span.marks ?? []).includes('em') || (span.marks ?? []).includes('i'),
              })
              if ((span.marks ?? []).includes('strong') || (span.marks ?? []).includes('b')) expect(rendered[3]).toContain(`<strong>${escape(span.text!)}</strong>`)
            })
          })
          const renderedParagraphs = matches(rendered[3], /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g).map((match) => visible(match[1]))
          expect(renderedParagraphs).toEqual(sourceParagraphs.map((p) => escape(text(p)).replace(/\s+/g, ' ').trim()))
        })
      })
    })
    if (fixture.name === 'shape') {
      // These are three separate in-body group rows, not three columns of text
      // or one merged row; inspect each fixture row in both mapping and HTML.
      const mergedRows = mappedTables[0].rows.filter((row) => row.cells.length === 1 && row.cells[0].isHeader && row.cells[0].colSpan === 3)
      expect(mergedRows).toHaveLength(3)
      const renderedMergedRows = matches(htmlTables[0], /<tr\b[^>]*>\s*<th\b[^>]*colSpan="3"[^>]*>[\s\S]*?<\/th>\s*<\/tr>/g)
      expect(renderedMergedRows).toHaveLength(3)
    }

    expect(payload.articleRelatedGuides).toHaveLength(fixture.guides)
    expect(payload.sources).toHaveLength(fixture.sources)
    expect(doc.articleRelatedGuides).toEqual(payload.articleRelatedGuides.map(({ title, url }) => ({ title, url })))
    expect(doc.sources).toEqual(payload.sources.map(({ citation, url }) => ({ citation, url })))
    const details = matches(resourcesHtml, /<details\b[^>]*>[\s\S]*?<\/details>/g).map((match) => match[0])
    expect(details).toHaveLength(1 + Number(fixture.sources > 0))
    const guides = details.filter((item) => /<summary\b[^>]*>\s*<span>Related Guides<\/span>/.test(item))
    const sources = details.filter((item) => /<summary\b[^>]*>\s*<span>Sources<\/span>/.test(item))
    expect(guides).toHaveLength(1)
    expect(sources).toHaveLength(Number(fixture.sources > 0))
    expect(anchors(guides[0])).toEqual(payload.articleRelatedGuides.map(({ title, url }) => ({ href: escape(url), text: escape(title) })))
    if (fixture.sources) {
      expect(anchors(sources[0])).toEqual(payload.sources.map(({ url }) => ({ href: escape(url), text: escape(url) })))
      for (const source of payload.sources) expect(count(visible(sources[0]), escape(source.citation))).toBe(1)
    }
  })
})
