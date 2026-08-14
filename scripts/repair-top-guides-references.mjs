import { createClient } from '@sanity/client'

const token = process.env.SANITY_AUTH_TOKEN
if (!token) throw new Error('SANITY_AUTH_TOKEN is required')

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'p1o8iwkt',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2026-08-13',
  token,
  useCdn: false,
  perspective: 'raw',
})

const draftId = 'drafts.topGuidesLanding'
const selectedPosts = await client.fetch(`*[_id == $id][0].selectedPosts`, { id: draftId })

if (!Array.isArray(selectedPosts) || selectedPosts.length === 0) {
  throw new Error('No Top Guides selections were found to repair')
}

const repairedSelections = selectedPosts.map((selection) => ({
  ...selection,
  _ref: selection._ref.replace(/^drafts\./, ''),
  _weak: true,
}))

await client.patch(draftId).set({ selectedPosts: repairedSelections }).commit()
console.log(`Repaired ${repairedSelections.length} Top Guides references as weak canonical post references.`)
