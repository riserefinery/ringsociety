import { createClient } from '@sanity/client'

const projectId = process.env.VITE_SANITY_PROJECT_ID ?? 'p1o8iwkt'
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_AUTH_TOKEN

if (!token) {
  throw new Error('SANITY_AUTH_TOKEN is required to migrate article labels.')
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-08-15', useCdn: false })

const labels = [
  {
    _id: 'articleLabel-featured',
    _type: 'articleLabel',
    name: 'Featured',
    slug: { _type: 'slug', current: 'featured' },
    description: 'Use for a guide Ring Society wants to highlight prominently.',
  },
  {
    _id: 'articleLabel-most-loved',
    _type: 'articleLabel',
    name: 'Most Loved',
    slug: { _type: 'slug', current: 'most-loved' },
    description: 'Use for a guide designated as a Most-Loved recommendation.',
  },
]

function legacyLabelId(post) {
  if (post.articleLabel?._ref) return post.articleLabel._ref
  if (post.topGuidesBadge === 'featured') return 'articleLabel-featured'
  if (post.topGuidesBadge === 'mostLoved' || post.isMostLoved) return 'articleLabel-most-loved'
  return undefined
}

async function main() {
  let transaction = client.transaction()
  for (const label of labels) {
    transaction = transaction.createIfNotExists(label)
  }

  const posts = await client.fetch(`*[_type == "post"]{_id, isMostLoved, topGuidesBadge, articleLabel}`)
  let migratedCount = 0

  for (const post of posts) {
    const labelId = legacyLabelId(post)
    const patch = client.patch(post._id)
    let changed = false

    if (labelId && post.articleLabel?._ref !== labelId) {
      patch.set({ articleLabel: { _type: 'reference', _ref: labelId } })
      changed = true
    }

    if (Object.hasOwn(post, 'topGuidesBadge')) {
      patch.unset(['topGuidesBadge'])
      changed = true
    }

    if (changed) {
      transaction = transaction.patch(patch)
      migratedCount += 1
    }
  }

  await transaction.commit()
  console.log(`Ensured ${labels.length} approved article labels and migrated ${migratedCount} post records.`)
}

await main()
