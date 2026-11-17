import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { existsSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { chromium, type Browser } from 'playwright'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createServer, type ViteDevServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ArticleBody } from '../src/pages/Article'
import type { ArticleBlock } from '../src/lib/content'
import { toArticleDoc } from '../src/sanity/mappers'
import type { CmsPortableBlock, CmsPost } from '../src/sanity/types'

vi.hoisted(() => {
  vi.stubEnv('VITE_SANITY_PROJECT_ID', 'editorialtest')
  vi.stubEnv('VITE_SANITY_DATASET', 'production')
})
const desktop = 'image-0df3fc7b885df0685b0863614a7399bc620391f7-1600x2000-webp'
const mobile = 'image-67a0171c595b2a56ed79620ae8a08323ef8fa223-1080x2272-jpg'
const mapImage = (image: CmsPortableBlock) => {
  const doc = toArticleDoc({ _id: 'post-test', slug: 'test', title: 'Test', excerpt: 'Excerpt', heroImage: { mainImage: { asset: { _ref: desktop } } }, body: [image] } as CmsPost)
  if (!doc || doc.body[0]?.type !== 'image') throw new Error('Expected mapped image')
  return doc.body[0]
}
const heading: ArticleBlock = { type: 'h2', text: 'First heading', toc: 'First heading' }
const editorial: ArticleBlock = { type: 'image', src: '/portrait.webp', alt: 'Portrait alt', displayStyle: 'editorial', caption: 'Hidden caption', note: 'Hidden note', mobileSrc: '/ignored.webp' }
const standard: ArticleBlock = { type: 'image', src: '/diagram.webp', alt: 'Diagram alt', caption: 'Diagram caption', note: 'Diagram note', mobileSrc: '/diagram-mobile.webp' }
const render = (body: ArticleBlock[]) => renderToStaticMarkup(createElement(ArticleBody, {
  intro: [{ type: 'p', text: 'Intro text' }], body, onZoom: () => {}, galleryIndexOf: () => 0,
}))
const dividers = (html: string) => (html.match(/class="h-px w-full bg-\[#abb7b1\]\/20"/g) ?? []).length

describe('editorial native inline image mapping and rendering', () => {
  it('opts in only for the exact editorial value while retaining the image, alt and other fields', () => {
    const source: CmsPortableBlock = { _type: 'image', asset: { _ref: desktop }, mobileImage: { asset: { _ref: mobile } }, alt: 'Portrait', caption: 'Stored caption', note: 'Stored note' }
    const photo = mapImage({ ...source, displayStyle: 'editorial' })
    expect(photo).toMatchObject({ type: 'image', alt: 'Portrait', displayStyle: 'editorial', caption: 'Stored caption', note: 'Stored note' })
    expect(photo.src).toContain('0df3fc7b885df0685b0863614a7399bc620391f7-1600x2000.webp')
    expect(photo.src).toContain('w=1440')
    expect(photo.mobileSrc).toContain('w=900')
    for (const style of [undefined, 'standard', 'unexpected']) {
      const graphic = mapImage({ ...source, displayStyle: style } as CmsPortableBlock)
      expect(graphic.displayStyle).toBeUndefined()
      expect(graphic.src).toBe(photo.src)
      expect(graphic.mobileSrc).toBe(photo.mobileSrc)
    }
  })

  it('places an intro photo before the first H2 without adding an extra divider', () => {
    const html = render([editorial, heading, { type: 'p', text: 'Following text' }, { type: 'h2', text: 'Next heading', toc: 'Next heading' }])
    expect(dividers(html)).toBe(2)
    expect(html.indexOf('Intro text')).toBeLessThan(html.indexOf('alt="Portrait alt"'))
    expect(html.indexOf('alt="Portrait alt"')).toBeLessThan(html.indexOf('First heading'))
    expect(html).toContain('w-full flex-col gap-3 self-center md:max-w-[640px]')
    expect(html).not.toContain('Hidden caption')
    expect(html).not.toContain('Hidden note')
    expect(html).not.toContain('/ignored.webp')
    expect(html).not.toContain('<figcaption')
  })

  it('does not alter divider rules for existing or other leading body structures', () => {
    expect(dividers(render([heading]))).toBe(1)
    expect(dividers(render([standard, heading]))).toBe(2)
    expect(dividers(render([editorial]))).toBe(1)
    expect(dividers(render([{ type: 'p', text: 'Leading paragraph' }, editorial, heading]))).toBe(2)
    const html = render([standard, heading])
    expect(html).toContain('<figure class="flex flex-col gap-3">')
    expect(html).toContain('srcSet="/diagram-mobile.webp"')
    expect(html).toContain('Diagram caption')
    expect(html).toContain('Diagram note')
  })
})

