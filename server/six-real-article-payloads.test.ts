import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { CmsPortableBlock, CmsPost, CmsTableCell } from '../src/sanity/types'

// The normalized packages do not include the post envelope. Configure a harmless
// local project/dataset so the actual Sanity image URL builder can run offline.
vi.hoisted(() => {
  vi.stubEnv('VITE_SANITY_PROJECT_ID', process.env.VITE_SANITY_PROJECT_ID || 'realpayloadtest')
  vi.stubEnv('VITE_SANITY_DATASET', process.env.VITE_SANITY_DATASET || 'production')
})

import Root from '../src/app/Root'
import Article from '../src/pages/Article'
import { toArticleDoc } from '../src/sanity/mappers'
import { seedCmsArticle } from '../src/sanity/queries'

// The default fixtures contain no article copy and work without local packages.
// Set ARTICLE_PACKAGES_DIR to the editorial-ready directory to use real data;
// all six payloads and its insertion-manifest.json must exist when it is set.
const packagesDir = process.env.ARTICLE_PACKAGES_DIR
const cases = [
  { name: 'settings-styles', slug: 'engagement-ring-settings-and-styles', intro: 4, rawBody: 98, mappedBody: 96, headings: [7, 12, 2], images: 4, tables: 0, guides: 5, sources: 4 },
  { name: 'jeweler', slug: 'how-to-choose-a-jeweler', intro: 3, rawBody: 91, mappedBody: 91, headings: [5, 13, 3], images: 2, tables: 0, guides: 5, sources: 0 },
  { name: 'hidden-halos', slug: 'engagement-rings-with-hidden-halos', intro: 3, rawBody: 66, mappedBody: 62, headings: [8, 10, 0], images: 2, tables: 1, guides: 5, sources: 4 },
  { name: 'natural-lab', slug: 'natural-vs-lab-grown-diamonds', intro: 2, rawBody: 49, mappedBody: 48, headings: [6, 4, 0], images: 2, tables: 1, guides: 6, sources: 14 },
  { name: 'shape', slug: 'which-diamond-shape-looks-biggest', intro: 3, rawBody: 65, mappedBody: 57, headings: [10, 0, 0], images: 2, tables: 4, guides: 6, sources: 3 },
  { name: 'clarity', slug: 'ultimate-guide-to-diamond-clarity', intro: 3, rawBody: 84, mappedBody: 73, headings: [7, 20, 0], images: 2, tables: 1, guides: 8, sources: 8 },
] as const

// Each prepared article adds two editorial images. Hidden halos also has one
// broken-link paragraph and one related guide removed with user approval.
// Keep the original synthetic fixture specifications and shapes unchanged.
const preparedCounts: Record<typeof cases[number]['name'], { rawBody: number; mappedBody: number; images: number; guides: number }> = {
  'settings-styles': { rawBody: 100, mappedBody: 98, images: 6, guides: 5 },
  jeweler: { rawBody: 93, mappedBody: 93, images: 4, guides: 5 },
  'hidden-halos': { rawBody: 67, mappedBody: 63, images: 4, guides: 4 },
  'natural-lab': { rawBody: 51, mappedBody: 50, images: 4, guides: 6 },
  shape: { rawBody: 67, mappedBody: 59, images: 4, guides: 6 },
  clarity: { rawBody: 86, mappedBody: 75, images: 4, guides: 8 },
}
const activeCases = cases.map((fixture) => packagesDir ? { ...fixture, ...preparedCounts[fixture.name] } : fixture)

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
const load = (name: string): Payload => packagesDir
  ? JSON.parse(readFileSync(join(packagesDir, name, 'normalized-content.json'), 'utf8')) as Payload
  : portableFixture(name)
const text = (block: CmsPortableBlock) => (block.children ?? []).map((child) => child.text ?? '').join('')
const escape = (value: string) => renderToStaticMarkup(createElement('span', null, value)).replace(/^<span>|<\/span>$/g, '')
const visible = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
const matches = (html: string, pattern: RegExp) => [...html.matchAll(pattern)]
const count = (html: string, value: string) => html.split(value).length - 1
const paragraphs = (cell: CmsTableCell) => (cell.content ?? []).filter((p) => p._type === 'block')

