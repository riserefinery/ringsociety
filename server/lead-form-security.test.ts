import { createElement, StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { existsSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { chromium, type Browser, type BrowserContext, type Page, type Route } from 'playwright'
import react from '@vitejs/plugin-react'
import { createServer, type ViteDevServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import LeadForm from '../src/components/LeadForm'
import Root from '../src/app/Root'
import Article from '../src/pages/Article'
import type { ArticleDoc } from '../src/lib/content'
import { seedCmsArticle } from '../src/sanity/queries'

type Variant = 'compact' | 'contact'
type Mount = 'create' | 'hydrate'

function renderForm(variant: Variant) {
  return renderToString(createElement(StrictMode, null, createElement(LeadForm, {
    variant,
    source: variant === 'contact' ? 'contact' : 'lead-magnet',
    submitLabel: 'Send test',
    successMessage: 'Fixture success',
  })))
}

describe('lead form server-rendered safety', () => {
  it.each<Variant>(['compact', 'contact'])('%s controls are disabled in the initial HTML', (variant) => {
    const html = renderForm(variant)
    const openingForm = html.match(/<form\b[^>]*>/)?.[0]
    expect(openingForm).toContain('method="post"')
    expect(openingForm).toContain('action="/api/lead-capture"')
    expect(html).toContain('noValidate=""')
    const fieldset = html.match(/<fieldset\b[^>]*disabled=""[^>]*>[\s\S]*?<\/fieldset>/)?.[0]
    expect(fieldset).toBeDefined()
    const allControls = html.match(/<(?:input|select|textarea|button)\b[^>]*>/g) ?? []
    const gatedControls = fieldset?.match(/<(?:input|select|textarea|button)\b[^>]*>/g) ?? []
    expect(allControls.length).toBe(variant === 'contact' ? 7 : 5)
    expect(gatedControls).toEqual(allControls)
    expect(fieldset).toContain('name="website"')
    expect(fieldset).toContain('name="firstName"')
    expect(fieldset).toContain('name="lastName"')
    expect(fieldset).toContain('name="email"')
  })

  it('gates the lead-magnet form in the real approved-article SSR shell', () => {
    const doc: ArticleDoc = {
      slug: 'how-to-buy-an-engagement-ring', category: 'Guide', title: 'Synthetic guide',
      subtitle: 'Synthetic excerpt', readTime: '1 minute read', hero: '/fixture.jpg',
      categories: [], keywordTags: [], intro: [], body: [{ type: 'p', text: 'Synthetic body' }],
      related: [], popularRelated: [],
    }
    seedCmsArticle(doc)
    const router = createMemoryRouter([
      { element: createElement(Root), children: [{ path: '/guides/:slug', element: createElement(Article) }] },
    ], { initialEntries: [`/guides/${doc.slug}`] })
    try {
      const html = renderToString(createElement(RouterProvider, { router }))
      const form = html.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0]
      expect(html).toContain('Synthetic body')
      expect(form).toContain('id="lead-magnet-website"')
      expect(form).toMatch(/<fieldset\b[^>]*disabled=""[^>]*>/)
      expect(form).toContain('method="post"')
      expect(form).toContain('action="/api/lead-capture"')
      for (const name of ['firstName', 'lastName', 'email']) expect(form).toContain(`name="${name}"`)
    } finally {
      router.dispose()
    }
  })
})

describe.skipIf(!existsSync('/usr/bin/chromium'))('lead form browser safety (all requests intercepted)', () => {
  let server: ViteDevServer
  let browser: Browser
  let origin: string

  beforeAll(async () => {
    server = await createServer({
      configFile: false,
      root: resolve(import.meta.dirname, '..'),
      logLevel: 'silent',
      plugins: [react()],
      server: { host: '127.0.0.1', port: 0, hmr: false },
    })
    await server.listen()
    const address = server.httpServer?.address() as AddressInfo
    origin = `http://127.0.0.1:${address.port}`
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  }, 30000)

  afterAll(async () => {
    await browser?.close()
    await server?.close()
  })

  async function fixture(variant: Variant, mount: Mount, blocked: boolean, onApi: (route: Route) => Promise<void>, scriptGate?: Promise<void>) {
    const context: BrowserContext = await browser.newContext()
    const urls: string[] = []
    let blockedScripts = 0
    await context.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      urls.push(request.url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/fixture') {
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `<!doctype html><html><head><style>.contents{display:contents}</style></head><body><div id="root" data-variant="${variant}" data-mount="${mount}">${renderForm(variant)}</div><script type="module" src="/server/fixtures/lead-form-browser.tsx"></script></body></html>`,
        })
      }
      // Intercept the endpoint before any local Vite handling: it never reaches the real API.
      if (url.pathname === '/api/lead-capture') return onApi(route)
      if (blocked && request.resourceType() === 'script') {
        blockedScripts++
        return route.abort()
      }
      if (scriptGate && url.pathname === '/server/fixtures/lead-form-browser.tsx') await scriptGate
      // The only network allowed through the interception is local Vite source/module serving.
      if (/^\/(?:server\/fixtures\/lead-form-browser\.tsx|src\/|node_modules\/|@vite\/|@id\/)/.test(url.pathname)) {
        return route.continue()
      }
      return route.abort()
    })
    const page: Page = await context.newPage()
    const pageErrors: string[] = []
    const hydrationErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat|did not match/i.test(message.text())) hydrationErrors.push(message.text())
    })
    await page.goto(`${origin}/fixture`, { waitUntil: scriptGate ? 'commit' : 'load' })
    return { context, page, urls, pageErrors, hydrationErrors, blockedScriptCount: () => blockedScripts }
  }

  function expectNoLeak(urls: string[]) {
    for (const url of urls) {
      expect(url).not.toMatch(/firstName=|lastName=|email=|Ada|Lovelace|ada(?:%40|@)example\.test/i)
    }
  }

  it.each<Variant>(['compact', 'contact'])('%s cannot be operated or submit when its JS bundle is blocked', async (variant) => {
    const apiRequests: string[] = []
    const { context, page, urls, blockedScriptCount } = await fixture(variant, 'create', true, async (route) => {
      apiRequests.push(route.request().url())
      await route.fulfill({ status: 204 })
    })
    try {
      expect(blockedScriptCount()).toBeGreaterThan(0)
      const controls = page.locator('form input, form select, form textarea, form button')
      for (let i = 0; i < await controls.count(); i++) expect(await controls.nth(i).isDisabled()).toBe(true)
      // Populate the DOM despite disabled controls to test what an attempted user submit can expose.
      await page.locator('[name="firstName"]').evaluate((element: HTMLInputElement) => { element.value = 'Ada' })
      await page.locator('[name="lastName"]').evaluate((element: HTMLInputElement) => { element.value = 'Lovelace' })
      await page.locator('[name="email"]').evaluate((element: HTMLInputElement) => { element.value = 'ada@example.test' })
      const box = await page.locator('button').boundingBox()
      if (!box) throw new Error('Expected a visible submit button')
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      expect(page.url()).toBe(`${origin}/fixture`)
      expect(apiRequests).toEqual([])
      expectNoLeak(urls)
    } finally {
      await context.close()
    }
  })

  it('uses POST and excludes disabled values even if native submission is forced before React loads', async () => {
    const requests: { method: string; url: string; body: string | null }[] = []
    const { context, page, urls } = await fixture('compact', 'create', true, async (route) => {
      requests.push({ method: route.request().method(), url: route.request().url(), body: route.request().postData() })
      await route.fulfill({ status: 204 })
    })
    try {
      await page.locator('[name="firstName"]').evaluate((element: HTMLInputElement) => { element.value = 'Ada' })
      await page.locator('[name="lastName"]').evaluate((element: HTMLInputElement) => { element.value = 'Lovelace' })
      await page.locator('[name="email"]').evaluate((element: HTMLInputElement) => { element.value = 'ada@example.test' })
      await page.evaluate(() => document.querySelector<HTMLFormElement>('form')!.requestSubmit())
      await expect.poll(() => requests.length).toBe(1)
      expect(requests[0].method).toBe('POST')
      expect(requests[0].url).toBe(`${origin}/api/lead-capture`)
      expect(requests[0].body || '').toBe('')
      expect(page.url()).toBe(`${origin}/fixture`)
      expectNoLeak(urls)
    } finally {
      await context.close()
    }
  })

  it.each([
    ['compact', 'create'], ['contact', 'hydrate'],
  ] as [Variant, Mount][])('%s stays disabled while the client script is delayed, then enables after %s', async (variant, mount) => {
    let release = () => {}
    const scriptGate = new Promise<void>((resolvePromise) => { release = resolvePromise })
    const apiRequests: string[] = []
    const { context, page, urls, pageErrors, hydrationErrors } = await fixture(variant, mount, false, async (route) => {
      apiRequests.push(route.request().url())
      await route.fulfill({ status: 204 })
    }, scriptGate)
    try {
      await page.locator('[name="firstName"]').waitFor()
      expect(await page.locator('[name="firstName"]').isDisabled()).toBe(true)
      expect(await page.locator('button').isDisabled()).toBe(true)
      release()
      await expect.poll(() => page.locator('[name="firstName"]').isEnabled(), { timeout: 10000 }).toBe(true)
      expect(await page.locator('button').isEnabled()).toBe(true)
      expect(apiRequests).toEqual([])
      expect(page.url()).toBe(`${origin}/fixture`)
      expect(pageErrors).toEqual([])
      expect(hydrationErrors).toEqual([])
      expectNoLeak(urls)
    } finally {
      release()
      await context.close()
    }
  }, 30000)

  it.each([
    ['compact', 'create'], ['compact', 'hydrate'], ['contact', 'create'], ['contact', 'hydrate'],
  ] as [Variant, Mount][])('%s form enables after %s and preserves payload, failure and success behavior', async (variant, mount) => {
    const requests: { method: string; url: string; contentType: string; body: string | null }[] = []
    let release = () => {}
    const pending = new Promise<void>((resolvePromise) => { release = resolvePromise })
    const startedBefore = Date.now()
    const { context, page, urls, pageErrors, hydrationErrors } = await fixture(variant, mount, false, async (route) => {
      const request = route.request()
      requests.push({ method: request.method(), url: request.url(), contentType: request.headers()['content-type'], body: request.postData() })
      if (requests.length === 1) {
        await pending
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Fixture validation failure' }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
      }
    })
    try {
      await expect.poll(() => page.locator('[name="firstName"]').isEnabled(), { timeout: 10000 }).toBe(true)
      const controls = page.locator('form input, form select, form textarea, form button')
      for (let i = 0; i < await controls.count(); i++) expect(await controls.nth(i).isEnabled()).toBe(true)
      expect(await page.locator('form').getAttribute('novalidate')).not.toBeNull()
      for (const name of ['firstName', 'lastName', 'email']) expect(await page.locator(`[name="${name}"]`).getAttribute('required')).not.toBeNull()
      await page.locator('[name="firstName"]').fill('Ada')
      await page.locator('[name="lastName"]').fill('Lovelace')
      await page.locator('[name="email"]').fill('ada@example.test')
      if (variant === 'contact') {
        expect(await page.locator('[name="topic"]').getAttribute('required')).not.toBeNull()
        await page.locator('[name="topic"]').selectOption('Other')
        await page.locator('[name="message"]').fill('Dummy message')
      }
      await page.getByRole('button', { name: 'Send test' }).click()
      await expect.poll(() => requests.length).toBe(1)
      expect(await page.getByRole('button', { name: 'Sending…' }).isDisabled()).toBe(true)
      expect(await page.getByText('Fixture success').count()).toBe(0)
      release()
      await page.getByRole('alert').waitFor()
      expect(await page.getByRole('alert').textContent()).toBe('Fixture validation failure')
      expect(await page.getByText('Fixture success').count()).toBe(0)
      expect(await page.getByRole('button', { name: 'Send test' }).isEnabled()).toBe(true)
      expect(await page.locator('[name="firstName"]').inputValue()).toBe('Ada')
      expect(page.url()).toBe(`${origin}/fixture`)

      const first = requests[0]
      expect(first.method).toBe('POST')
      expect(first.url).toBe(`${origin}/api/lead-capture`)
      expect(first.contentType).toBe('application/json')
      const payload = JSON.parse(first.body!)
      expect(payload).toEqual({
        firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test',
        source: variant === 'contact' ? 'contact' : 'lead-magnet',
        topic: variant === 'contact' ? 'Other' : '',
        message: variant === 'contact' ? 'Dummy message' : '',
        website: '', formStartedAt: expect.any(Number),
      })
      expect(payload.formStartedAt).toBeGreaterThanOrEqual(startedBefore)
      expect(payload.formStartedAt).toBeLessThanOrEqual(Date.now())

      await page.getByRole('button', { name: 'Send test' }).click()
      await page.getByText('Fixture success').waitFor()
      expect(requests).toHaveLength(2)
      expect(JSON.parse(requests[1].body!)).toEqual(payload)
      expect(await page.getByRole('alert').count()).toBe(0)
      expect(await page.locator('form').count()).toBe(0)
      expect(page.url()).toBe(`${origin}/fixture`)
      expect(pageErrors).toEqual([])
      expect(hydrationErrors).toEqual([])
      expectNoLeak(urls)
    } finally {
      release()
      await context.close()
    }
  }, 30000)

  it('does not report success when the API request fails at the network layer', async () => {
    let requests = 0
    const { context, page, urls } = await fixture('compact', 'create', false, async (route) => {
      requests++
      await route.abort('failed')
    })
    try {
      await expect.poll(() => page.locator('[name="firstName"]').isEnabled(), { timeout: 10000 }).toBe(true)
      await page.locator('[name="firstName"]').fill('Ada')
      await page.locator('[name="lastName"]').fill('Lovelace')
      await page.locator('[name="email"]').fill('ada@example.test')
      await page.getByRole('button', { name: 'Send test' }).click()
      await page.getByRole('alert').waitFor()
      expect(requests).toBe(1)
      expect((await page.getByRole('alert').textContent())?.length).toBeGreaterThan(0)
      expect(await page.getByText('Fixture success').count()).toBe(0)
      expect(await page.getByRole('button', { name: 'Send test' }).isEnabled()).toBe(true)
      expect(page.url()).toBe(`${origin}/fixture`)
      expectNoLeak(urls)
    } finally {
      await context.close()
    }
  }, 30000)
})