describe.skipIf(!existsSync('/usr/bin/chromium'))('editorial and standard images in Chromium', () => {
  let server: ViteDevServer
  let browser: Browser
  let origin: string
  beforeAll(async () => {
    server = await createServer({ configFile: false, root: resolve(import.meta.dirname, '..'), logLevel: 'silent', plugins: [react(), tailwindcss()], server: { host: '127.0.0.1', port: 0, hmr: false } })
    await server.listen()
    origin = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  }, 30000)
  afterAll(async () => { await browser?.close(); await server?.close() })

  it.each([375, 767, 768, 1440, 1920])('keeps widths, source selection, accessibility and zoom correct at %ipx', async (width) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const requestedImages: string[] = []
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/fixture') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head></head><body><div id="root"></div><script type="module" src="/server/fixtures/article-editorial-browser.tsx"></script></body></html>' })
      if (url.pathname.startsWith('/__images/')) {
        requestedImages.push(url.pathname)
        // A real 40x50 WebP, kept inline so this test requires no network or private assets.
        return route.fulfill({ contentType: 'image/webp', body: Buffer.from('UklGRjwAAABXRUJQVlA4IDAAAABQAwCdASooADIAPm02mEkkIyKhIqgAgA2JaQAAE/GOHwhFgAD+9imd6uw8gAAAAAA=', 'base64') })
      }
      return route.continue()
    })
    const page = await context.newPage()
    try {
      await page.goto(`${origin}/fixture`)
      const photo = page.locator('figure').filter({ has: page.locator('img[alt="Editorial portrait"]') })
      const diagram = page.locator('figure').filter({ has: page.locator('img[alt="Existing diagram"]') })
      await photo.locator('img').waitFor()
      await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('figure img')].every((img) => img.complete && img.naturalWidth > 0))
      const layout = await page.evaluate(() => {
        const photo = document.querySelector<HTMLImageElement>('figure img[alt="Editorial portrait"]')!.closest('figure')!
        const diagram = document.querySelector<HTMLImageElement>('figure img[alt="Existing diagram"]')!.closest('figure')!
        const body = photo.parentElement!.parentElement!
        const rect = (element: Element) => { const r = element.getBoundingClientRect(); return { width: r.width, height: r.height, left: r.left, right: r.right } }
        const sectionChildren = [...body.children].map((section) => [...section.children].map((child) => child.tagName.toLowerCase() + (child.classList.contains('h-px') ? ':divider' : '')))
        return { photo: rect(photo), photoImage: rect(photo.querySelector('img')!), diagram: rect(diagram), body: rect(body), sectionChildren, overflow: document.documentElement.scrollWidth > innerWidth }
      })
      expect(layout.overflow).toBe(false)
      expect(layout.photo.width).toBeCloseTo(width < 768 ? layout.body.width : Math.min(layout.body.width, 640), 0)
      expect(layout.photoImage.width).toBeCloseTo(layout.photo.width, 0)
      expect(layout.photoImage.height / layout.photoImage.width).toBeCloseTo(1.25, 2)
      expect(layout.diagram.width).toBeCloseTo(layout.body.width, 0)
      expect(layout.photo.left + layout.photo.right).toBeCloseTo(layout.body.left + layout.body.right, 0)
      expect(layout.sectionChildren[0]).toEqual(['p'])
      expect(layout.sectionChildren[1]).toEqual(['figure'])
      expect(layout.sectionChildren[2].slice(0, 2)).toEqual(['div:divider', 'h2'])
      expect(layout.sectionChildren[3].slice(0, 2)).toEqual(['div:divider', 'h2'])
      expect(await photo.locator('img').getAttribute('alt')).toBe('Editorial portrait')
      expect(await photo.locator('source').count()).toBe(0)
      expect(await photo.locator('figcaption').count()).toBe(0)
      expect(await photo.textContent()).not.toContain('Editorial caption')
      expect(await photo.textContent()).not.toContain('Editorial note')
      expect(await diagram.locator('figcaption').textContent()).toBe('Existing diagram caption')
      expect(await diagram.textContent()).toContain('Existing diagram note')
      const currentPath = (selector: string) => page.locator(selector).evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname)
      expect(await currentPath('figure img[alt="Editorial portrait"]')).toBe('/__images/editorial.webp')
      expect(await currentPath('figure img[alt="Existing diagram"]')).toBe(width < 768 ? '/__images/diagram-mobile.webp' : '/__images/diagram-desktop.webp')
      expect(requestedImages).not.toContain('/__images/editorial-mobile-must-not-load.webp')

      for (const figure of [photo, diagram]) {
        const background = await figure.getByRole('button', { name: 'Zoom image' }).locator('span').evaluate((element) => getComputedStyle(element).backgroundColor)
        expect(background).toBe('rgba(252, 246, 242, 0.8)')
      }

      await photo.getByRole('button', { name: 'Zoom image' }).click()
      const close = page.getByRole('button', { name: 'Close', exact: true })
      await close.waitFor()
      const overlay = page.locator('div.fixed.inset-0.z-\\[100\\]')
      expect(await overlay.locator('img').getAttribute('alt')).toBe('Editorial portrait')
      expect(await overlay.locator('source').count()).toBe(0)
      expect(await overlay.locator('figcaption').count()).toBe(0)
      await page.waitForFunction(() => document.querySelector<HTMLImageElement>('div.fixed figure img')?.complete)
      expect(new URL(await overlay.getByRole('link', { name: 'Save image' }).getAttribute('href')!, origin).pathname).toBe('/__images/editorial.webp')
      await overlay.getByRole('button', { name: 'Next image' }).click()
      expect(await overlay.locator('img').getAttribute('alt')).toBe('Existing diagram')
      expect(await overlay.locator('figcaption').textContent()).toBe('Existing diagram caption')
      await page.waitForFunction(() => document.querySelector<HTMLImageElement>('div.fixed figure img')?.complete)
      const gallerySrc = await overlay.locator('img').evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname)
      expect(gallerySrc).toBe(width < 768 ? '/__images/diagram-mobile.webp' : '/__images/diagram-desktop.webp')
      await close.click()
      expect(await close.count()).toBe(0)
    } finally {
      await context.close()
    }
  }, 30000)
})