function mapAndRender(payload: Payload, slug: string) {
  const firstImage = payload.body.find((block) => block._type === 'image')
  if (!firstImage?.asset) throw new Error(`Missing an image in ${slug}`)
  // Only the CMS envelope is added: the six payload fields pass through unchanged.
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

describe('six-article payload mapping and SSR (set ARTICLE_PACKAGES_DIR for real data)', () => {
  it('has seven tables, fourteen diagram pairs and, in real data, twelve editorial photos', () => {
    const all = cases.map(({ name }) => load(name))
    const blocks = all.flatMap((payload) => payload.body)
    const images = blocks.filter((block) => block._type === 'image')
    expect(blocks.filter((block) => block._type === 'articleTable')).toHaveLength(7)
    expect(images.filter((block) => block.displayStyle !== 'editorial' && block.asset?._ref && block.mobileImage?.asset?._ref)).toHaveLength(14)
    expect(images.filter((block) => block.displayStyle === 'editorial')).toHaveLength(packagesDir ? 12 : 0)
  })

  it.each(activeCases)('maps and renders the complete $name article', (fixture) => {
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

    // Preserve figures as identity-bearing tokens while stripping HTML. This
    // checks all prose, table paragraphs, callouts and images in one source
    // sequence, including insertion at the intro/body boundary.
    const renderedText = visible(bodyHtml.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/g, (figure) => {
      const alt = figure.match(/<img\b[^>]*\balt="([^"]*)"/)?.[1]
      if (alt === undefined) throw new Error(`Figure without an img alt in ${fixture.name}`)
      return ` [IMAGE:${alt}] `
    }))
    let cursor = 0
    for (const block of [...payload.intro, ...payload.body]) {
      const tokens = block._type === 'block' ? [text(block).trim()]
        : block._type === 'callout' ? [block.text?.trim() ?? '']
        : block._type === 'image' ? [`[IMAGE:${block.alt ?? ''}]`]
        : block._type === 'articleTable' ? (block.rows ?? []).flatMap((row) => (row.cells ?? []).flatMap(paragraphs).map((paragraph) => text(paragraph).trim()))
        : []
      for (const token of tokens.filter(Boolean)) {
        const needle = escape(token).replace(/\s+/g, ' ')
        const found = renderedText.indexOf(needle, cursor)
        expect(found, `${fixture.name}: content missing or out of order at ${block._key}`).toBeGreaterThanOrEqual(cursor)
        cursor = found + needle.length
      }
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
    expect(sourceImages.filter((image) => image.displayStyle === 'editorial')).toHaveLength(packagesDir ? 2 : 0)
    sourceImages.forEach((image, index) => {
      const desktopRef = image.asset?._ref
      const mobileRef = image.mobileImage?.asset?._ref
      const mapped = mappedImages[index]
      const figure = figures[index]
      expect(desktopRef).toBeTruthy()
      expect(image.alt?.trim()).toBeTruthy()
      expect(mapped.src).toContain(assetPart(desktopRef!))
      expect(new URL(mapped.src).searchParams.get('w')).toBe('1440')
      expect(mapped.alt).toBe(image.alt)
      expect(mapped.caption).toBe(image.caption)
      expect(mapped.note).toBe(image.note)
      expect(matches(figure, /<img\b/g)).toHaveLength(1)
      expect(figure).toContain(`src="${escape(mapped.src)}"`)
      expect(figure).toContain(`alt="${escape(image.alt!)}"`)
      if (image.displayStyle === 'editorial') {
        expect(image.mobileImage).toBeUndefined()
        expect(image.caption).toBeUndefined()
        expect(image.note).toBeUndefined()
        expect(mapped.displayStyle).toBe('editorial')
        expect(mapped.mobileSrc).toBeUndefined()
        expect(figure).toContain('<figure class="flex w-full flex-col gap-3 self-center md:max-w-[640px]">')
        expect(figure).not.toMatch(/<source\b|\bsrcSet=|<figcaption\b/)
      } else {
        expect(mapped.displayStyle).toBeUndefined()
        expect(mobileRef).toBeTruthy()
        expect(mobileRef).not.toBe(desktopRef)
        expect(mapped.mobileSrc).toContain(assetPart(mobileRef!))
        expect(new URL(mapped.mobileSrc!).searchParams.get('w')).toBe('900')
        expect(figure).toContain('<figure class="flex flex-col gap-3">')
        expect(matches(figure, /<source\b/g)).toHaveLength(1)
        expect(figure).toContain(`<source media="(max-width: 767px)" srcSet="${escape(mapped.mobileSrc!)}"`)
        const caption = figure.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1]
        expect(caption && visible(caption)).toBe(image.caption ? escape(image.caption) : undefined)
        if (image.note) expect(visible(figure)).toContain(escape(image.note))
      }
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
          // These corpus tables have a column-heading first row; all other
          // multi-cell rows have a nonempty first-column row label. Shape's
          // full-width section rows are explicit row-group headers instead.
          const groupHeader = rowIndex > 0 && sourceCells.length === 1 && cell.isHeader === true && (cell.colSpan ?? 1) > 1
          const rowHeader = rowIndex > 0 && !groupHeader && cellIndex === 0
          if (rowIndex === 0 || groupHeader) expect(cell.isHeader).toBe(true)
          else expect(cell.isHeader).not.toBe(true)
          if (rowHeader) expect(paragraphs(cell).some((p) => text(p).trim())).toBe(true)
          const scope = rowIndex === 0 ? 'col' : groupHeader ? 'rowgroup' : rowHeader ? 'row' : undefined
          expect(rendered[1]).toBe(scope ? 'th' : 'td')
          if (scope) expect(rendered[2]).toContain(`scope="${scope}"`)
          else expect(rendered[2]).not.toMatch(/\bscope=/)
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
      // or one merged row; inspect each real row in both mapping and HTML.
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

type ManifestAnchor = { field: 'intro' | 'body'; index: number; key: string; text: string; style?: string }
type ManifestPlacement = {
  article: string
  status: string
  key: string
  asset_ref: string
  alt: string
  after_anchor: string
  after_match: 'prefix' | 'entire-paragraph'
  before_anchor: string
  after_source: ManifestAnchor
  before_source: ManifestAnchor
}
type InsertionManifest = {
  articles: { article: string; status: string; inserted_images: number; source_counts: { intro: number; body: number }; payload_counts: { intro: number; body: number } }[]
  placements: ManifestPlacement[]
}

// The manifest is deliberately read from the external prepared directory, not
// copied into the repository. Synthetic fixtures need no local/private files.
describe.skipIf(!packagesDir)('prepared editorial photo placements', () => {
  it.each(cases)('uses the exact manifest photos and adjacent source anchors for $name', ({ name }) => {
    const manifest = JSON.parse(readFileSync(join(packagesDir!, 'insertion-manifest.json'), 'utf8')) as InsertionManifest
    const payload = load(name)
    const records = manifest.articles.filter((article) => article.article === name)
    const placements = manifest.placements.filter((placement) => placement.article === name)
    const photos = payload.body.filter((block) => block._type === 'image' && block.displayStyle === 'editorial')
    const original = { intro: payload.intro, body: payload.body.filter((block) => !(block._type === 'image' && block.displayStyle === 'editorial')) }
    const combined = [...payload.intro, ...payload.body]
    const originalCombined = [...original.intro, ...original.body]

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ status: 'inserted', inserted_images: 2 })
    expect(records[0].source_counts).toMatchObject({ intro: original.intro.length, body: original.body.length })
    expect(records[0].payload_counts).toMatchObject({ intro: payload.intro.length, body: payload.body.length })
    expect(placements).toHaveLength(2)
    expect(photos.map((photo) => photo._key)).toEqual(placements.map((placement) => placement.key))
    expect(new Set(photos.map((photo) => photo._key)).size).toBe(2)
    expect(payload.intro.some((block) => block._type === 'image' && block.displayStyle === 'editorial')).toBe(false)

    for (const placement of placements) {
      expect(placement.status).toBe('inserted')
      expect(['prefix', 'entire-paragraph']).toContain(placement.after_match)
      const afterCandidates = originalCombined.filter((block) => block._type === 'block' && (placement.after_match === 'prefix'
        ? text(block).startsWith(placement.after_anchor) : text(block) === placement.after_anchor))
      const beforeCandidates = originalCombined.filter((block) => block._type === 'block'
        && /^h[234]$/.test(block.style ?? '') && text(block) === placement.before_anchor)
      expect(afterCandidates).toHaveLength(1)
      expect(beforeCandidates).toHaveLength(1)
      const after = original[placement.after_source.field][placement.after_source.index]
      const before = original[placement.before_source.field][placement.before_source.index]
      expect(after).toBe(afterCandidates[0])
      expect(before).toBe(beforeCandidates[0])
      expect(after).toMatchObject({ _type: 'block', style: 'normal' })
      expect(after.listItem).toBeUndefined()
      expect(after._key).toBe(placement.after_source.key)
      expect(text(after)).toBe(placement.after_source.text)
      expect(before._key).toBe(placement.before_source.key)
      expect(text(before)).toBe(placement.before_source.text)
      expect(before.style).toMatch(/^h[234]$/)
      expect(before.style).toBe(placement.before_source.style)

      const photoIndex = combined.findIndex((block) => block._key === placement.key)
      expect(photoIndex).toBeGreaterThan(0)
      expect(combined[photoIndex]).toMatchObject({
        _type: 'image', _key: placement.key, asset: { _ref: placement.asset_ref }, alt: placement.alt, displayStyle: 'editorial',
      })
      expect(combined[photoIndex - 1]).toBe(after)
      expect(combined[photoIndex + 1]).toBe(before)
    }
  })
})
