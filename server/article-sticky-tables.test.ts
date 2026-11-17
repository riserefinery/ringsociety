import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { existsSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { chromium, type Browser, type Page } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ArticleBody } from '../src/pages/Article'
import { toArticleDoc } from '../src/sanity/mappers'
import type { CmsPortableBlock, CmsPost, CmsTableCell } from '../src/sanity/types'

vi.mock('../src/sanity/image', () => ({ imageUrl: (image: unknown) => image ? '/fixture.jpg' : undefined }))

const paragraph = (text: string): CmsPortableBlock => ({
  _type: 'block', style: 'normal', children: [{ _type: 'span', text }], markDefs: [],
})
const cell = (text: string, isHeader = false, spans: Partial<CmsTableCell> = {}): CmsTableCell => ({
  _type: 'articleTableCell', isHeader, content: [paragraph(text)], ...spans,
})
const table = (rows: CmsTableCell[][]): CmsPortableBlock => ({
  _type: 'articleTable', rows: rows.map((cells) => ({ _type: 'articleTableRow', cells })),
})

const cases = [
  {
    name: 'three-column comparison',
    table: table([
      [cell('Attribute', true), cell('Option one', true), cell('Option two', true)],
      [cell('Cut', true), cell('Round'), cell('End value')],
      [cell('Color'), cell('Warm'), cell('Cool')],
    ]),
    labels: ['Attribute', 'Cut', 'Color'],
    moving: ['Option one', 'Round', 'End value'],
    last: 'End value',
  },
  {
    name: 'rowspans and spanning headings',
    table: table([
      [cell('Shared top', true, { rowSpan: 2 }), cell('Option group', true, { colSpan: 4 })],
      [cell('Option A', true), cell('Option B', true), cell('Option C', true), cell('Option D', true)],
      [cell('Category heading', true, { colSpan: 5 })],
      [cell('Shared label', false, { rowSpan: 2 }), cell('First'), cell('Second'), cell('Third'), cell('End value')],
      [cell('Carry A'), cell('Carry B', false, { colSpan: 2 }), cell('Carry D')],
      [cell('Wide lead', false, { colSpan: 2 }), cell('Wide C'), cell('Wide D'), cell('Wide E')],
    ]),
    labels: ['Shared top', 'Shared label'],
    // Option A and Carry A are each the first DOM cell in their row, but a
    // previous rowspan occupies physical column 0. Neither may stick.
    moving: ['Option group', 'Option A', 'Category heading', 'Carry A', 'Wide lead', 'End value'],
    last: 'End value',
  },
  {
    name: 'unflagged cells',
    table: table([
      [cell('Plain corner'), cell('Plain one'), cell('Plain two'), cell('Plain three'), cell('Plain four')],
      [cell('Plain label'), cell('Value one'), cell('Value two'), cell('Value three'), cell('End value')],
    ]),
    labels: ['Plain corner', 'Plain label'],
    moving: ['Plain one', 'Value one', 'End value'],
    last: 'End value',
  },
] as const

const post: CmsPost = {
  _id: 'sticky-test', slug: 'sticky-test', title: 'Sticky test', excerpt: 'Fixture',
  heroImage: { mainImage: { asset: { _ref: 'fixture-image' } }, alt: 'Fixture' },
  body: cases.map((fixture) => fixture.table),
}
const doc = toArticleDoc(post)
if (!doc) throw new Error('Expected the synthetic article to map successfully')
const markup = renderToStaticMarkup(createElement(ArticleBody, {
  intro: doc.intro, body: doc.body, onZoom: () => {}, galleryIndexOf: () => -1,
}))

// Mirrors the article's constrained content area used by the existing table
// tests, including the desktop sidebar; no test-only table styles are added.
const articleShell = (css: string) => `<!doctype html><html><head><style>${css}</style></head><body>
  <div class="w-full"><div class="mx-auto flex w-full max-w-[1440px] justify-center gap-16 px-6 md:px-10 xl:gap-[115px]">
    <div class="w-full min-w-0 max-w-[710px] pt-16 md:pt-24">${markup}</div>
    <aside class="hidden w-[344px] shrink-0 lg:flex"></aside>
  </div></div></body></html>`

