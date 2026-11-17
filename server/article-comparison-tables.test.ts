import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { existsSync, readFileSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { chromium, type Browser } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import Article, { ArticleBody } from '../src/pages/Article'
import { readingTimeFor } from '../src/lib/content'
import { toArticleDoc } from '../src/sanity/mappers'
import { seedCmsArticle } from '../src/sanity/queries'
import type { CmsPortableBlock, CmsPost, CmsTableCell } from '../src/sanity/types'

vi.mock('../src/sanity/image', () => ({ imageUrl: (image: unknown) => image ? '/fixture.jpg' : undefined }))

const hero = 'image-0df3fc7b885df0685b0863614a7399bc620391f7-1600x1178-jpg'
const para = (text: string, marks: string[] = [], href?: string): CmsPortableBlock => ({
  _type: 'block', _key: `p-${text}`, style: 'normal',
  children: [{ _type: 'span', _key: `s-${text}`, text, marks }],
  markDefs: href ? [{ _type: 'link', _key: 'link', href }] : [],
})
const cell = (text: string, isHeader = false, extra: Partial<CmsTableCell> = {}): CmsTableCell => ({
  _type: 'articleTableCell', _key: `c-${text}`, isHeader, content: [para(text)], ...extra,
})
// Synthetic fixture mirrors the import contract, including a merged 3-column
// group, a header spanning two rows, multi-paragraph cells and inline marks.
const table: CmsPortableBlock = {
  _type: 'articleTable', _key: 'table1', rows: [
    { _type: 'articleTableRow', _key: 'row1', cells: [
      cell('Attribute', true, { rowSpan: 2 }),
      cell('Options', true, { colSpan: 3 }),
    ] },
    { _type: 'articleTableRow', _key: 'row2', cells: [cell('First', true), cell('Second', true), cell('Third', true)] },
    { _type: 'articleTableRow', _key: 'row3', cells: [
      cell('Price', true),
      cell('unused', false, { content: [
        { _type: 'block', _key: 'formatted', style: 'normal', children: [
          { _type: 'span', _key: 'plain', text: 'Compare ' },
          { _type: 'span', _key: 'bold', text: 'carefully', marks: ['strong'] },
          { _type: 'span', _key: 'link-span', text: ' this source', marks: ['em', 'link'] },
        ], markDefs: [{ _type: 'link', _key: 'link', href: 'https://example.com/source' }] },
        para('Second paragraph'),
      ] }),
      cell('A reasonably long entry in the middle column.'),
      cell('Last-column-content-with-a-very-long-unbroken-word-that-must-wrap-safely'),
    ] },
  ],
}
function docFor(body: CmsPortableBlock[]) {
  const post: CmsPost = {
    _id: 'post-test', slug: 'test', title: 'Test', excerpt: 'Test excerpt',
    heroImage: { mainImage: { asset: { _ref: hero } }, alt: 'Hero' }, body,
  }
  const doc = toArticleDoc(post)
  if (!doc) throw new Error('Expected an article document')
  return doc
}
const renderBody = (body: CmsPortableBlock[]) => {
  const doc = docFor(body)
  return renderToStaticMarkup(createElement(ArticleBody, {
    intro: doc.intro, body: doc.body, onZoom: () => {}, galleryIndexOf: () => -1,
  }))
}

const packagesRoot = process.env.ARTICLE_PACKAGES_DIR ?? '/home/ubuntu/article-packages'
const packageTables = (name: string): CmsPortableBlock[] => {
  const fixture = JSON.parse(readFileSync(resolve(packagesRoot, name, 'normalized-content.json'), 'utf8')) as { body: CmsPortableBlock[] }
  return fixture.body.filter((block) => block._type === 'articleTable')
}
const syntheticTable = (rows: CmsTableCell[][]): CmsPortableBlock => ({
  _type: 'articleTable', rows: rows.map((cells) => ({ _type: 'articleTableRow', cells })),
})
const packageCases = [['clarity', 1], ['shape', 4], ['hidden-halos', 1], ['natural-lab', 1]] as const

describe('article comparison tables', () => {
  it.each(packageCases)('maps and renders the real %s package tables without copying their contents', (name, expectedCount) => {
    const fixtures = packageTables(name)
    expect(fixtures).toHaveLength(expectedCount)
    fixtures.forEach((fixture) => {
      const html = renderBody([fixture])
      const dataRows = fixture.rows!.slice(1).filter((row) => (row.cells?.length ?? 0) > 1)
      const categoryRows = fixture.rows!.slice(1).filter((row) => row.cells?.length === 1 && row.cells[0].isHeader === true && (row.cells[0].colSpan ?? 1) > 1)
      expect(html.match(/scope="row"/g)?.length ?? 0).toBe(dataRows.length)
      expect(html.match(/scope="rowgroup"/g)?.length ?? 0).toBe(categoryRows.length)
    })
  })

  it('maps merged cells, paragraphs, links and inline formatting in order', () => {
    const doc = docFor([para('Before'), table, para('After')])
    expect(doc.body.map((block) => block.type)).toEqual(['p', 'table', 'p'])
    const mapped = doc.body[1]
    if (mapped.type !== 'table') throw new Error('Expected table')
    expect(mapped.rows[0].cells[0]).toMatchObject({ isHeader: true, rowSpan: 2 })
    expect(mapped.rows[0].cells[1]).toMatchObject({ isHeader: true, colSpan: 3 })
    const paragraphs = mapped.rows[2].cells[1].paragraphs
    expect(paragraphs.map((p) => p.text)).toEqual(['Compare carefully this source', 'Second paragraph'])
    expect(paragraphs[0].inline[1]).toMatchObject({ text: 'carefully', strong: true })
    expect(paragraphs[0].inline[2]).toMatchObject({ text: ' this source', em: true, href: 'https://example.com/source' })
  })

  it('server-renders semantic groups, headers, inline formatting and paragraphs, not headings', () => {
    const html = renderBody([para('Before'), table, para('After')])
    expect(html).toContain('role="region"')
    expect(html).toContain('tabindex="0"')
    expect(html).toContain('<table')
    expect(html).toContain('<colgroup span="1"></colgroup><colgroup span="3"></colgroup>')
    expect(html).toMatch(/<th[^>]*scope="colgroup"[^>]*colSpan="3"[^>]*>/)
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*rowSpan="2"[^>]*>/)
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>/)
    expect(html).toContain('<strong>carefully</strong>')
    expect(html).toContain('<em> this source</em>')
    expect(html).toContain('href="https://example.com/source"')
    expect(html).toContain('Second paragraph')
    expect(html).toContain('Last-column-content-with-a-very-long-unbroken-word-that-must-wrap-safely')
    expect(html.indexOf('Before')).toBeLessThan(html.indexOf('<table'))
    expect(html.indexOf('After')).toBeGreaterThan(html.indexOf('</table>'))
    expect(html).not.toMatch(/<h[1-6]/)
  })

  it('renders the table in the full SSR article while its headers stay out of the TOC', () => {
    const doc = docFor([{ ...para('Section One'), style: 'h2' }, table, para('After')])
    seedCmsArticle(doc)
    const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/guides/test'] },
      createElement(Routes, null, createElement(Route, { path: '/guides/:slug', element: createElement(Article) })),
    ))
    expect(html).toContain('<table')
    expect(html).toContain('Last-column-content-with-a-very-long-unbroken-word-that-must-wrap-safely')
    const nav = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/)?.[0]
    expect(nav).toContain('Section One')
    expect(nav).not.toContain('Options')
    expect(nav).not.toContain('Price')
  })

  it('keeps empty and malformed cells safe without corrupting surrounding body blocks', () => {
    const malformed = { _type: 'articleTable', rows: [
      null, { cells: [null, { isHeader: true, colSpan: -1, rowSpan: '2', content: [null, {}, { _type: 'block', children: [null, 42, { text: 'Survives', marks: null }], markDefs: [null] }, { _type: 'block', children: [] }] }] },
      { cells: 'not-an-array' },
    ] } as unknown as CmsPortableBlock
    const doc = docFor([para('Before'), malformed, para('After')])
    const block = doc.body[1]
    if (block.type !== 'table') throw new Error('Expected table')
    expect(block.rows[1].cells[0]).toEqual({ isHeader: false, colSpan: undefined, rowSpan: undefined, paragraphs: [] })
    expect(block.rows[1].cells[1]).toMatchObject({ isHeader: true, colSpan: undefined, rowSpan: undefined, paragraphs: [{ text: 'Survives' }, { text: '' }] })
    const html = renderBody([para('Before'), malformed, para('After')])
    expect(html).toContain('Survives')
    expect(html).toContain('Before')
    expect(html).toContain('After')
    expect(html).not.toContain('colSpan="-1"')
    expect(renderBody([{ _type: 'articleTable', rows: null } as unknown as CmsPortableBlock])).toContain('<table')
  })

  it('includes table text in reading time and retains the local authoring contract', () => {
    const doc = docFor([{ ...table, rows: [{ _type: 'articleTableRow', _key: 'r', cells: [cell(Array(230).fill('word').join(' '))] }] }])
    expect(readingTimeFor(doc)).toBe('2 minute read')
    const schema = readFileSync(resolve(import.meta.dirname, '../studio/schemas/documents.ts'), 'utf8')
    for (const field of ["name: 'articleTable'", "name: 'articleTableRow'", "name: 'articleTableCell'", "name: 'isHeader'", "name: 'colSpan'", "name: 'rowSpan'", "name: 'content'"]) expect(schema).toContain(field)
    expect(schema).toContain('articleBlock, articleImage, articleTable')
    expect(schema).toContain("name: 'link'")
    expect(schema).toContain("value: 'strong'")
    expect(schema).toContain("value: 'em'")
  })
})

