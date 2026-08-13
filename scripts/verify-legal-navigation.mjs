import { chromium } from 'playwright'

const baseUrl = process.env.RING_SOCIETY_BASE_URL ?? 'http://localhost:8443'
const links = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms-and-conditions'],
  ['Accessibility', '/accessibility'],
  ['Your Privacy Choices', '/do-not-sell'],
]

async function expectPath(page, path) {
  await page.waitForURL((url) => new URL(url).pathname === path, { timeout: 10_000 })
  if (new URL(page.url()).pathname !== path) {
    throw new Error(`Expected ${path}; received ${page.url()}`)
  }
}

async function verifyFooter(page) {
  for (const [label, path] of links) {
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2_000)
    const link = page.locator('footer').getByRole('link', { name: label, exact: true })
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expectPath(page, path)
  }
}

async function verifyMobileMenu(page) {
  for (const [label, path] of links) {
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2_000)
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('dialog')
    const link = menu.getByRole('link', { name: label, exact: true })
    await link.click()
    await expectPath(page, path)
  }
}

const browser = await chromium.launch({ headless: true })

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await verifyFooter(desktop)

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } })
  await verifyMobileMenu(mobile)

  console.log('Verified 4 footer links and 4 mobile-menu legal links against published routes.')
} finally {
  await browser.close()
}
