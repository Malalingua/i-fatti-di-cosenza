import { describe, it, expect } from 'vitest'
import { sortCategoriesEditorially, selectLead, splitBriefs, pickOtherNews, pickCategoryBoxes, pickManualOnly, buildLatestFeed, selectHomepage, shownArticles, replacementsOverTime } from './homepage'
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
    const { top } = splitBriefs(slots, auto, 'lead')
    expect(ids(top)).toEqual(['a1', 'p2', 'p3', 'a2'])
  })

  it('uses all 4 chosen articles in order', () => {
    const slots = ['p1', 'p2', 'p3', 'p4'].map((id) => makeArticle(id, 'x'))
    const auto = [makeArticle('a1', 'come-campiamo')]
    const { top } = splitBriefs(slots, auto, 'lead')
    expect(ids(top)).toEqual(['p1', 'p2', 'p3', 'p4'])
  })

  it('never shows the lead or the same article twice', () => {
    const slots = [makeArticle('lead', 'x'), makeArticle('p1', 'x'), makeArticle('p1', 'x'), null]
    const auto = [makeArticle('p1', 'x'), makeArticle('lead', 'x'), makeArticle('a1', 'y')]
    const { top } = splitBriefs(slots, auto, 'lead')
    expect(ids(top)).toEqual(['a1', 'p1', null, null])
  })

  it('falls back to automatic articles when no slot is chosen', () => {
    const auto = ['a1', 'a2', 'a3', 'a4', 'a5'].map((id) => makeArticle(id, 'x'))
    const { top } = splitBriefs([], auto, 'lead')
    expect(ids(top)).toEqual(['a1', 'a2', 'a3', 'a4'])
  })
})

describe('pickOtherNews', () => {
  it('returns the latest articles not already shown, up to the limit', () => {
    const latest = ['lead', 'a1', 'b1', 'b2', 'b3', 'b4', 'b5'].map((id) => makeArticle(id, 'x'))
    const shown = [makeArticle('lead', 'x'), makeArticle('a1', 'x'), null]
    expect(pickOtherNews(latest, shown, 4).map((a) => a._id)).toEqual(['b1', 'b2', 'b3', 'b4'])
  })

  it('returns an empty list when everything is already shown', () => {
    const latest = [makeArticle('lead', 'x')]
    expect(pickOtherNews(latest, [makeArticle('lead', 'x')], 4)).toEqual([])
  })
})

describe('pickCategoryBoxes', () => {
  it('picks the newest article of each category, skipping excluded ids', () => {
    const lead = makeArticle('lead', 'come-campiamo')
    const cc = makeArticle('cc', 'come-campiamo')
    const pp = makeArticle('pp', 'poltrone')
    const boxes = pickCategoryBoxes([[lead, cc], [pp]], ['lead'])
    expect(boxes.map((a) => a?._id)).toEqual(['cc', 'pp'])
  })

  it('leaves a box empty rather than showing an article from another category', () => {
    const pp = makeArticle('pp', 'poltrone')
    const boxes = pickCategoryBoxes([[], [pp]], [])
    expect(boxes.map((a) => a?._id)).toEqual([undefined, 'pp'])
  })

  it('returns undefined when nothing is left to show', () => {
    expect(pickCategoryBoxes([[]], [])).toEqual([undefined])
  })
})

describe('pickCategoryBoxes with manual picks', () => {
  it('uses the manual pick for its box instead of the newest article', () => {
    const newest = makeArticle('newest', 'come-campiamo')
    const chosen = makeArticle('chosen', 'come-campiamo')
    const boxes = pickCategoryBoxes([[newest, chosen]], [], [chosen], ['come-campiamo'])
    expect(boxes.map((a) => a?._id)).toEqual(['chosen'])
  })

  it('does not reuse a manual pick in another box', () => {
    const chosen = makeArticle('chosen', 'poltrone')
    const other = makeArticle('other', 'poltrone')
    const boxes = pickCategoryBoxes([[chosen, other], [chosen, other]], [], [null, chosen], ['poltrone', 'poltrone'])
    expect(boxes.map((a) => a?._id)).toEqual(['other', 'chosen'])
  })

  it('ignores a manual pick from a different category', () => {
    const wrong = makeArticle('wrong', 'come-campiamo')
    const right = makeArticle('right', 'carta-canta')
    const boxes = pickCategoryBoxes([[right]], [], [wrong], ['carta-canta'])
    expect(boxes.map((a) => a?._id)).toEqual(['right'])
  })

  it('ignores a manual pick that is already the lead', () => {
    const lead = makeArticle('lead', 'poltrone')
    const other = makeArticle('other', 'poltrone')
    const boxes = pickCategoryBoxes([[lead, other]], ['lead'], [lead], ['poltrone'])
    expect(boxes.map((a) => a?._id)).toEqual(['other'])
  })
})

function at(id: string, publishedAt: string): ArticleSummary {
  return { ...makeArticle(id, 'come-campiamo'), publishedAt }
}

