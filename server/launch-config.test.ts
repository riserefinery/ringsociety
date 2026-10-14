import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('launch configuration', () => {
  it('keeps the Vercel filesystem/API routing ahead of the SPA fallback', () => {
    const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'))
    const filesystemIndex = config.routes.findIndex((route: { handle?: string }) => route.handle === 'filesystem')
    const spaFallbackIndex = config.routes.findIndex((route: { src?: string; dest?: string }) => route.src === '/(.*)' && route.dest === '/index.html')

    expect(filesystemIndex).toBeGreaterThanOrEqual(0)
    expect(spaFallbackIndex).toBeGreaterThan(filesystemIndex)
  })

  it('keeps the legacy text-message launcher on its extensionless no-index route', () => {
    const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'))
    const route = config.routes.find((entry: { src?: string }) => entry.src === '/text-us-949-630-3642(?:\\.html)?/?')
    const launcher = readFileSync(resolve(root, 'public/text-us-949-630-3642/index.html'), 'utf8')

    expect(route?.headers?.['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(launcher).toContain('name="robots" content="noindex, nofollow"')
    expect(launcher).toContain("let phone = params.get('phone')")
    expect(launcher).toContain("const smsUrl = 'sms:' + phone")
  })

  it('references the verified public CDN social image', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    expect(html).toContain('https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/vbmFUlAVJjZnPXSl.webp')
  })

  it('defines page-specific metadata for every legal placeholder route', () => {
    const source = readFileSync(resolve(root, 'src/app/Root.tsx'), 'utf8')
    for (const path of ['/privacy-policy', '/terms-and-conditions', '/accessibility', '/privacy-choices']) {
      expect(source).toContain(`'${path}':`)
    }
  })
})
