import { existsSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { chromium, webkit, type Browser, type BrowserContext, type Page } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Chromium and WebKit simulations are not physical-device or iOS Safari tests;
// they cannot reproduce actual browser chrome, pinch zoom, or device hardware.
const desktopWidths = [768, 1024, 1440]
const portraitViewports = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
]
const fadeSelector = '[data-testid="article-reading-fade"]'
const endSelector = '[data-testid="article-reading-end"]'
const anchorSelector = '[data-testid="article-fade-viewport-anchor"]'
const fixtureImage = Buffer.from('UklGRjwAAABXRUJQVlA4IDAAAABQAwCdASooADIAPm02mEkkIyKhIqgAgA2JaQAAE/GOHwhFgAD+9imd6uw8gAAAAAA=', 'base64')
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : chromium.executablePath())
const engines = [
  { name: 'Chromium', available: existsSync(chromiumPath), launch: () => chromium.launch({ executablePath: chromiumPath, headless: true, args: ['--no-sandbox'] }) },
  { name: 'WebKit', available: existsSync(webkit.executablePath()), launch: () => webkit.launch({ headless: true }) },
]

type ViewportHarness = {
  set: (height: number | null, offsetTop: number, event: 'resize' | 'scroll') => void
  setFixedShift: (shift: number) => void
  counts: () => { scroll: number; resize: number }
}

declare global {
  interface Window { __fadeViewport: ViewportHarness }
}

// A controllable EventTarget is installed before React mounts. It simulates
// changes in visual viewport dimensions/offset without changing the layout
// viewport; its event listener bookkeeping also tests unmount cleanup.
async function installVisualViewport(context: BrowserContext) {
  await context.addInitScript(() => {
    let height: number | null = null
    let offsetTop = 0
    let fixedShift = 0
    const target = new EventTarget()
    const listeners = { scroll: new Set<EventListenerOrEventListenerObject>(), resize: new Set<EventListenerOrEventListenerObject>() }
    const add = target.addEventListener.bind(target)
    const remove = target.removeEventListener.bind(target)
    target.addEventListener = (type, listener, options) => {
      if (listener && (type === 'scroll' || type === 'resize')) listeners[type].add(listener)
      add(type, listener, options)
    }
    target.removeEventListener = (type, listener, options) => {
      if (listener && (type === 'scroll' || type === 'resize')) listeners[type].delete(listener)
      remove(type, listener, options)
    }
    Object.defineProperties(target, {
      height: { get: () => height ?? window.innerHeight },
      width: { get: () => window.innerWidth },
      offsetTop: { get: () => offsetTop },
      offsetLeft: { get: () => 0 },
      pageTop: { get: () => window.scrollY + offsetTop },
      pageLeft: { get: () => window.scrollX },
      scale: { get: () => 1 },
    })
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: target })
    // Simulate a browser repositioning *both* fixed elements before the
    // correction is applied. This changes reported geometry, not the pixels;
    // the independent unmocked screenshot tests verify actual paint ordering.
    const rect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      const r = rect.call(this)
      const id = this.getAttribute('data-testid')
      return fixedShift && (id === 'article-reading-fade' || id === 'article-fade-viewport-anchor')
        ? new DOMRect(r.x, r.y + fixedShift, r.width, r.height) : r
    }
    window.__fadeViewport = {
      set: (nextHeight, nextOffset, event) => {
        height = nextHeight
        offsetTop = nextOffset
        target.dispatchEvent(new Event(event))
      },
      setFixedShift: (shift) => { fixedShift = shift },
      counts: () => ({ scroll: listeners.scroll.size, resize: listeners.resize.size }),
    }
  })
}

