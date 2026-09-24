import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { imageUrl, shareDocument, shareMetadata } from '../api/guide-share.mjs'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('per-guide share metadata', () => {
  it('defaults each share card to the guide title, excerpt, hero image, and public guide path', () => {
    const meta = shareMetadata({
      title: 'Example Guide',
      excerpt: 'A concise guide description.',
      slug: 'example-guide',
      heroAsset: 'image-abcdef123456-1200x630-jpg',
      heroAlt: 'An example engagement ring',
      seo: { noIndex: true },
    })

    expect(meta).toMatchObject({
      title: 'Example Guide',
      description: 'A concise guide description.',
      canonical: 'https://ringsociety.com/guides/example-guide',
      image: 'https://cdn.sanity.io/images/p1o8iwkt/production/abcdef123456-1200x630.jpg?w=1200&fit=max',
      imageAlt: 'An example engagement ring',
      noIndex: true,
    })
  })

  it('honors editor overrides for share title, description, image, and canonical path', () => {
    const meta = shareMetadata({
      title: 'Guide Title',
      excerpt: 'Guide excerpt.',
      slug: 'guide-title',
      heroAsset: 'image-a1b2c3-1200x630-jpg',
      heroAlt: 'Hero image',
      seo: {
        title: 'Share Title',
        description: 'Share description.',
        canonicalPath: '/guides/custom-permalink',
        socialAsset: 'image-fedcba123-1200x630-png',
      },
    })

    expect(meta).toMatchObject({
      title: 'Share Title',
      description: 'Share description.',
      canonical: 'https://ringsociety.com/guides/custom-permalink',
      image: 'https://cdn.sanity.io/images/p1o8iwkt/production/fedcba123-1200x630.png?w=1200&fit=max',
    })
  })

  it('renders crawler-ready Open Graph, Twitter, canonical, and no-index tags', () => {
    const html = shareDocument({
      title: 'Guide <Title>',
      description: 'Description & detail',
      canonical: 'https://ringsociety.com/guides/example-guide',
      image: 'https://cdn.sanity.io/images/p1o8iwkt/production/example-1200x630.jpg',
      imageAlt: 'Ring <hero>',
      noIndex: true,
    })

    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('content="Guide &lt;Title&gt;"')
    expect(html).toContain('content="Description &amp; detail"')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="robots" content="noindex, follow" />')
    expect(html).toContain('<link rel="canonical" href="https://ringsociety.com/guides/example-guide" />')
  })

  it('keeps editor controls, client metadata, and crawler routing aligned', () => {
    const schema = read('studio/schemas/common.ts')
    const documents = read('studio/schemas/documents.ts')
    const article = read('src/pages/Article.tsx')
    const rootShell = read('src/app/Root.tsx')
    const routes = read('vercel.json')

    expect(schema).toContain("title: 'Share Title Override'")
    expect(schema).toContain("title: 'Share Description Override'")
    expect(schema).toContain("title: 'Share Image Override'")
    expect(documents).toContain("title: 'Permalink'")
    expect(article).toContain('const shareImage = doc.shareImage ?? doc.hero')
    expect(article).toContain("upsert('meta[property=\"og:image\"]', 'property', shareImage)")
    expect(rootShell).toContain("if (path.startsWith('/guides/')) return")
    expect(routes).toContain('facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|imessage')
    expect(routes).toContain('/api/guide-share?slug=$1')
  })

  it('accepts valid Sanity image asset references only', () => {
    expect(imageUrl('image-abc123-1200x630-webp')).toContain('abc123-1200x630.webp')
    expect(imageUrl('not-an-asset')).toBeNull()
  })
})