type Spec = typeof cases[number]

// Evaluate the actual rendered table. Use text nodes rather than classes as
// selectors, so the test doesn't prescribe how sticky styling is implemented.
async function measure(page: Page, index: number, spec: Spec) {
  return page.evaluate(({ index, labels, moving, last }) => {
    const region = document.querySelectorAll<HTMLElement>('[role="region"]')[index]
    if (!region) throw new Error(`Missing region ${index}`)
    const table = region.querySelector('table')
    if (!table) throw new Error(`Missing table in region ${index}`)
    const cells = [...table.querySelectorAll<HTMLTableCellElement>('th, td')]
    const find = (text: string) => {
      const matches = cells.filter((candidate) => candidate.textContent?.trim() === text)
      if (matches.length !== 1) throw new Error(`Expected one cell ${JSON.stringify(text)}, found ${matches.length}`)
      return matches[0]
    }
    const labelCells = labels.map(find)
    const movingCells = moving.map(find)
    const lastCell = find(last)
    const box = (el: Element) => {
      const r = el.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }
    }
    const textBox = (el: Element) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node && !node.textContent?.trim()) node = walker.nextNode()
      if (!node) throw new Error(`Missing text in ${el.textContent}`)
      const range = document.createRange()
      range.selectNodeContents(node)
      const r = range.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
    }
    const isOnTopAt = (el: Element, x: number, y: number) => {
      const hit = document.elementFromPoint(x, y)
      return !!hit && (hit === el || el.contains(hit))
    }
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const painter = canvas.getContext('2d')!
    const backgroundAlpha = (color: string) => {
      painter.clearRect(0, 0, 1, 1)
      painter.fillStyle = color
      painter.fillRect(0, 0, 1, 1)
      return painter.getImageData(0, 0, 1, 1).data[3]
    }
    const view = () => {
      const r = region.getBoundingClientRect()
      return { left: r.left + region.clientLeft, right: r.left + region.clientLeft + region.clientWidth }
    }
    region.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
    region.scrollLeft = 0
    const initial = {
      labels: labelCells.map((el) => ({ text: el.textContent?.trim(), ...box(el), position: getComputedStyle(el).position,
        leftInset: getComputedStyle(el).left, tag: el.tagName.toLowerCase(), rowSpan: el.rowSpan, colSpan: el.colSpan })),
      moving: movingCells.map((el) => ({ text: el.textContent?.trim(), ...box(el), position: getComputedStyle(el).position,
        rowSpan: el.rowSpan, colSpan: el.colSpan, scope: el.getAttribute('scope') })),
      maxScroll: region.scrollWidth - region.clientWidth,
      viewportOverflow: document.documentElement.scrollWidth > innerWidth,
      overflowX: getComputedStyle(region).overflowX,
      tabIndex: region.tabIndex,
    }
    const snapshot = (requested: number) => {
      region.scrollLeft = requested
      const clip = view()
      return {
        scrollLeft: region.scrollLeft,
        clip,
        labels: labelCells.map((el) => {
          const rect = box(el)
          const text = textBox(el)
          const style = getComputedStyle(el)
          // Find another cell physically under this label, and use hit testing
          // to verify the label paints above the scrolling table contents.
          const overlap = cells.filter((other) => other !== el).map((other) => {
            const r = box(other)
            return { left: Math.max(rect.left, r.left, clip.left), right: Math.min(rect.right, r.right, clip.right),
              top: Math.max(rect.top, r.top, 0), bottom: Math.min(rect.bottom, r.bottom, innerHeight) }
          }).find((r) => r.right - r.left > 4 && r.bottom - r.top > 4)
          return { ...rect, text, background: style.backgroundColor, opacity: style.opacity,
            backgroundAlpha: backgroundAlpha(style.backgroundColor),
            textOnTop: isOnTopAt(el, (text.left + text.right) / 2, (text.top + text.bottom) / 2),
            overlap: !!overlap, overlapOnTop: !!overlap && isOnTopAt(el, (overlap.left + overlap.right) / 2, (overlap.top + overlap.bottom) / 2) }
        }),
        moving: movingCells.map(box),
        last: box(lastCell),
      }
    }
    const middle = snapshot(initial.maxScroll / 2)
    const end = snapshot(initial.maxScroll)

    // A sticky label can cover the left part of the final cell at maximum
    // scroll. Move the short marker through the remaining visible window and
    // check that it can actually be seen/hit, not merely that its cell exists.
    region.scrollLeft = 0
    const clip = view()
    const labelRight = box(labelCells[0]).right
    const availableLeft = innerWidth < 768 ? Math.max(clip.left, labelRight) : clip.left
    const markerStart = textBox(lastCell)
    const target = (availableLeft + clip.right) / 2
    region.scrollLeft = Math.max(0, Math.min(initial.maxScroll, (markerStart.left + markerStart.right) / 2 - target))
    const marker = textBox(lastCell)
    const markerHit = isOnTopAt(lastCell, (marker.left + marker.right) / 2, (marker.top + marker.bottom) / 2)
    return { initial, middle, end, marker: { ...marker, clip, availableLeft, hit: markerHit, scrollLeft: region.scrollLeft } }
  }, { index, labels: [...spec.labels], moving: [...spec.moving], last: spec.last })
}