async function openFixture(browser: Browser, origin: string, width: number, options: { height?: number; touch?: boolean; motion?: 'reduce' | 'no-preference'; mockViewport?: boolean; noViewport?: boolean } = {}) {
  // WebKit's desktop builds vary in mobile emulation support. hasTouch gives
  // both engines the coarse pointer needed by the landscape-phone media query.
  const context = await browser.newContext({
    viewport: { width, height: options.height ?? 600 },
    deviceScaleFactor: 1,
    reducedMotion: options.motion ?? 'reduce',
    hasTouch: options.touch ?? false,
    ...(options.touch && browser.browserType().name() === 'chromium' ? { isMobile: true } : {}),
  })
  if (options.mockViewport) await installVisualViewport(context)
  if (options.noViewport) await context.addInitScript(() => Object.defineProperty(window, 'visualViewport', { configurable: true, value: null }))
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    // Fonts, CDN assets, and CMS are deliberately blocked. Local image fixtures
    // preserve the real image sizing and load/zoom behavior.
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/__fade_fixture') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/server/fixtures/article-bottom-fade-browser.tsx"></script></body></html>' })
    if (url.pathname.startsWith('/__fade_images/')) return route.fulfill({ contentType: 'image/webp', body: fixtureImage })
    return route.continue()
  })
  const page = await context.newPage()
  await page.goto(`${origin}/__fade_fixture`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Fade fixture guide', exact: true }).waitFor()
  await page.locator(fadeSelector).waitFor({ state: 'attached' })
  await page.locator(endSelector).waitFor({ state: 'attached' })
  return { context, page }
}

async function waitForFade(page: Page, visible: boolean) {
  await page.waitForFunction(({ selector, visible }) => {
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) return false
    const style = getComputedStyle(el)
    return visible ? Number(style.opacity) > 0.98 && style.visibility === 'visible' : Number(style.opacity) < 0.02 || style.visibility === 'hidden'
  }, { selector: fadeSelector, visible }, { timeout: 3000 })
}

async function scrollToReading(page: Page) {
  await page.getByText('Fade fixture introduction', { exact: true }).evaluate((p) => {
    window.scrollTo({ top: window.scrollY + p.getBoundingClientRect().top - 140, behavior: 'instant' })
  })
  await waitForFade(page, true)
}

async function expectSuppressedWhileReading(page: Page) {
  // The scroll listener remains active and sets inline opacity to 1. The CSS
  // display rule must still suppress the overlay rather than merely hiding an
  // otherwise inactive fade at the top or bottom of the article.
  await waitForFade(page, true)
  const g = await geometry(page)
  expect(g.hasFadeClass).toBe(true)
  expect(g.inlineOpacity).toBe('1')
  expect(g.opacity).toBeGreaterThan(0.98)
  expect(g.display).toBe('none')
  expect(g.fade.width).toBe(0)
  expect(g.fade.height).toBe(0)
  expect(g.ariaHidden).toBe('true')
}

async function scrollEndTo(page: Page, delta: number) {
  // The zero-height sentinel is just after end matter. A positive delta is
  // below the visual viewport; 8px is the specified release threshold.
  await page.locator(endSelector).evaluate((end, offset) => {
    const viewport = window.visualViewport
    const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
    window.scrollTo({ top: window.scrollY + end.getBoundingClientRect().top - bottom - offset, behavior: 'instant' })
  }, delta)
  await page.waitForFunction(({ selector, delta }) => {
    const end = document.querySelector(selector)
    const viewport = window.visualViewport
    const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
    return !!end && Math.abs(end.getBoundingClientRect().top - bottom - delta) < 2
  }, { selector: endSelector, delta })
}

async function geometry(page: Page) {
  return page.evaluate(({ fadeSelector, endSelector, anchorSelector }) => {
    const fade = document.querySelector<HTMLElement>(fadeSelector)!
    const anchor = document.querySelector<HTMLElement>(anchorSelector)!
    const end = document.querySelector<HTMLElement>(endSelector)!
    const intro = [...document.querySelectorAll('p')].find((p) => p.textContent === 'Fade fixture introduction')!
    const body = intro.parentElement!.parentElement!
    const hero = [...document.querySelectorAll('h1')].find((h) => h.textContent === 'Fade fixture guide')!.closest('section')!
    const box = (element: Element) => {
      const r = element.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
    }
    const style = getComputedStyle(fade)
    return {
      fade: box(fade), body: box(body), hero: box(hero), end: box(end), anchor: box(anchor),
      position: style.position, anchorPosition: getComputedStyle(anchor).position,
      pointerEvents: style.pointerEvents, opacity: Number(style.opacity), visibility: style.visibility,
      display: style.display, inlineOpacity: fade.style.opacity, hasFadeClass: fade.classList.contains('article-reading-fade'),
      visualBottom: window.visualViewport ? window.visualViewport.offsetTop + window.visualViewport.height : window.innerHeight,
      innerHeight: window.innerHeight, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
      ariaHidden: fade.getAttribute('aria-hidden'),
    }
  }, { fadeSelector, endSelector, anchorSelector })
}

