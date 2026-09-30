/**
 * Seeds the loading-screen cards and uploads the placeholder rings.
 *
 * The rings are supplied per metal, three of them, so the loading cards can follow the metal the
 * visitor chose — the same rule the style and setting images follow.
 *
 * Idempotent: assets are matched by a namespaced filename so re-running reuses what is already in
 * Sanity, and the document is written with `createOrReplace` under a fixed id.
 *
 * Run with:
 *   npx sanity exec scripts/seed-loading-screen.mjs --with-user-token
 * Pass `-- --dry-run` to check the file matching without uploading or writing anything.
 */
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2025-01-01' })

const SOURCE_DIR = process.env.LOADING_RINGS_DIR ?? '/Users/warren/Downloads/Loading State Rings'

/** The metals, in the order they appear in the Studio, with the filename prefix each uses. */
const METALS = [
  { value: 'rose_gold', label: 'Rose Gold', prefix: 'Rose' },
  { value: 'platinum_or_white_gold', label: 'Platinum or White Gold', prefix: 'White Gold' },
  { value: 'yellow_gold', label: 'Yellow Gold', prefix: 'Yellow' },
]

/** The three placeholder cards, in the order Find Your Ring shows them. */
const MATCH_CARDS = [
  { badge: '01', title: 'The Knife-Edge Solitaire Engagement Ring', subtitle: 'Round Brilliant – {metal}' },
  { badge: '02', title: 'The Knife-Edge Solitaire Engagement Ring', subtitle: 'Round Brilliant – {metal}' },
  { badge: '03', title: 'The Knife-Edge Solitaire Engagement Ring', subtitle: 'Round Brilliant – {metal}' },
]

/**
 * Design Your Ring returns a single ring, so it shows a single card. It reuses the first ring of
 * each metal.
 */
const SINGLE_CARD = { badge: '01', title: 'Your Custom Engagement Ring', subtitle: 'Hand-matched to your answers – {metal}' }

const DRY_RUN = process.argv.includes('--dry-run')

/** Alt text describing the ring for anyone who cannot see it. */
const altFor = (metalLabel, index) =>
  `Placeholder engagement ring in ${metalLabel.toLowerCase()} shown while your match is prepared (${index})`

const uploadImage = async (path, filename) => {
  const asset = await client.assets.upload('image', createReadStream(path), { filename })
  return { assetId: asset._id, url: asset.url }
}

const imageEntry = (assetId, metal, metalLabel, index) => ({
  _type: 'metalImage',
  _key: `${metal}-${index}`,
  metal,
  image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
  alt: altFor(metalLabel, index),
})

const main = async () => {
  console.log(DRY_RUN ? 'DRY RUN — nothing will be uploaded or written\n' : 'Seeding the loading screen\n')

  const problems = []
  /** metal -> [{ index, file }] in order. */
  const byMetal = new Map()

  for (const metal of METALS) {
    const found = []
    for (let index = 1; index <= 3; index += 1) {
      const file = join(SOURCE_DIR, `${metal.prefix} ${index}.jpg`)
      if (!existsSync(file)) problems.push(`missing file: ${metal.prefix} ${index}.jpg`)
      else found.push({ index, file })
    }
    byMetal.set(metal.value, found)
    console.log(`  ${metal.label.padEnd(22)} ${found.length}/3 files found`)
  }

  if (problems.length) {
    console.log('\n  PROBLEMS:')
    for (const problem of problems) console.log(`    ${problem}`)
    process.exitCode = 1
    return
  }

  if (DRY_RUN) {
    console.log('\n  Every expected file is present and named as expected. Nothing was uploaded.')
    return
  }

  // metal value -> metal images in ring order (1, 2, 3)
  const assetsByMetal = new Map()
  let uploaded = 0

  for (const metal of METALS) {
    const entries = []
    for (const { index, file } of byMetal.get(metal.value)) {
      const filename = `funnel-loading-${metal.value}-${index}.jpg`
      process.stdout.write(`  uploading ${basename(file)} → ${filename}\n`)
      const { assetId } = await uploadImage(file, filename)
      uploaded += 1
      entries.push({ index, assetId })
    }
    assetsByMetal.set(metal.value, entries)
  }

  /** The images for ring `slot`, across every metal. */
  const imagesForSlot = (slot) =>
    METALS.map((metal) => {
      const entry = assetsByMetal.get(metal.value).find((e) => e.index === slot)
      return imageEntry(entry.assetId, metal.value, metal.label, slot)
    })

  const doc = {
    _id: 'funnelLoadingScreen-funnels',
    _type: 'funnelLoadingScreen',
    routeKey: 'funnels',
    matchCards: MATCH_CARDS.map((card, i) => ({
      _type: 'loadingCard',
      _key: `match-${i + 1}`,
      ...card,
      images: imagesForSlot(i + 1),
    })),
    singleCard: {
      _type: 'loadingCard',
      badge: SINGLE_CARD.badge,
      title: SINGLE_CARD.title,
      subtitle: SINGLE_CARD.subtitle,
      images: imagesForSlot(1),
    },
  }

  await client.createOrReplace(doc)
  console.log(`\n  uploaded ${uploaded} images`)
  console.log(`  wrote document ${doc._id}`)
  console.log(`  ${doc.matchCards.length} match cards, 1 single card, 3 metals each`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})