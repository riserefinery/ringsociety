const SANITY_PROJECT_ID = 'p1o8iwkt'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2025-02-19'
const CANONICAL_HOST = 'https://ringsociety.com'

const query = `*[_type == "post" && slug.current == $slug][0]{
  title,
  excerpt,
  "slug": slug.current,
  "heroAsset": heroImage.mainImage.asset._ref,
  "heroAlt": heroImage.alt,
  "seo": seo{title, description, canonicalPath, "socialAsset": openGraphImage.asset._ref, noIndex}
}`

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function imageUrl(assetRef) {
  const match = String(assetRef ?? '').match(/^image-([a-f\d]+)-(\d+)x(\d+)-([a-z\d]+)$/i)
  if (!match) return null
  const [, imageId, width, height, format] = match
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${imageId}-${width}x${height}.${format}?w=1200&fit=max`
}

export function shareMetadata(post) {
  if (!post?.title || !post?.excerpt || !post?.slug) return null

  const canonicalPath = post.seo?.canonicalPath?.startsWith('/') ? post.seo.canonicalPath : `/guides/${post.slug}`
  const image = imageUrl(post.seo?.socialAsset ?? post.heroAsset)
  if (!image) return null

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    canonical: `${CANONICAL_HOST}${canonicalPath}`,
    image,
    imageAlt: post.heroAlt || post.title,
    noIndex: post.seo?.noIndex === true,
  }
}

export function shareDocument(meta) {
  const robots = meta.noIndex ? 'noindex, follow' : 'index, follow'
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(meta.title)} | Ring Society</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeHtml(meta.canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Ring Society" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:url" content="${escapeHtml(meta.canonical)}" />
  <meta property="og:image" content="${escapeHtml(meta.image)}" />
  <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
</head>
<body></body>
</html>`
}

export default async function guideShare(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).send('Method not allowed')

  const slug = String(req.query?.slug ?? '').trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return res.status(404).send('Not found')

  try {
    const endpoint = new URL(`https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`)
    endpoint.searchParams.set('query', query)
    endpoint.searchParams.set('$slug', JSON.stringify(slug))

    const upstream = await fetch(endpoint, { headers: { accept: 'application/json' } })
    if (!upstream.ok) return res.status(502).send('Share metadata unavailable')

    const payload = await upstream.json()
    const meta = shareMetadata(payload.result)
    if (!meta) return res.status(404).send('Not found')

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    res.setHeader('X-Robots-Tag', meta.noIndex ? 'noindex, follow' : 'index, follow')
    return res.status(200).send(req.method === 'HEAD' ? '' : shareDocument(meta))
  } catch (error) {
    console.error('[guide-share] share metadata lookup failed', error)
    return res.status(502).send('Share metadata unavailable')
  }
}
