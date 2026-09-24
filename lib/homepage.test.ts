import { describe, it, expect } from 'vitest'
import { sortCategoriesEditorially, selectLead } from './homepage'
import type { ArticleSummary, Category } from './sanity/types'

function makeCategory(name: string, slug: string): Category {
  return { _id: slug, name, slug, accentColor: '#000000' }
}

function makeArticle(id: string, categorySlug: string): ArticleSummary {
  return {
    _id: id,
    title: `Titolo ${id}`,
    slug: `slug-${id}`,
    excerpt: 'Sommario.',
    coverImage: {} as ArticleSummary['coverImage'],
    publishedAt: '2026-01-01T12:00:00.000Z',
    category: { _id: categorySlug, name: categorySlug, slug: categorySlug, accentColor: '#000000' },
  }
}

describe('sortCategoriesEditorially', () => {
  it('orders categories to match the fixed editorial order regardless of input order', () => {
    const input = [
      makeCategory('Carta canta', 'carta-canta'),
      makeCategory("L'intervista sincera", 'intervista-sincera'),
      makeCategory('Come campiamo', 'come-campiamo'),
      makeCategory('Italiani brava gente', 'italiani-brava-gente'),
      makeCategory('Poltrone & Potere', 'poltrone'),
      makeCategory('Tribunali e tribolazioni', 'tribunali-e-tribolazioni'),
    ]
    const sorted = sortCategoriesEditorially(input)
    expect(sorted.map((c) => c.slug)).toEqual([
      'intervista-sincera',
      'poltrone',
      'tribunali-e-tribolazioni',
      'come-campiamo',
      'italiani-brava-gente',
      'carta-canta',
    ])
  })

  it('sorts a category not in the fixed list last', () => {
    const input = [
      makeCategory('Poltrone & Potere', 'poltrone'),
      makeCategory('Meteo', 'meteo'),
      makeCategory("L'intervista sincera", 'intervista-sincera'),
    ]
    const sorted = sortCategoriesEditorially(input)
    expect(sorted.map((c) => c.slug)).toEqual(['intervista-sincera', 'poltrone', 'meteo'])
  })
})

describe('selectLead', () => {
  it('uses the featured article as lead and keeps all brief candidates when one exists', () => {
    const featured = [makeArticle('f1', 'cronaca')]
    const briefs = [makeArticle('b1', 'politica'), makeArticle('b2', 'sport')]
    const result = selectLead(featured, briefs)
    expect(result.lead).toBe(featured[0])
    expect(result.briefs).toEqual(briefs)
  })

  it('falls back to the first brief candidate as lead when nothing is featured, removing it from the briefs', () => {
    const briefs = [makeArticle('b1', 'cronaca'), makeArticle('b2', 'politica')]
    const result = selectLead([], briefs)
    expect(result.lead).toBe(briefs[0])
    expect(result.briefs).toEqual([briefs[1]])
  })

  it('returns an undefined lead and empty briefs when there is nothing at all', () => {
    const result = selectLead([], [])
    expect(result.lead).toBeUndefined()
    expect(result.briefs).toEqual([])
  })

  it('does not mutate the input briefCandidates array', () => {
    const briefs = [makeArticle('b1', 'cronaca'), makeArticle('b2', 'politica')]
    const original = [...briefs]
    selectLead([], briefs)
    expect(briefs).toEqual(original)
  })
})
