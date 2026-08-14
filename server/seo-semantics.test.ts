import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8')

describe('public SEO, form, and typography system', () => {
  it('uses one shared reading-copy utility and applies the newsletter field shell to Contact inputs', () => {
    const styles = read('src/index.css')
    const leadForm = read('src/components/LeadForm.tsx')
    const contact = read('src/pages/Contact.tsx')

    expect(styles).toContain('.body-copy')
    expect(styles).toContain('font-size: 17px')
    expect(leadForm).toContain("const contactField = `mt-3 ${field} text-[#173d2c]`")
    expect(contact).toContain('background: \'var(--cream)\'')
  })

  it('ships page and article metadata without advertising a nonexistent search route', () => {
    const shell = read('index.html')
    const rootShell = read('src/app/Root.tsx')
    const article = read('src/pages/Article.tsx')

    expect(shell).not.toContain('SearchAction')
    expect(shell).not.toContain('/search?q=')
    expect(rootShell).toContain('const canonicalHost = \'https://ringsociety.com\'')
    expect(article).toContain('ring-society-article-schema')
    expect(article).toContain("'@type': 'Article'")
    expect(article).toContain('document.title = `${doc.title} | Ring Society`')
  })

  it('uses semantic section headings on mission and contact content', () => {
    const mission = read('src/pages/OurMission.tsx')
    const contact = read('src/pages/Contact.tsx')

    expect(mission).toContain('<h2 className="text-[11px] font-semibold uppercase')
    expect(mission).toContain('<h3 className="text-[18px] font-medium')
    expect(contact).toContain('<h2 className="text-[11px] font-semibold uppercase')
  })
})
