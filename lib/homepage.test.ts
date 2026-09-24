import { describe, it, expect } from 'vitest'
import { sortCategoriesEditorially, selectLead, splitBriefs } from './homepage'
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

describe('splitBriefs', () => {
  const ids = (articles: (ArticleSummary | null)[]) => articles.map((a) => a?._id ?? null)

  it('keeps each chosen article in its own slot position', () => {
    const slots = [null, makeArticle('p2', 'poltrone'), makeArticle('p3', 'carta-canta'), null]
    const auto = [makeArticle('a1', 'come-campiamo'), makeArticle('a2', 'italiani-brava-gente'), makeArticle('a3', 'tribunali')]
    const { top, more } = splitBriefs(slots, auto, 'lead')
    expect(ids(top)).toEqual(['a1', 'p2', 'p3', 'a2'])
    expect(ids(more)).toEqual(['a3'])
  })

  it('uses all 4 chosen articles in order and sends automatic ones below', () => {
    const slots = ['p1', 'p2', 'p3', 'p4'].map((id) => makeArticle(id, 'x'))
    const auto = [makeArticle('a1', 'come-campiamo')]
    const { top, more } = splitBriefs(slots, auto, 'lead')
    expect(ids(top)).toEqual(['p1', 'p2', 'p3', 'p4'])
    expect(ids(more)).toEqual(['a1'])
  })

  it('never shows the lead or the same article twice', () => {
    const slots = [makeArticle('lead', 'x'), makeArticle('p1', 'x'), makeArticle('p1', 'x'), null]
    const auto = [makeArticle('p1', 'x'), makeArticle('lead', 'x'), makeArticle('a1', 'y')]
    const { top, more } = splitBriefs(slots, auto, 'lead')
    expect(ids(top)).toEqual(['a1', 'p1', null, null])
    expect(more).toEqual([])
  })

  it('falls back to automatic articles when no slot is chosen', () => {
    const auto = ['a1', 'a2', 'a3', 'a4', 'a5'].map((id) => makeArticle(id, 'x'))
    const { top, more } = splitBriefs([], auto, 'lead')
    expect(ids(top)).toEqual(['a1', 'a2', 'a3', 'a4'])
    expect(ids(more)).toEqual(['a5'])
  })
})
