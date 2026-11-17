import { build, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { prerenderApprovedArticle } from './prerender-approved-article.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

async function main() {
  const env = loadEnv('production', root, 'VITE_')
  // Public CMS identifiers, never credentials. Reject alternate projects/datasets.
  process.env.VITE_SANITY_PROJECT_ID ||= env.VITE_SANITY_PROJECT_ID || 'p1o8iwkt'
  process.env.VITE_SANITY_DATASET ||= env.VITE_SANITY_DATASET || 'production'
  if (process.env.VITE_SANITY_PROJECT_ID !== 'p1o8iwkt' || process.env.VITE_SANITY_DATASET !== 'production') {
    throw new Error('Approved article build requires Sanity project p1o8iwkt, dataset production')
  }

  console.log('Building normal client assets and protected HTML shell…')
  await build({ root, mode: 'production', build: { outDir: path.join(root, 'dist'), emptyOutDir: true } })

  console.log('Building isolated seven-guide SSR entry…')
  await build({
    root,
    mode: 'production',
    publicDir: false,
    build: {
      ssr: path.join(root, 'src', 'entry-article-prerender.tsx'),
      outDir: path.join(root, '.cache', 'article-prerender'),
      emptyOutDir: true,
      sourcemap: false,
    },
  })
  // Fails the whole build unless all seven published records pass every guard.
  await prerenderApprovedArticle()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
