/**
 * Seeds the funnel content into Sanity.
 *
 * Every document has a deterministic id, so rerunning this never creates duplicates. But
 * `createOrReplace` overwrites whatever is already there, and once an editor has changed a
 * document in the Studio a reseed would silently destroy that work.
 *
 * So writing over an existing document now requires `--force`. Without it, documents that already
 * exist are left exactly as they are; only missing ones are created.
 *
 * Usage:
 *   sanity exec scripts/seed-funnels.mjs --with-user-token
 *   sanity exec scripts/seed-funnels.mjs --with-user-token -- --force
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCliClient } from 'sanity/cli'

const here = dirname(fileURLToPath(import.meta.url))
const seedFile = process.env.FUNNEL_SEED_FILE ?? join(here, 'funnel-seed.json')

const client = getCliClient({ apiVersion: '2025-01-01' })

const documents = JSON.parse(readFileSync(seedFile, 'utf8'))

const force = process.argv.includes('--force')

let written = 0
let skipped = 0

for (const doc of documents) {
  const { _id, _type, ...rest } = doc

  if (!force && (await client.getDocument(_id))) {
    skipped += 1
    console.log(`  left alone: ${_id} (already exists)`)
    continue
  }

  await client.createOrReplace({ _id, _type, ...rest })
  written += 1
  console.log(`  written: ${_id}`)
}

console.log(
  `\nSeeded ${written} document(s) into ${client.config().projectId}/${client.config().dataset}.` +
    (skipped
      ? `\nLeft ${skipped} existing document(s) untouched. Pass --force to overwrite them — that discards every Studio edit they contain.`
      : '')
)