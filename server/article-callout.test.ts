import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import ArticleCallout from '../src/components/ArticleCallout'

const root = resolve(import.meta.dirname, '..')
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')

describe('shared editorial article callout', () => {
  it('renders only the message, with no repeated Key Advice label or heading', () => {
    const text = 'Compare stones side by side in everyday lighting.'
    const html = renderToStaticMarkup(createElement(ArticleCallout, { text }))
    expect(html).toContain(`<p>${text}</p>`)
    expect(html).not.toMatch(/key advice/i)
    expect(html).not.toMatch(/<h[1-6]/)
    expect(html).toContain('role="note"')
  })

  it('uses 26px regular Instrument Serif, 140% leading, and only a 2px indented left rule', () => {
    const html = renderToStaticMarkup(createElement(ArticleCallout, { text: 'Editorial emphasis' }))
    expect(html).toContain('Instrument Serif')
    expect(html).toContain('text-[26px]')
    expect(html).toContain('font-normal')
    expect(html).toContain('leading-[1.4]')
    expect(html).toContain('border-l-2 border-black')
    expect(html).toContain('pl-6')
    expect(html).not.toContain('rounded')
    expect(html).not.toContain('bg-')
    expect(html).not.toContain('body-copy')
  })

  it('routes every shared note block through the module while keeping 32px blockquotes separate', () => {
    const article = read('src/pages/Article.tsx')
    expect(article).toContain('<ArticleCallout key={key} text={block.text} />')
    expect(article).not.toContain('{block.label}:')
    expect(article).toContain('border-l border-black py-1 pl-5 text-[32px] leading-[1.3]')
  })
})
