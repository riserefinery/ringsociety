/**
 * Checks the Studio desk structure before deploying.
 *
 * Guards the failure mode where a menu entry points at a schema type that does not exist.
 * The Studio builds and deploys happily in that case, then throws
 * "Schema type for '<id>' not found" the moment an editor clicks the entry.
 *
 * Run:  npx sanity exec scripts/verify-structure.ts
 */
import { schemaTypes } from '../schemas'
import { structure } from '../structure'

const knownTypes = new Set(schemaTypes.map((type) => type.name))

type Recorded = {
  kind: 'document' | 'documentTypeList' | 'documentTypeListItem'
  schemaType?: string
  documentId?: string
}

const recorded: Recorded[] = []

class MockDocument {
  entry: Recorded = { kind: 'document' }
  constructor() {
    recorded.push(this.entry)
  }
  schemaType(value: string) {
    this.entry.schemaType = value
    return this
  }
  documentId(value: string) {
    this.entry.documentId = value
    return this
  }
  title() {
    return this
  }
}

class MockList {
  items() {
    return this
  }
  title() {
    return this
  }
}

class MockListItem {
  child() {
    return this
  }
  title() {
    return this
  }
  id() {
    return this
  }
}

const mockBuilder = {
  list: () => new MockList(),
  listItem: () => new MockListItem(),
  document: () => new MockDocument(),
  divider: () => ({}),
  documentTypeList: (type: string) => {
    recorded.push({ kind: 'documentTypeList', schemaType: type })
    return { title: () => ({}) }
  },
  documentTypeListItem: (type: string) => {
    recorded.push({ kind: 'documentTypeListItem', schemaType: type })
    return { title: () => ({}) }
  },
} as never

structure(mockBuilder)

const problems: string[] = []
const singletonIds: string[] = []

for (const entry of recorded) {
  if (!entry.schemaType) {
    problems.push(`A structure entry is missing a schema type: ${JSON.stringify(entry)}`)
    continue
  }
  if (!knownTypes.has(entry.schemaType)) {
    problems.push(`Schema type "${entry.schemaType}" is referenced by the structure but is not registered.`)
  }
  if (entry.kind === 'document' && entry.documentId) {
    singletonIds.push(entry.documentId)
  }
}

console.log(`Structure entries checked: ${recorded.length}`)
console.log(`Registered schema types:   ${knownTypes.size}`)
console.log(`Singleton document ids:    ${singletonIds.length}`)
for (const id of singletonIds) console.log(`  - ${id}`)

if (problems.length) {
  console.error(`\nFAILED (${problems.length}):`)
  for (const problem of problems) console.error(`  x ${problem}`)
  process.exit(1)
}

console.log('\nOK: every structure entry resolves to a registered schema type.')