const tolerance = 2

describe.skipIf(!existsSync('/usr/bin/chromium'))('article table sticky labels', () => {
  let server: ViteDevServer
  let browser: Browser
  let css: string

  beforeAll(async () => {
    server = await createServer({ configFile: false, root: resolve(import.meta.dirname, '..'), logLevel: 'silent', plugins: [tailwindcss()], server: { host: '127.0.0.1', port: 0, hmr: false } })
    await server.listen()
    const address = server.httpServer?.address() as AddressInfo
    const response = await fetch(`http://127.0.0.1:${address.port}/src/index.css?direct`)
    if (!response.ok) throw new Error(`Unable to load test CSS: ${response.status}`)
    // Avoid production font requests: system fonts are sufficient for geometry.
    // The font URL itself contains a semicolon, so match through its closing `)`.
    css = (await response.text()).replace(/@import\s+url\([^)]*\)\s*;/g, '')
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  }, 30000)

  afterAll(async () => {
    await browser?.close()
    await server?.close()
  })

  for (const [index, spec] of cases.entries()) {
    it.each([320, 375, 767, 768, 1440])(`${spec.name}: scroll geometry at %ipx without client JavaScript`, async (width) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false })
      // In addition to removing the font import, block any accidental external
      // request. ArticleBody is rendered to static HTML, never hydrated.
      await context.route('**/*', (route) => route.abort())
      const page = await context.newPage()
      try {
        await page.setContent(articleShell(css))
        const result = await measure(page, index, spec)
        const { initial, middle, end, marker } = result
        const mobile = width < 768
        expect(initial.viewportOverflow, 'table scroll must not widen the page').toBe(false)
        expect(initial.overflowX).toBe('auto')
        expect(initial.tabIndex, 'scroll region should be focusable').toBe(0)
        for (const label of initial.labels) {
          expect(label.colSpan, label.text).toBe(1)
          if (mobile) expect(label.position, `${label.text} at ${width}px`).toBe('sticky')
          else expect(label.position, `${label.text} at ${width}px`).not.toBe('sticky')
        }
        for (const moving of initial.moving) expect(moving.position, moving.text).not.toBe('sticky')
        if (index === 1) {
          expect(initial.labels.map((label) => label.rowSpan)).toEqual([2, 2])
          expect(initial.moving.find((cell) => cell.text === 'Category heading')).toMatchObject({ colSpan: 5, scope: 'rowgroup' })
          expect(initial.moving.find((cell) => cell.text === 'Wide lead')?.colSpan).toBe(2)
        }
        if (index === 2) expect(initial.labels.map((label) => label.tag)).toEqual(['td', 'td'])

        // The naturally 3-column fixture fits the actual article column at
        // larger widths. Wider real tables still overflow at every breakpoint.
        if (index !== 0 || width <= 375) expect(initial.maxScroll).toBeGreaterThan(10)
        if (initial.maxScroll <= 1) return
        expect(middle.scrollLeft).toBeGreaterThan(0)
        expect(end.scrollLeft).toBeCloseTo(initial.maxScroll, 0)
        for (const state of [middle, end]) {
          initial.labels.forEach((label, labelIndex) => {
            const current = state.labels[labelIndex]
            const expectedLeft = mobile ? label.left : label.left - state.scrollLeft
            expect(Math.abs(current.left - expectedLeft), `${label.text}: left at ${width}px scroll ${state.scrollLeft}, inset ${label.leftInset}`).toBeLessThanOrEqual(tolerance)
            if (mobile) {
              expect(current.left).toBeGreaterThanOrEqual(state.clip.left - tolerance)
              expect(current.right).toBeLessThanOrEqual(state.clip.right + tolerance)
              expect(current.text.left).toBeGreaterThanOrEqual(state.clip.left - tolerance)
              expect(current.text.right).toBeLessThanOrEqual(state.clip.right + tolerance)
              expect(current.textOnTop, `${label.text} remains readable`).toBe(true)
              expect(current.overlap, `${label.text} overlaps a scrolling cell`).toBe(true)
              expect(current.overlapOnTop, `${label.text} paints over the scrolling cell`).toBe(true)
              expect(current.backgroundAlpha, `${label.text} needs an opaque background, got ${current.background}`).toBe(255)
              expect(current.opacity).toBe('1')
            }
          })
          initial.moving.forEach((cell, cellIndex) => {
            expect(Math.abs(state.moving[cellIndex].left - (cell.left - state.scrollLeft)), `${cell.text} must scroll normally`).toBeLessThanOrEqual(tolerance)
          })
        }
        expect(end.last.right).toBeLessThanOrEqual(end.clip.right + tolerance)
        expect(end.last.right).toBeGreaterThan(end.clip.left)
        if (mobile && index === 0) {
          expect(end.last.left, 'a comparison column should fit beside the pinned label').toBeGreaterThanOrEqual(end.labels[0].right - tolerance)
        }
        expect(marker.scrollLeft).toBeGreaterThan(0)
        expect(marker.right).toBeLessThanOrEqual(marker.clip.right + tolerance)
        expect(marker.left).toBeGreaterThanOrEqual(marker.availableLeft - tolerance)
        expect(marker.hit, 'last-column text is accessible and not hidden behind a label').toBe(true)
      } finally {
        await context.close()
      }
    }, 30000)
  }

  it('scrolls multiple tables independently in the same static article', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 900 }, javaScriptEnabled: false })
    await context.route('**/*', (route) => route.abort())
    const page = await context.newPage()
    try {
      await page.setContent(articleShell(css))
      const result = await page.evaluate(() => {
        const regions = [...document.querySelectorAll<HTMLElement>('[role="region"]')]
        if (regions.length !== 3) throw new Error(`Expected three tables, found ${regions.length}`)
        regions.forEach((region) => { region.scrollLeft = 0 })
        regions[1].scrollLeft = regions[1].scrollWidth
        const afterSecond = regions.map((region) => region.scrollLeft)
        regions[2].scrollLeft = regions[2].scrollWidth / 2
        return { afterSecond, afterThird: regions.map((region) => region.scrollLeft) }
      })
      expect(result.afterSecond[0]).toBe(0)
      expect(result.afterSecond[1]).toBeGreaterThan(0)
      expect(result.afterSecond[2]).toBe(0)
      expect(result.afterThird[0]).toBe(0)
      expect(result.afterThird[1]).toBe(result.afterSecond[1])
      expect(result.afterThird[2]).toBeGreaterThan(0)
    } finally {
      await context.close()
    }
  }, 30000)
})