function expectAligned(g: Awaited<ReturnType<typeof geometry>>) {
  expect(g.position).toBe('fixed')
  expect(g.anchorPosition).toBe('fixed')
  expect(g.pointerEvents).toBe('none')
  expect(g.ariaHidden).toBe('true')
  expect(g.hasFadeClass).toBe(true)
  expect(g.display).not.toBe('none')
  expect(g.fade.height).toBeGreaterThan(0)
  expect(Math.abs(g.fade.bottom - g.visualBottom), 'fade bottom must coincide with the *visible* viewport bottom').toBeLessThanOrEqual(1.5)
  expect(Math.abs(g.fade.left - g.body.left), 'fade left must match the article column').toBeLessThanOrEqual(1.5)
  expect(Math.abs(g.fade.right - g.body.right), 'fade right must match the article column, not the sidebar or viewport').toBeLessThanOrEqual(1.5)
  expect(g.scrollWidth).toBeLessThanOrEqual(g.innerWidth + 1)
}

// Compare actual painted pixels with the fade temporarily suppressed. Hit tests
// alone cannot establish painting order because the fade ignores pointer events.
async function paintedDifference(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const withFade = await page.screenshot({ clip, animations: 'disabled' })
  await page.locator(fadeSelector).evaluate((el: HTMLElement) => { el.style.setProperty('visibility', 'hidden', 'important') })
  const withoutFade = await page.screenshot({ clip, animations: 'disabled' })
  await page.locator(fadeSelector).evaluate((el: HTMLElement) => { el.style.removeProperty('visibility'); el.style.visibility = 'visible' })
  return page.evaluate(async ([a, b]) => {
    const pixels = async (src: string) => {
      const image = new Image()
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Screenshot decode failed')); image.src = src })
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(image, 0, 0)
      return ctx.getImageData(0, 0, image.width, image.height).data
    }
    const first = await pixels(a)
    const second = await pixels(b)
    let sum = 0
    let changed = 0
    let firstBrightness = 0
    for (let i = 0; i < first.length; i += 4) {
      const difference = Math.abs(first[i] - second[i]) + Math.abs(first[i + 1] - second[i + 1]) + Math.abs(first[i + 2] - second[i + 2])
      sum += difference
      firstBrightness += first[i] + first[i + 1] + first[i + 2]
      if (difference > 9) changed++
    }
    return { meanRgbDifference: sum / (first.length / 4), meanBrightness: firstBrightness / (first.length / 4 * 3), changed }
  }, [`data:image/png;base64,${withFade.toString('base64')}`, `data:image/png;base64,${withoutFade.toString('base64')}`])
}

