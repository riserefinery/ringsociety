import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const approvedSlug = 'how-to-buy-an-engagement-ring'
const approvedPath = `/guides/${approvedSlug}`
const approvedCanonical = `https://ringsociety.com${approvedPath}`
const outputFile = path.join(root, 'dist', 'approved-articles', `${approvedSlug}.html`)

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

/** Escape HTML script delimiters even though the payload is inert JSON. */
export function serializeJson(value) {
  const json = JSON.stringify(value)
  if (json === undefined) throw new Error('Cannot serialize an empty article payload')
  return json.replace(/[<>\u2028\u2029]/g, (character) => ({
    '<': '\\u003c', '>': '\\u003e', '\u2028': '\\u2028', '\u2029': '\\u2029',
  })[character])
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').toLowerCase()
}

function stripMetadata(shell) {
  return shell
    .replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, (tag) => {
      const keys = [attribute(tag, 'name'), attribute(tag, 'property')]
      return keys.some((key) => ['description', 'robots', 'googlebot', 'bingbot'].includes(key)
        || key.startsWith('og:') || key.startsWith('twitter:')) ? '' : tag
    })
    .replace(/<link\b[^>]*>/gi, (tag) => attribute(tag, 'rel').split(/\s+/).includes('canonical') ? '' : tag)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (tag) => {
      const opening = tag.slice(0, tag.indexOf('>') + 1)
      return attribute(opening, 'type') === 'application/ld+json'
        || attribute(opening, 'id') === 'ring-society-approved-article' ? '' : tag
    })
}

const noScriptStyle = `<noscript><style>
#root[data-approved-article-prerender] [style*="opacity:0"],
#root[data-approved-article-prerender] [style*="opacity: 0"] {
  opacity: 1 !important;
  transform: none !important;
}
#root[data-approved-article-prerender] main .sticky.bottom-0.bg-gradient-to-b {
  display: none !important;
}
#root[data-approved-article-prerender] form {
  display: none !important;
}
</style></noscript>`

/** Pure composition is exported for validation without a browser or CMS request. */
export function composeApprovedArticleHtml(shell, result) {
  const { html, doc, meta, structuredData } = result
  if (doc?.slug !== approvedSlug || doc.noIndex !== false || meta?.noIndex !== false
    || meta.canonical !== approvedCanonical || !Array.isArray(doc.body) || !doc.body.length) {
    throw new Error('Refusing to emit an unapproved or incomplete article')
  }
  for (const value of [doc.title, doc.subtitle, doc.hero, meta.title, meta.description, meta.image]) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Missing required article content or metadata')
  }
  if (typeof html !== 'string' || (html.match(/<h1(?:\s|>)/g) ?? []).length !== 1) {
    throw new Error('Missing server-rendered article heading')
  }
  if (!structuredData || typeof structuredData !== 'object') throw new Error('Missing article structured data')

  const metaTag = (key, value, property = false) =>
    `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    metaTag('description', meta.description),
    metaTag('robots', 'index, follow'),
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    metaTag('og:type', 'article', true),
    metaTag('og:site_name', 'Ring Society', true),
    metaTag('og:title', meta.title, true),
    metaTag('og:description', meta.description, true),
    metaTag('og:url', meta.canonical, true),
    metaTag('og:image', meta.image, true),
    metaTag('og:image:alt', meta.imageAlt ?? doc.title, true),
    metaTag('twitter:card', 'summary_large_image'),
    metaTag('twitter:title', meta.title),
    metaTag('twitter:description', meta.description),
    metaTag('twitter:image', meta.image),
    metaTag('twitter:image:alt', meta.imageAlt ?? doc.title),
    `<script id="ring-society-article-schema" type="application/ld+json">${serializeJson(structuredData)}</script>`,
    `<script id="ring-society-organization-schema" type="application/ld+json">${serializeJson({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://ringsociety.com/#organization',
      name: 'Ring Society',
      url: 'https://ringsociety.com/',
    })}</script>`,
    noScriptStyle,
  ].join('\n    ')

  let headCount = 0
  let output = stripMetadata(shell).replace(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/gi, (_match, head) => {
    headCount += 1
    return `<head>${head}\n    ${tags}\n  </head>`
  })
  if (headCount !== 1) throw new Error('Built HTML must contain exactly one head')

  let rootCount = 0
  output = output.replace(/<div\b[^>]*>\s*<\/div\s*>/gi, (tag) => {
    if (attribute(tag, 'id') !== 'root') return tag
    rootCount += 1
    const opening = tag.slice(0, tag.indexOf('>')).replace(/\s*$/, '')
    return `${opening} data-approved-article-prerender>${html}</div>\n`
      + `<script id="ring-society-approved-article" type="application/json">${serializeJson(doc)}</script>`
  })
  if (rootCount !== 1) throw new Error('Built HTML must contain exactly one empty #root')
  return output
}

export async function prerenderApprovedArticle() {
  // A failed regeneration must not leave a stale, previously approved artifact.
  await rm(outputFile, { force: true })
  const shell = await readFile(path.join(root, 'dist', 'index.html'), 'utf8')
  const entry = await import(pathToFileURL(path.join(root, '.cache', 'article-prerender', 'entry-article-prerender.js')).href)
  if (entry.APPROVED_ARTICLE_SLUG !== approvedSlug || entry.APPROVED_ARTICLE_PATH !== approvedPath
    || `${entry.CANONICAL_ORIGIN}${entry.APPROVED_ARTICLE_PATH}` !== approvedCanonical) {
    throw new Error('SSR entry approval constants do not match the isolated output allowlist')
  }
  const result = await entry.renderApprovedArticle()
  const output = composeApprovedArticleHtml(shell, result)
  await mkdir(path.dirname(outputFile), { recursive: true })
  await writeFile(outputFile, output, 'utf8')
  const imageCount = result.doc.body.filter((block) => block.type === 'image').length
  console.log(`Prerendered ${approvedPath}: ${result.doc.body.length} body blocks, ${imageCount} body images -> ${path.relative(root, outputFile)}`)
  return outputFile
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prerenderApprovedArticle().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
