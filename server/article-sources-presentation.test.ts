import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const article = readFileSync(path.join(process.cwd(), 'src/pages/Article.tsx'), 'utf8')
const endMatter = article.slice(article.indexOf('function EndMatterAccordion'), article.indexOf('/* ---------- sticky right sidebar'))

describe('Buying-guide citation cleanup source presentation', () => {
  it('opts in only the approved buying guide', () => {
    expect(article).toContain("bulletedSources={doc.slug === 'how-to-buy-an-engagement-ring'}")
    expect(endMatter).toContain('bulletedSources = false')
  })
  it('uses real bullets when opted in and preserves legacy paragraph markup otherwise', () => {
    expect(endMatter).toContain("const SourceList = bulletedSources ? 'ul' : 'div'")
    expect(endMatter).toContain("const SourceEntry = bulletedSources ? 'li' : 'p'")
    expect(endMatter).toContain('flex list-disc flex-col gap-3 pl-5 text-[14px]')
  })
  it('keeps source links rendered inside the same initially closed native accordion', () => {
    expect(endMatter).toContain('<EndMatterAccordion title="Sources">')
    expect(endMatter).toContain('sources.map((source) => (')
    expect(endMatter).toContain('href={source.url}')
    expect(endMatter).not.toMatch(/<details[^>]*\sopen(?:[\s=>])/)
    expect(endMatter).not.toMatch(/onToggle|useState|lazy\(/)
  })
  it('does not introduce nofollow on source links', () => {
    expect(endMatter).not.toContain('nofollow')
    expect(endMatter).toContain('target="_blank"')
    expect(endMatter).toContain('rel="noreferrer"')
  })
})