describe.skipIf(!existsSync('/usr/bin/chromium'))('comparison table responsive browser layout', () => {
  let server: ViteDevServer
  let browser: Browser
  let css: string
  beforeAll(async () => {
    server = await createServer({ configFile: false, root: resolve(import.meta.dirname, '..'), logLevel: 'silent', plugins: [tailwindcss()], server: { host: '127.0.0.1', port: 0, hmr: false } })
    await server.listen()
    const address = server.httpServer?.address() as AddressInfo
    const response = await fetch(`http://127.0.0.1:${address.port}/src/index.css?direct`)
    if (!response.ok) throw new Error(`Unable to load test CSS: ${response.status}`)
    css = (await response.text()).replace(/@import\s+url\([^;]+;/g, '')
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  }, 30000)
  afterAll(async () => {
    await browser?.close()
    await server?.close()
  })
  it.each(packageCases)('preserves and associates the real %s tables at 375px', async (name, expectedCount) => {
    const fixtures = packageTables(name)
    expect(fixtures).toHaveLength(expectedCount)
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } })
    try {
      const markup = renderBody(fixtures)
      await page.setContent(`<style>${css}</style><div class="w-full"><div class="mx-auto flex w-full max-w-[1440px] justify-center gap-16 px-6 md:px-10 xl:gap-[115px]"><div class="w-full min-w-0 max-w-[710px] pt-16 md:pt-24">${markup}</div></div></div>`)
      const result = await page.evaluate(() => {
        const regions = [...document.querySelectorAll<HTMLElement>('[role="region"]')]
        return {
          viewportOverflow: document.documentElement.scrollWidth > innerWidth,
          tables: regions.map((region) => {
            const table = region.querySelector('table')!
            const cells = [...table.querySelectorAll('th,td')]
            const overlap = cells.some((cell, index) => cells.slice(index + 1).some((other) => {
              const a = cell.getBoundingClientRect(), b = other.getBoundingClientRect()
              return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
            }))
            const scrollWidth = region.scrollWidth, clientWidth = region.clientWidth
            region.scrollLeft = scrollWidth
            const endVisible = cells[cells.length - 1].getBoundingClientRect().right <= region.getBoundingClientRect().right + 1
            const rows = [...table.rows].map((row) => ({
              group: [...table.tBodies].indexOf(row.parentElement as HTMLTableSectionElement),
              cells: [...row.cells].map((cell) => ({
                tag: cell.tagName.toLowerCase(), scope: cell.getAttribute('scope'), text: cell.textContent,
                colSpan: cell.colSpan, rowSpan: cell.rowSpan, className: cell.className,
                background: getComputedStyle(cell).backgroundColor, weight: getComputedStyle(cell).fontWeight, align: getComputedStyle(cell).textAlign,
              })),
            }))
            return { rows, overlap, scrollWidth, clientWidth, scrolled: region.scrollLeft, endVisible, overflowX: getComputedStyle(region).overflowX, fontSize: getComputedStyle(table).fontSize }
          }),
        }
      })
      expect(result.viewportOverflow).toBe(false)
      expect(result.tables).toHaveLength(expectedCount)
      const session = await page.context().newCDPSession(page)
      const accessibility = await session.send('Accessibility.getFullAXTree')
      const rowHeaderNames = accessibility.nodes.filter((node) => node.role?.value === 'rowheader').map((node) => node.name?.value)
      const columnHeaderNames = accessibility.nodes.filter((node) => node.role?.value === 'columnheader').map((node) => node.name?.value)
      fixtures.forEach((fixture, tableIndex) => {
        const actual = result.tables[tableIndex]
        const sourceRows = fixture.rows!
        expect(actual.rows).toHaveLength(sourceRows.length)
        expect(actual.overlap).toBe(false)
        expect(actual.scrollWidth).toBeGreaterThan(actual.clientWidth)
        expect(actual.scrolled).toBeGreaterThan(0)
        expect(actual.endVisible).toBe(true)
        expect(actual.overflowX).toBe('auto')
        expect(actual.fontSize).toBe('17px')
        let expectedGroup = 0
        sourceRows.forEach((sourceRow, rowIndex) => {
          const sourceCells = sourceRow.cells!
          const isCategory = rowIndex > 0 && sourceCells.length === 1 && sourceCells[0].isHeader === true && (sourceCells[0].colSpan ?? 1) > 1
          if (isCategory) expectedGroup++
          const renderedRow = actual.rows[rowIndex]
          expect(renderedRow.group).toBe(expectedGroup)
          expect(renderedRow.cells).toHaveLength(sourceCells.length)
          sourceCells.forEach((sourceCell, cellIndex) => {
            const rendered = renderedRow.cells[cellIndex]
            const text = (sourceCell.content ?? []).flatMap((paragraph) => (paragraph.children ?? []).map((span) => span.text ?? '')).join('')
            expect(rendered.text).toBe(text)
            expect(rendered.colSpan).toBe(sourceCell.colSpan ?? 1)
            expect(rendered.rowSpan).toBe(sourceCell.rowSpan ?? 1)
            if (rowIndex === 0) {
              expect(rendered).toMatchObject({ tag: 'th', scope: 'col' })
              if (text.trim()) expect(columnHeaderNames).toContain(text.replace(/\s+/g, ' ').trim())
            } else if (isCategory) {
              expect(rendered).toMatchObject({ tag: 'th', scope: 'rowgroup' })
              expect(rowHeaderNames).toContain(text.replace(/\s+/g, ' ').trim())
            } else if (cellIndex === 0) {
              expect(rendered).toMatchObject({ tag: 'th', scope: 'row' })
              expect(rendered.className).toContain('bg-white font-normal')
              expect(rendered.background).toBe(renderedRow.cells[1].background)
              expect(rendered.weight).toBe(renderedRow.cells[1].weight)
              expect(rendered.align).toBe(renderedRow.cells[1].align)
              expect(rowHeaderNames).toContain(text.replace(/\s+/g, ' ').trim())
            } else {
              expect(rendered).toMatchObject({ tag: 'td', scope: null })
            }
          })
        })
      })
    } finally {
      await page.close()
    }
  }, 30000)

  it('only infers non-empty row labels with meaningful column headings and respects physical rowspans', async () => {
    const cases = [
      syntheticTable([[cell('a'), cell('b')], [cell('c'), cell('d')]]),
      syntheticTable([[cell('', true), cell(' ', true)], [cell('label'), cell('value')]]),
      syntheticTable([[cell('Title', true, { colSpan: 2 })], [cell('label'), cell('value')]]),
      syntheticTable([[cell('Item', true), cell('Result', true)], [cell(''), cell('value')], [cell('only', false, { colSpan: 2 })]]),
      syntheticTable([[cell('Item', true), cell('Result', true)], [cell('shared label', false, { rowSpan: 2 }), cell('first value')], [cell('second value')]]),
      syntheticTable([[cell('', true), cell('Result', true)], [cell('explicit', true), cell('value')]]),
      syntheticTable([[cell('Item', true), cell('', true)], [cell('label'), cell('value')]]),
      syntheticTable([[cell('Item', true), cell('Result')], [cell('label'), cell('value')]]),
      syntheticTable([[cell('Item', true, { rowSpan: 2 }), cell('Choices', true, { colSpan: 2 })], [cell('A', true), cell('B', true)], [cell('label'), cell('a'), cell('b')]]),
    ]
    const page = await browser.newPage()
    try {
      await page.setContent(renderBody(cases))
      const tables = await page.evaluate(() => [...document.querySelectorAll('table')].map((table) =>
        [...table.rows].map((row) => [...row.cells].map((cell) => ({ tag: cell.tagName.toLowerCase(), scope: cell.getAttribute('scope'), rowSpan: cell.rowSpan, colSpan: cell.colSpan }))),
      ))
      for (const index of [0, 1, 2]) expect(tables[index][1][0]).toMatchObject({ tag: 'td', scope: null })
      expect(tables[3][1][0]).toMatchObject({ tag: 'td', scope: null })
      expect(tables[3][2][0]).toMatchObject({ tag: 'td', scope: null, colSpan: 2 })
      expect(tables[4][1][0]).toMatchObject({ tag: 'th', scope: 'row', rowSpan: 2 })
      expect(tables[4][2][0]).toMatchObject({ tag: 'td', scope: null })
      expect(tables[5][1][0]).toMatchObject({ tag: 'th', scope: 'row' })
      expect(tables[6][1][0]).toMatchObject({ tag: 'td', scope: null })
      expect(tables[7][1][0]).toMatchObject({ tag: 'td', scope: null })
      expect(tables[8][0][1]).toMatchObject({ tag: 'th', scope: 'colgroup', colSpan: 2 })
      expect(tables[8][2][0]).toMatchObject({ tag: 'th', scope: 'row' })
    } finally {
      await page.close()
    }
  })

  it('forms independent body groups but does not split an existing rowspan', async () => {
    const headings = [cell('Item', true), cell('Result', true)]
    const category = (text: string) => [cell(text, true, { colSpan: 2 })]
    const safe = syntheticTable([headings, [cell('ungrouped'), cell('value')], category('group one'), [cell('one'), cell('value')], category('group two'), [cell('two'), cell('value')]])
    const crossing = syntheticTable([headings, category('group one'), [cell('spanning', false, { rowSpan: 2 }), cell('value')], category('group two'), [cell('two'), cell('value')]])
    const page = await browser.newPage()
    try {
      await page.setContent(renderBody([safe, crossing]))
      const tables = await page.evaluate(() => [...document.querySelectorAll('table')].map((table) =>
        [...table.tBodies].map((body) => [...body.rows].map((row) => [...row.cells].map((cell) => ({ tag: cell.tagName.toLowerCase(), scope: cell.getAttribute('scope'), rowSpan: cell.rowSpan, colSpan: cell.colSpan })))),
      ))
      expect(tables[0].map((body) => body.length)).toEqual([2, 2, 2])
      expect(tables[0][0][1][0]).toMatchObject({ tag: 'th', scope: 'row' })
      expect(tables[0][1][0][0]).toMatchObject({ tag: 'th', scope: 'rowgroup', colSpan: 2 })
      expect(tables[0][2][0][0]).toMatchObject({ tag: 'th', scope: 'rowgroup', colSpan: 2 })
      expect(tables[1]).toHaveLength(1)
      expect(tables[1][0][2][0]).toMatchObject({ tag: 'th', scope: 'row', rowSpan: 2 })
      expect(tables[1][0].flat().some((cell) => cell.scope === 'rowgroup')).toBe(false)
    } finally {
      await page.close()
    }
  })

  it.each([375, 1440])('keeps content scrollable, legible and non-overlapping at %ipx', async (width) => {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    try {
      const markup = renderBody([para('Before'), table, para('After')])
      await page.setContent(`<style>${css}</style><div class="w-full"><div class="mx-auto flex w-full max-w-[1440px] justify-center gap-16 px-6 md:px-10 xl:gap-[115px]"><div class="w-full min-w-0 max-w-[710px] pt-16 md:pt-24">${markup}</div><aside class="hidden w-[344px] shrink-0 lg:flex"></aside></div></div>`)
      const result = await page.evaluate(() => {
        const region = document.querySelector<HTMLElement>('[role="region"]')!
        const table = region.querySelector('table')!
        const cells = [...table.querySelectorAll('th,td')]
        const overlap = cells.some((cell, index) => cells.slice(index + 1).some((other) => {
          const a = cell.getBoundingClientRect(), b = other.getBoundingClientRect()
          return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        }))
        const initial = { clientWidth: region.clientWidth, scrollWidth: region.scrollWidth, viewportOverflow: document.documentElement.scrollWidth > innerWidth, fontSize: getComputedStyle(table).fontSize, overflowX: getComputedStyle(region).overflowX }
        region.scrollLeft = region.scrollWidth
        const last = cells[cells.length - 1].getBoundingClientRect()
        const view = region.getBoundingClientRect()
        return { ...initial, overlap, endVisible: last.right <= view.right + 1, scrolled: region.scrollLeft, lineHeight: getComputedStyle(table).lineHeight }
      })
      expect(result.viewportOverflow).toBe(false)
      expect(result.overlap).toBe(false)
      expect(result.fontSize).toBe('17px')
      expect(result.overflowX).toBe('auto')
      expect(result.endVisible).toBe(true)
      if (width === 375) {
        expect(result.scrollWidth).toBeGreaterThan(result.clientWidth)
        expect(result.scrolled).toBeGreaterThan(0)
      }
    } finally {
      await page.close()
    }
  }, 30000)
})
