/**
 * Uploads the funnel imagery that ships in the app into Sanity, so every image field in the
 * Studio shows the image it is actually replacing rather than an empty box.
 *
 * Idempotent: an asset whose filename is already in the dataset is reused, not re-uploaded.
 * Writes `funnel-image-assets.json` next to this script, which the seeder reads.
 *
 * Run from the studio directory:
 *   npx sanity exec scripts/upload-funnel-images.mjs --with-user-token
 */
import { createReadStream } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCliClient } from 'sanity/cli'

const here = dirname(fileURLToPath(import.meta.url))

/** The app's public directory: <inputs>/shopfine/public. */
const PUBLIC_DIR = join(here, '..', '..', '..', 'shopfine', 'public')

/**
 * Every image the Studio can hold, with the size it ships at.
 *
 * `role` is for documentation only; `width`/`height` drive the guidance shown in the Studio.
 */
const IMAGES = [
  // Quiz landing screens
  { path: '/images/hero-intro-main-quiz.png', role: 'Find Your Ring — hero' },
  { path: '/images/hero-intro-design-ring-quiz.png', role: 'Design Your Ring — hero' },
  { path: '/images/hero-bg-find-jeweler-quiz.jpg', role: 'Find a Jeweler — hero (desktop)' },
  { path: '/images/intro-find-jeweler-bg-mobile.png', role: 'Find a Jeweler — hero (mobile)' },

  // Backgrounds behind the questions. One pair per funnel; not per question.
  { path: '/images/hero-bg-mobile.png', role: 'Ring funnels — questions background (mobile)' },
  { path: '/images/hero-main-quiz-bg.png', role: 'Ring funnels — questions background (desktop)' },
  {
    path: '/images/hero-find-jeweler-bg-mobile.png.png',
    role: 'Find a Jeweler — questions background (mobile)',
  },

  // Quiz answer images
  { path: '/images/pop.png', role: 'Ring style answer' },
  { path: '/images/pop-2.png', role: 'Ring style answer (alternate)' },
  { path: '/images/round-brilliant.jpg', role: 'Diamond shape answer' },
  { path: '/images/oval.jpg', role: 'Diamond shape answer' },
  { path: '/images/emerald.jpg', role: 'Diamond shape answer' },
  { path: '/images/pear.jpg', role: 'Diamond shape answer' },
  { path: '/images/cushion.jpg', role: 'Diamond shape answer' },
  { path: '/images/radiant.jpg', role: 'Diamond shape answer' },
  { path: '/images/marquis.jpg', role: 'Diamond shape answer' },
  { path: '/images/princess.jpg', role: 'Diamond shape answer' },

  // Funnel pages
  { path: '/images/hero-get-diamond-card.png', role: 'Get Diamond Card — hero' },
  { path: '/images/hero-bg-results.png', role: 'Booking — hero background' },
]

const client = getCliClient({ apiVersion: '2025-01-01' })

/**
 * Every asset is namespaced. The dataset already holds unrelated images from the main website,
 * and an asset is matched by filename — so an un-prefixed `emerald.jpg` silently reused the
 * site's 1340×894 image in place of the funnel's 580×460 one.
 */
const assetName = (path) => `funnel-${path.split('/').pop()}`

const filenames = IMAGES.map((i) => assetName(i.path))

const existing = await client.fetch(
  `*[_type == "sanity.imageAsset" && originalFilename in $filenames]{_id, originalFilename}`,
  { filenames }
)

/** filename -> asset id, for assets already in the dataset. */
const byFilename = new Map(existing.map((a) => [a.originalFilename, a._id]))

const assets = {}
let uploaded = 0
let reused = 0

for (const image of IMAGES) {
  const filename = assetName(image.path)

  if (byFilename.has(filename)) {
    assets[image.path] = byFilename.get(filename)
    reused += 1
    continue
  }

  const file = join(PUBLIC_DIR, image.path)
  const asset = await client.assets.upload('image', createReadStream(file), { filename })
  assets[image.path] = asset._id
  uploaded += 1
  console.log(`  uploaded ${filename} (${image.role})`)
}

await writeFile(join(here, 'funnel-image-assets.json'), JSON.stringify(assets, null, 2))

console.log(`\nUploaded ${uploaded}, reused ${reused}. Wrote funnel-image-assets.json.`)