for (const engine of engines) {
  describe.skipIf(!engine.available)(`hydrated article reading fade (${engine.name})`, () => {
    let server: ViteDevServer
    let browser: Browser
    let origin: string

    beforeAll(async () => {
      server = await createServer({ configFile: false, root: resolve(import.meta.dirname, '..'), logLevel: 'silent', plugins: [react(), tailwindcss()], server: { host: '127.0.0.1', port: 0, hmr: false } })
      await server.listen()
      origin = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`
      browser = await engine.launch()
    }, 30000)
    afterAll(async () => { await browser?.close(); await server?.close() })

    it.each(desktopWidths)('starts off the hero, tracks the reading column and responds to viewport resizing at %ipx', async (width) => {
      const { page, context } = await openFixture(browser, origin, width)
      try {
        await waitForFade(page, false)
        const initial = await geometry(page)
        expect(initial.hero.bottom).toBeGreaterThan(initial.visualBottom)
        expect(initial.body.top).toBeGreaterThan(initial.visualBottom)
        expect(initial.visibility === 'hidden' || initial.opacity < 0.02, 'fade must not paint over the hero').toBe(true)
        await scrollToReading(page)
        let current = await geometry(page)
        expect(current.end.top).toBeGreaterThan(current.visualBottom + 8)
        expectAligned(current)
        expect(current.opacity).toBeGreaterThan(0.98)

        // Height and width changes are independent; the fade should realign to
        // the recomputed column, not retain stale dimensions from its first render.
        await page.setViewportSize({ width, height: 720 })
        await page.waitForFunction((selector) => Math.abs(document.querySelector(selector)!.getBoundingClientRect().bottom - innerHeight) < 1.5, fadeSelector)
        current = await geometry(page)
        expectAligned(current)
        expect(current.opacity).toBeGreaterThan(0.98)
        const resizedWidth = width === 1440 ? 1024 : width === 768 ? 1024 : 768
        await page.setViewportSize({ width: resizedWidth, height: 720 })
        await page.waitForFunction((selector) => {
          const intro = [...document.querySelectorAll('p')].find((p) => p.textContent === 'Fade fixture introduction')!
          const body = intro.parentElement!.parentElement!.getBoundingClientRect()
          const fade = document.querySelector(selector)!.getBoundingClientRect()
          return Math.abs(fade.left - body.left) < 1.5 && Math.abs(fade.right - body.right) < 1.5
        }, fadeSelector)
        current = await geometry(page)
        expect(current.innerWidth).toBe(resizedWidth)
        expectAligned(current)
        expect(current.opacity).toBeGreaterThan(0.98)
      } finally { await context.close() }
    }, 30000)

    it('uses the >8px end threshold, follows expanded end matter, and returns while scrolling back', async () => {
      const { page, context } = await openFixture(browser, origin, 1024)
      try {
        await scrollToReading(page)
        expect(await page.locator('section[aria-label="Article resources"]').count()).toBe(1)
        const sentinelAfterResources = await page.locator(endSelector).evaluate((end) => {
          const resources = document.querySelector('section[aria-label="Article resources"]')!
          return Boolean(resources.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING)
        })
        expect(sentinelAfterResources).toBe(true)
        await scrollEndTo(page, 10)
        await waitForFade(page, true)
        expect((await geometry(page)).end.top - (await geometry(page)).visualBottom).toBeGreaterThan(8)
        await scrollEndTo(page, 6)
        await waitForFade(page, false)
        expect((await geometry(page)).end.top - (await geometry(page)).visualBottom).toBeLessThanOrEqual(8)
        await page.getByText('Sources', { exact: true }).click()
        await page.waitForFunction((selector) => document.querySelector(selector)!.getBoundingClientRect().top > innerHeight + 50, endSelector)
        await waitForFade(page, true)
        await scrollEndTo(page, -20)
        await waitForFade(page, false)
        await scrollEndTo(page, 40)
        await waitForFade(page, true)
      } finally { await context.close() }
    }, 30000)

    it('tracks simulated visualViewport resize and scroll without a layout viewport change', async () => {
      const { page, context } = await openFixture(browser, origin, 1024, { mockViewport: true })
      try {
        await scrollToReading(page)
        const initial = await geometry(page)
        expect(Math.abs(initial.anchor.bottom - initial.innerHeight)).toBeLessThanOrEqual(1.5)
        const counts = await page.evaluate(() => window.__fadeViewport.counts())
        expect(counts.scroll).toBeGreaterThan(0)
        expect(counts.resize).toBeGreaterThan(0)
        await page.evaluate(() => window.__fadeViewport.set(430, 35, 'resize'))
        await page.waitForFunction((selector) => Math.abs(document.querySelector(selector)!.getBoundingClientRect().bottom - 465) < 1.5, fadeSelector)
        let current = await geometry(page)
        expect(current.innerHeight).toBe(initial.innerHeight)
        expect(current.visualBottom).toBe(465)
        expectAligned(current)
        await page.evaluate(() => window.__fadeViewport.set(430, 75, 'scroll'))
        await page.waitForFunction((selector) => Math.abs(document.querySelector(selector)!.getBoundingClientRect().bottom - 505) < 1.5, fadeSelector)
        current = await geometry(page)
        expectAligned(current)
        expect(current.opacity).toBeGreaterThan(0.98)

        await page.evaluate(() => { window.__fadeViewport.setFixedShift(-35); window.__fadeViewport.set(430, 75, 'scroll') })
        await page.waitForFunction((selector) => Math.abs(document.querySelector(selector)!.getBoundingClientRect().bottom - 505) < 1.5, fadeSelector)
        current = await geometry(page)
        expect(Math.abs(current.anchor.bottom - (current.innerHeight - 35))).toBeLessThanOrEqual(1.5)
        expectAligned(current)

        // Changing only the visual viewport can also cross the end threshold.
        await scrollEndTo(page, 20)
        await waitForFade(page, true)
        await page.evaluate(() => window.__fadeViewport.set(455, 75, 'resize'))
        await waitForFade(page, false)
        expect((await geometry(page)).end.top).toBeLessThan((await geometry(page)).visualBottom + 8)
        await page.evaluate(() => window.__fadeViewport.set(455, 35, 'scroll'))
        await waitForFade(page, true)
        expectAligned(await geometry(page))
      } finally { await context.close() }
    }, 30000)

    it('falls back to the layout viewport when visualViewport is unavailable', async () => {
      const { page, context } = await openFixture(browser, origin, 1024, { noViewport: true })
      try {
        expect(await page.evaluate(() => window.visualViewport)).toBeNull()
        await scrollToReading(page)
        expectAligned(await geometry(page))
        await page.setViewportSize({ width: 1024, height: 720 })
        await page.waitForFunction((selector) => Math.abs(document.querySelector(selector)!.getBoundingClientRect().bottom - innerHeight) < 1.5, fadeSelector)
        expectAligned(await geometry(page))
        await scrollEndTo(page, 6)
        await waitForFade(page, false)
      } finally { await context.close() }
    }, 30000)

    it.each(portraitViewports)('suppresses the fade while scrolling at simulated touch portrait $width x $height', async ({ width, height }) => {
      const { page, context } = await openFixture(browser, origin, width, { height, touch: true })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
        expect((await geometry(page)).display).toBe('none')
        await scrollToReading(page)
        await expectSuppressedWhileReading(page)
        // Check again farther through the body, not just at one scroll position.
        await page.getByRole('heading', { name: 'Fixture section 3' }).evaluate((heading) => {
          window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - 140, behavior: 'instant' })
        })
        await expectSuppressedWhileReading(page)
      } finally { await context.close() }
    }, 30000)

    it('suppresses the fade in simulated touch landscape 844 x 390 while scrolling', async () => {
      const { page, context } = await openFixture(browser, origin, 844, { height: 390, touch: true })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches && matchMedia('(orientation: landscape)').matches)).toBe(true)
        await scrollToReading(page)
        await expectSuppressedWhileReading(page)
        await page.getByRole('heading', { name: 'Fixture section 3' }).evaluate((heading) => {
          window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - 120, behavior: 'instant' })
        })
        await expectSuppressedWhileReading(page)
      } finally { await context.close() }
    }, 30000)

    it.each([{ width: 768, height: 1024 }, { width: 1024, height: 768 }])('retains the fade for a simulated coarse-pointer tablet at $width x $height', async ({ width, height }) => {
      const { page, context } = await openFixture(browser, origin, width, { height, touch: true })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
        await scrollToReading(page)
        const g = await geometry(page)
        expectAligned(g)
        expect(g.inlineOpacity).toBe('1')
      } finally { await context.close() }
    }, 30000)

    it('retains the fade in a narrow fine-pointer desktop window', async () => {
      const { page, context } = await openFixture(browser, origin, 390, { height: 844 })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: fine)').matches && !matchMedia('(pointer: coarse)').matches)).toBe(true)
        await scrollToReading(page)
        expectAligned(await geometry(page))
      } finally { await context.close() }
    }, 30000)

    it('updates immediately across simulated rotations and media-query boundaries without a phone white band', async () => {
      const { page, context } = await openFixture(browser, origin, 390, { height: 844, touch: true })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
        await scrollToReading(page)
        await expectSuppressedWhileReading(page)
        const sizes = [
          { width: 844, height: 390, hidden: true },
          { width: 767, height: 900, hidden: true },
          { width: 768, height: 900, hidden: false },
          { width: 768, height: 600, hidden: true },
          { width: 768, height: 601, hidden: false },
          { width: 1023, height: 600, hidden: true },
          { width: 1024, height: 600, hidden: false },
          { width: 390, height: 844, hidden: true },
        ]
        for (const { width, height, hidden } of sizes) {
          await page.setViewportSize({ width, height })
          // CSS must apply at the viewport change, independently of the next
          // scroll update or any stale inline opacity from the prior state.
          const display = await page.locator(fadeSelector).evaluate((el) => getComputedStyle(el).display)
          expect(display === 'none', `${width}x${height} suppression immediately after resize`).toBe(hidden)
          await scrollToReading(page)
          if (hidden) {
            await expectSuppressedWhileReading(page)
            const difference = await paintedDifference(page, { x: Math.floor(width / 2) - 10, y: height - 30, width: 20, height: 20 })
            expect(difference.changed, `${width}x${height}: explicitly hiding the fade must not change any painted pixels`).toBe(0)
          } else {
            expectAligned(await geometry(page))
          }
        }
      } finally { await context.close() }
    }, 30000)

    it('keeps the simulated mobile sticky table scrollable and unobscured', async () => {
      const { page, context } = await openFixture(browser, origin, 375, { height: 812, touch: true })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
        const label = page.locator('th').filter({ hasText: 'Fade pinned label' })
        await label.evaluate((cell) => {
          window.scrollTo({ top: window.scrollY + cell.getBoundingClientRect().top - (innerHeight - 105), behavior: 'instant' })
          cell.closest<HTMLElement>('[role="region"]')!.scrollLeft = 120
        })
        await expectSuppressedWhileReading(page)
        const overlap = await label.evaluate((cell) => {
          const r = cell.getBoundingClientRect()
          const region = cell.closest<HTMLElement>('[role="region"]')!
          const x = Math.floor(r.left + 8)
          const y = innerHeight - 40
          const hit = document.elementFromPoint(x, y)
          return { position: getComputedStyle(cell).position, scrollLeft: region.scrollLeft, right: r.right, top: r.top, bottom: r.bottom, x, y, innerHeight, hitCell: !!hit && (hit === cell || cell.contains(hit)) }
        })
        expect(overlap.position).toBe('sticky')
        expect(overlap.scrollLeft).toBeGreaterThan(20)
        expect(overlap.top).toBeLessThan(overlap.y)
        expect(overlap.bottom).toBeGreaterThan(overlap.innerHeight)
        expect(overlap.hitCell).toBe(true)
        const difference = await paintedDifference(page, { x: overlap.x, y: overlap.y, width: Math.min(80, Math.floor(overlap.right - overlap.x - 4)), height: 30 })
        expect(difference.changed, 'the hidden fade must paint no white band over the label').toBe(0)
      } finally { await context.close() }
    }, 30000)

    it('preserves desktop fade paint over content while remaining click-through', async () => {
      const { page, context } = await openFixture(browser, origin, 1024)
      try {
        const label = page.locator('th').filter({ hasText: 'Fade pinned label' })
        await label.evaluate((cell) => window.scrollTo({ top: window.scrollY + cell.getBoundingClientRect().top - (innerHeight - 105), behavior: 'instant' }))
        await waitForFade(page, true)
        expectAligned(await geometry(page))
        const overlap = await label.evaluate((cell) => {
          const r = cell.getBoundingClientRect()
          const x = Math.floor(r.left + 8)
          const y = innerHeight - 40
          const hit = document.elementFromPoint(x, y)
          return { x, y, right: r.right, top: r.top, bottom: r.bottom, hitCell: !!hit && (hit === cell || cell.contains(hit)) }
        })
        expect(overlap.top).toBeLessThan(overlap.y)
        expect(overlap.bottom).toBeGreaterThan(600)
        expect(overlap.hitCell).toBe(true)
        const difference = await paintedDifference(page, { x: overlap.x, y: overlap.y, width: Math.min(80, Math.floor(overlap.right - overlap.x - 4)), height: 30 })
        expect(difference.changed, 'the desktop gradient must still paint over article content').toBeGreaterThan(20)
      } finally { await context.close() }
    }, 30000)

    it('keeps the real simulated mobile menu and lightbox functional without the fade', async () => {
      const { page, context } = await openFixture(browser, origin, 375, { height: 812, touch: true })
      try {
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
        await scrollToReading(page)
        await expectSuppressedWhileReading(page)
        await page.getByRole('button', { name: 'Open menu' }).click()
        await page.locator('[role="dialog"][aria-hidden="false"]').waitFor()
        await expectSuppressedWhileReading(page)
        await page.getByRole('button', { name: 'Close menu' }).click()
        await page.locator('[role="dialog"][aria-hidden="false"]').waitFor({ state: 'hidden' })
        // The dialog's aria-hidden state changes before its exit animation ends.
        await page.waitForTimeout(650)
        await page.getByRole('button', { name: 'Zoom image' }).click()
        await page.getByRole('button', { name: 'Close', exact: true }).waitFor()
        await expectSuppressedWhileReading(page)
        await page.waitForTimeout(650)
        const difference = await paintedDifference(page, { x: 30, y: 792, width: 20, height: 10 })
        expect(difference.changed, 'the suppressed fade must not alter the lightbox').toBe(0)
        expect(difference.meanBrightness, 'the lightbox backdrop must remain dark').toBeLessThan(40)
        await page.getByRole('button', { name: 'Close', exact: true }).click()
        expect(await page.getByRole('button', { name: 'Close', exact: true }).count()).toBe(0)
      } finally { await context.close() }
    }, 30000)

    it('animates opacity rather than abruptly cutting off the fade', async () => {
      const { page, context } = await openFixture(browser, origin, 1024, { motion: 'no-preference' })
      try {
        await waitForFade(page, false)
        const transition = await page.locator(fadeSelector).evaluate((el) => ({ property: getComputedStyle(el).transitionProperty, duration: getComputedStyle(el).transitionDuration }))
        expect(transition.property).toMatch(/opacity|all/)
        expect(transition.duration).not.toMatch(/^(0s|0ms)$/)
        await page.getByText('Fade fixture introduction', { exact: true }).evaluate((p) => {
          window.scrollTo({ top: window.scrollY + p.getBoundingClientRect().top - 140, behavior: 'instant' })
        })
        await page.waitForFunction((selector) => {
          const style = getComputedStyle(document.querySelector(selector)!)
          return style.visibility === 'visible' && Number(style.opacity) > 0.02 && Number(style.opacity) < 0.98
        }, fadeSelector, { timeout: 2000 })
        await waitForFade(page, true)
        // Capture frames in the page itself so round-trips to a busy WebKit
        // process cannot miss the 500ms transition between separate reads.
        const releaseSamples = await page.evaluate(async ({ fadeSelector, endSelector }) => {
          const fade = document.querySelector<HTMLElement>(fadeSelector)!
          const end = document.querySelector(endSelector)!
          const viewport = window.visualViewport
          const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
          const samples: { opacity: number; visibility: string }[] = []
          window.scrollTo({ top: window.scrollY + end.getBoundingClientRect().top - bottom - 4, behavior: 'instant' })
          const deadline = performance.now() + 2000
          return await new Promise<typeof samples>((resolve) => {
            const sample = () => {
              const style = getComputedStyle(fade)
              samples.push({ opacity: Number(style.opacity), visibility: style.visibility })
              if (Number(style.opacity) < 0.02 || performance.now() > deadline) resolve(samples)
              else requestAnimationFrame(sample)
            }
            requestAnimationFrame(sample)
          })
        }, { fadeSelector, endSelector })
        expect(releaseSamples.some(({ opacity, visibility }) => opacity > 0.02 && opacity < 0.98 && visibility === 'visible'), 'opacity should visibly interpolate on release').toBe(true)
        await waitForFade(page, false)
      } finally { await context.close() }
    }, 30000)

    it('removes the overlay, anchor, and visualViewport listeners on route exit', async () => {
      const { page, context } = await openFixture(browser, origin, 1024, { mockViewport: true })
      try {
        await scrollToReading(page)
        expect((await page.evaluate(() => window.__fadeViewport.counts())).scroll).toBeGreaterThan(0)
        await page.locator('header a[href="/"]:visible').click()
        await page.getByRole('heading', { name: 'Fixture route exit' }).waitFor()
        expect(await page.locator(fadeSelector).count()).toBe(0)
        expect(await page.locator(endSelector).count()).toBe(0)
        expect(await page.locator(anchorSelector).count()).toBe(0)
        expect(await page.evaluate(() => window.__fadeViewport.counts())).toEqual({ scroll: 0, resize: 0 })
        await page.evaluate(() => { window.__fadeViewport.set(410, 30, 'resize'); window.__fadeViewport.set(410, 40, 'scroll') })
        expect(await page.locator(fadeSelector).count()).toBe(0)
        // Returning should establish only one overlay and reattach listeners.
        await page.getByRole('link', { name: 'Return to guide' }).click()
        await page.locator(fadeSelector).waitFor({ state: 'attached' })
        expect(await page.locator(fadeSelector).count()).toBe(1)
        expect((await page.evaluate(() => window.__fadeViewport.counts())).resize).toBeGreaterThan(0)
      } finally { await context.close() }
    }, 30000)
  })
}
