import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('Studio presentation preview configuration', () => {
  it('uses the current Shopfine Vercel review site as the editor-accessible preview destination', () => {
    const config = readFileSync(resolve(root, 'studio/sanity.config.ts'), 'utf8')
    const packageJson = readFileSync(resolve(root, 'studio/package.json'), 'utf8')

    expect(packageJson).toContain('"@sanity/presentation"')
    expect(config).toContain("import { presentationTool } from 'sanity/presentation'")
    expect(config).toContain('presentationTool({')
    expect(config).toContain("'https://ringsociety-web.vercel.app'")
  })
})
