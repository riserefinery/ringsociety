import { describe, expect, it } from 'vitest'
import { getRelated, type ArticleDoc } from '../src/lib/content'

const baseDoc: ArticleDoc = {
  slug: 'current-guide',
  category: 'Guide',
  title: 'Current Guide',
  subtitle: 'Current article summary',
  readTime: '1 minute read',
  hero: '/current.jpg',
  categories: ['Guides'],
  keywordTags: [],
  intro: [],
  body: [],
}

describe('article related-guide recommendations', () => {
  it('preserves an editor override order while excluding the active article and duplicates', () => {
    const related = getRelated({
      ...baseDoc,
      related: [
        { category: 'Guide', title: 'Current Guide', cta: 'view the guide', image: '/current.jpg', to: '/guides/current-guide' },
        { category: 'Guide', title: 'Chosen Guide', cta: 'view the guide', image: '/chosen.jpg', to: '/guides/chosen-guide' },
        { category: 'Guide', title: 'Chosen Guide Again', cta: 'view the guide', image: '/chosen-repeat.jpg', to: '/guides/chosen-guide' },
        { category: 'Guide', title: 'Second Guide', cta: 'view the guide', image: '/second.jpg', to: '/guides/second-guide' },
      ],
    })

    expect(related.map((card) => card.to)).toEqual(['/guides/chosen-guide', '/guides/second-guide'])
  })

  it('uses published popular cards first when no editor override is selected', () => {
    const related = getRelated({
      ...baseDoc,
      popularRelated: [
        { category: 'Guide', title: 'Current Guide', cta: 'view the guide', image: '/current.jpg', to: '/guides/current-guide' },
        { category: 'Guide', title: 'Popular Guide', cta: 'view the guide', image: '/popular.jpg', to: '/guides/popular-guide' },
      ],
    })

    expect(related[0]?.to).toBe('/guides/popular-guide')
    expect(related.map((card) => card.to)).not.toContain('/guides/current-guide')
    expect(related).toHaveLength(3)
  })
})
