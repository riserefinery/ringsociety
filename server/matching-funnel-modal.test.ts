import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('matching-funnel modal', () => {
  it('keeps the existing quiz in a dismissible in-page modal without a browser pop-up', () => {
    const rootShell = readFileSync(resolve(root, 'src/app/Root.tsx'), 'utf8')
    const modal = readFileSync(resolve(root, 'src/components/MatchingFunnelModal.tsx'), 'utf8')

    expect(rootShell).toContain('<MatchingFunnelModal />')
    expect(modal).toContain("https://app.ringsociety.com/quiz/find-your-ring")
    expect(modal).toContain('role="dialog"')
    expect(modal).toContain('aria-modal="true"')
    expect(modal).toContain("event.key === 'Escape'")
    expect(modal).toContain('h-[90vh] w-[90vw]')
    expect(modal).toContain('rounded-lg')
    expect(modal).not.toContain('window.open')
  })
})
