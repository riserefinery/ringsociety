/**
 * Seeds the funnel content into Sanity.
 *
 * Idempotent: every document has a deterministic id and is written with createOrReplace, so
 * rerunning this never creates duplicates. The content it writes is a faithful copy of the
 * copy currently hard-coded in the funnel app, so publishing it changes nothing visible.
 *
 * Usage:
 *   sanity exec scripts/seed-funnels.mjs --with-user-token
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCliClient } from 'sanity/cli'

const here = dirname(fileURLToPath(import.meta.url))
const seedFile = process.env.FUNNEL_SEED_FILE ?? join(here, 'funnel-seed.json')

const client = getCliClient({ apiVersion: '2025-01-01' })

const documents = JSON.parse(readFileSync(seedFile, 'utf8'))

let count = 0
for (const doc of documents) {
  const { _id, _type, ...rest } = doc
  await client.createOrReplace({ _id, _type, ...rest })
  count += 1
  console.log(`  written: ${_id}`)
}

console.log(`\nSeeded ${count} funnel documents into ${client.config().projectId}/${client.config().dataset}.`)
