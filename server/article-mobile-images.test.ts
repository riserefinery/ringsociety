import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import ResponsiveImage from '../src/components/ResponsiveImage'
import { toArticleDoc } from '../src/sanity/mappers'
import type { CmsPortableBlock } from '../src/sanity/types'

const root = resolve(import.meta.dirname, '..')
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')
const desktopId = 'image-0df3fc7b885df0685b0863614a7399bc620391f7-1600x1178-jpg'
const mobileId = 'image-67a0171c595b2a56ed79620ae8a08323ef8fa223-1080x2272-jpg'
const portableBlocks = (body: CmsPortableBlock[]) => {
  const doc = toArticleDoc({ _id: 'post-test', slug: 'test', title: 'Test', excerpt: 'Test excerpt', heroImage: { mainImage: { asset: { _ref: desktopId } }, alt: 'Hero' }, body })
  if (!doc) throw new Error('Expected an article document')
  return doc.body
}

describe('optional mobile article images', () => {
  it('renders the desktop image unchanged when no mobile override is supplied', () => {
    const html = renderToStaticMarkup(createElement(ResponsiveImage, { fallbackSrc: '/desktop.jpg', alt: 'Diagram' }))
    expect(html).toContain('src="/desktop.jpg"')
    expect(html).not.toContain('<source')
    expect(html).toContain('alt="Diagram"')
  })

  it('uses a native phone-only picture source with the existing desktop fallback', () => {
    const html = renderToStaticMarkup(createElement(ResponsiveImage, { fallbackSrc: '/desktop.jpg', mobileSrc: '/mobile.jpg', alt: 'Diagram' }))
    expect(html).toContain('<source media="(max-width: 767px)" srcSet="/mobile.jpg"')
    expect(html).toContain('src="/desktop.jpg"')
    expect(html).toContain('alt="Diagram"')
  })

  it('maps native inline image asset references without changing alt, caption, note or desktop width', () => {
    const [image] = portableBlocks([{ _type: 'image', asset: { _ref: desktopId }, mobileImage: { asset: { _ref: mobileId } }, alt: 'Diagram', caption: 'Caption', note: 'Note' }])
    expect(image.type).toBe('image')
    if (image.type !== 'image') throw new Error('Expected an inline image')
    expect(image.src).toContain('0df3fc7b885df0685b0863614a7399bc620391f7-1600x1178')
    expect(image.src).toContain('w=1440')
    expect(image.mobileSrc).toContain('67a0171c595b2a56ed79620ae8a08323ef8fa223-1080x2272')
    expect(image.mobileSrc).toContain('w=900')
    expect(image).toMatchObject({ alt: 'Diagram', caption: 'Caption', note: 'Note' })
  })

  it('keeps legacy native image blocks valid and carries overrides through the zoom gallery', () => {
    const [image] = portableBlocks([{ _type: 'image', asset: { _ref: desktopId }, alt: 'Legacy' }])
    expect(image.type).toBe('image')
    if (image.type !== 'image') throw new Error('Expected an inline image')
    expect(image.mobileSrc).toBeUndefined()
    const article = read('src/pages/Article.tsx')
    expect(article).toContain('mobileSrc={block.mobileSrc}')
    expect(article).toContain('mobileSrc={current.mobileSrc}')
    expect(article).toContain('src: b.src, mobileSrc: b.mobileSrc')
    expect(article).toContain('href={visibleSrc}')
  })

  it('adds an optional field to the existing native image member rather than requiring a migration', () => {
    const schema = read('studio/schemas/documents.ts').split('const articleImage =', 2)[1].split('export const siteSettings', 1)[0]
    expect(schema).toContain("type: 'image'")
    expect(schema).toContain("name: 'mobileImage'")
    expect(schema).toContain('Mobile Image Override')
    expect(schema).toContain('Leave blank to use the desktop image.')
    const mobile = schema.split("name: 'mobileImage'", 2)[1]
    expect(mobile).not.toContain('Rule.required()')
  })
})