describe('pickManualOnly', () => {
  it('keeps positions, leaving empty ones empty instead of auto-filling', () => {
    const a = makeArticle('a', 'poltrone')
    expect(pickManualOnly([null, a], [], 2).map((x) => x?._id ?? null)).toEqual([null, 'a'])
  })

  it('empties a position whose article is already shown above', () => {
    const a = makeArticle('a', 'poltrone')
    expect(pickManualOnly([a, a], [a], 2)).toEqual([null, null])
  })
})

describe('buildLatestFeed', () => {
  it('orders by replacement time, latest replaced on top, whatever the publish date', () => {
    const first = { article: at('first', '2026-09-29T10:00:00.000Z'), removedAt: '2026-09-29T17:50:00.000Z' }
    const second = { article: at('second', '2026-09-20T10:00:00.000Z'), removedAt: '2026-09-29T18:00:00.000Z' }
    expect(buildLatestFeed([first, second], [], 10).map((x) => x._id)).toEqual(['second', 'first'])
  })

  it('is empty when nothing has been replaced yet', () => {
    expect(buildLatestFeed([], [], 10)).toEqual([])
  })

  it('leaves out an article that is back on the homepage', () => {
    const a = at('a', '2026-09-29T10:00:00.000Z')
    expect(buildLatestFeed([{ article: a, removedAt: '2026-09-29T18:00:00.000Z' }], [a], 10)).toEqual([])
  })
})

describe('selectHomepage', () => {
  const sources = (overrides: Partial<Parameters<typeof selectHomepage>[1]> = {}) => ({
    featured: [],
    latest: [],
    categoryLists: [[]],
    boxSlugs: ['poltrone'],
    ...overrides,
  })

  it('uses the featured article as lead when none is picked, so replacing it counts', () => {
    const scuola = makeArticle('scuola', 'carta-canta')
    const giudice = makeArticle('giudice', 'tribunali-e-tribolazioni')
    const before = selectHomepage({ lead: null, slots: [], raccolta: [] }, sources({ featured: [scuola] }))
    const after = selectHomepage({ lead: giudice, slots: [], raccolta: [] }, sources({ featured: [scuola] }))
    expect(shownArticles(before).map((a) => a._id)).toEqual(['scuola'])
    expect(shownArticles(after).map((a) => a._id)).toEqual(['giudice'])
  })

  it('lists the automatic box article as shown', () => {
    const lead = makeArticle('lead', 'carta-canta')
    const auto = makeArticle('auto', 'poltrone')
    const layout = selectHomepage({ lead, slots: [null], raccolta: [] }, sources({ categoryLists: [[auto]] }))
    expect(shownArticles(layout).map((a) => a._id)).toEqual(['lead', 'auto'])
  })
})

describe('replacementsOverTime', () => {
  const SINCE = '2026-09-29T18:00:00.000Z'
  const art = (id: string, category: string, publishedAt: string, featured = false): ArticleSummary => ({
    ...makeArticle(id, category),
    publishedAt,
    featured,
  })
  const noPicks = { lead: null, slots: [], raccolta: [] }

  it('records the old lead when a newer article is flagged "In evidenza"', () => {
    const scuola = art('scuola', 'carta-canta', '2026-09-24T16:45:00.000Z', true)
    const giudice = art('giudice', 'tribunali-e-tribolazioni', '2026-09-29T18:25:00.000Z', true)
    const result = replacementsOverTime([{ time: SINCE, picks: noPicks }], [scuola, giudice], [], SINCE)
    expect(result).toEqual([{ id: 'scuola', removedAt: '2026-09-29T18:25:00.000Z' }])
  })

  it('records an article replaced by hand in a box at the Homepage publish time', () => {
    const lead = art('lead', 'carta-canta', '2026-09-20T10:00:00.000Z', true)
    const rossi = art('rossi', 'poltrone', '2026-09-21T10:00:00.000Z')
    const prezzi = art('prezzi', 'poltrone', '2026-09-22T10:00:00.000Z')
    const versions = [
      { time: SINCE, picks: { lead: null, slots: [rossi], raccolta: [] } },
      { time: '2026-09-29T18:11:00.000Z', picks: { lead: null, slots: [prezzi], raccolta: [] } },
    ]
    const result = replacementsOverTime(versions, [lead, rossi, prezzi], ['poltrone'], SINCE)
    expect(result).toEqual([{ id: 'rossi', removedAt: '2026-09-29T18:11:00.000Z' }])
  })

  it('records an automatic box article pushed out by a newer one in its category', () => {
    const lead = art('lead', 'carta-canta', '2026-09-20T10:00:00.000Z', true)
    const older = art('older', 'poltrone', '2026-09-21T10:00:00.000Z')
    const newer = art('newer', 'poltrone', '2026-09-29T19:00:00.000Z')
    const result = replacementsOverTime([{ time: SINCE, picks: noPicks }], [lead, older, newer], ['poltrone'], SINCE)
    expect(result).toEqual([{ id: 'older', removedAt: '2026-09-29T19:00:00.000Z' }])
  })

  it('returns nothing without history', () => {
    expect(replacementsOverTime([], [], [], SINCE)).toEqual([])
  })
})
