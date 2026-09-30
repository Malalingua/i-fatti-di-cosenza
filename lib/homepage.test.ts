import { describe, it, expect } from 'vitest'
import { sortCategoriesEditorially, selectLead, splitBriefs, pickOtherNews, pickManualBoxes, pickManualOnly, buildLatestFeed, selectHomepage, shownArticles, replacementsOverTime } from './homepage'
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
      makeCategory("L'intervista sincera", 'nessuno-l-ha-mai-chiesto'),
      makeCategory('Come campiamo', 'come-campiamo'),
      makeCategory('Italiani brava gente', 'italiani-brava-gente'),
      makeCategory('Poltrone & Potere', 'poltrone'),
      makeCategory('Tribunali e tribolazioni', 'tribunali-e-tribolazioni'),
    ]
    const sorted = sortCategoriesEditorially(input)
    expect(sorted.map((c) => c.slug)).toEqual([
      'nessuno-l-ha-mai-chiesto',
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
      makeCategory("L'intervista sincera", 'nessuno-l-ha-mai-chiesto'),
    ]
    const sorted = sortCategoriesEditorially(input)
    expect(sorted.map((c) => c.slug)).toEqual(['nessuno-l-ha-mai-chiesto', 'poltrone', 'meteo'])
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

describe('pickManualBoxes', () => {
  it('shows only the articles chosen by hand, one per box', () => {
    const cc = makeArticle('cc', 'come-campiamo')
    const pp = makeArticle('pp', 'poltrone')
    expect(pickManualBoxes([cc, pp], ['come-campiamo', 'poltrone'], []).map((a) => a?._id)).toEqual(['cc', 'pp'])
  })

  it('leaves an unchosen box empty instead of filling it automatically', () => {
    expect(pickManualBoxes([null], ['poltrone'], [])).toEqual([undefined])
  })

  it('ignores a pick from another category, the lead, or a repeat', () => {
    const lead = makeArticle('lead', 'poltrone')
    const wrong = makeArticle('wrong', 'come-campiamo')
    const pp = makeArticle('pp', 'poltrone')
    const boxes = pickManualBoxes([wrong, lead, pp, pp], ['poltrone', 'poltrone', 'poltrone', 'poltrone'], ['lead'])
    expect(boxes.map((a) => a?._id)).toEqual([undefined, undefined, 'pp', undefined])
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
  const SINCE = '2026-09-29T18:00:00.000Z'

  it('lists a new article not placed in any box, newest on top', () => {
    const older = at('older', '2026-09-30T16:00:00.000Z')
    const newer = at('newer', '2026-09-30T17:00:00.000Z')
    expect(buildLatestFeed([], [newer, older], [], SINCE, 10).map((x) => x._id)).toEqual(['newer', 'older'])
  })

  it('puts an article replaced in a box above one published earlier', () => {
    const fresh = at('fresh', '2026-09-30T17:00:00.000Z')
    const replaced = { article: at('replaced', '2026-09-20T10:00:00.000Z'), removedAt: '2026-09-30T18:00:00.000Z' }
    expect(buildLatestFeed([replaced], [fresh], [], SINCE, 10).map((x) => x._id)).toEqual(['replaced', 'fresh'])
  })

  it('leaves out articles on the homepage and old articles never replaced', () => {
    const shown = at('shown', '2026-09-30T17:00:00.000Z')
    const old = at('old', '2026-09-24T10:00:00.000Z')
    expect(buildLatestFeed([], [shown, old], [shown], SINCE, 10)).toEqual([])
  })
})

describe('selectHomepage', () => {
  const sources = (overrides: Partial<Parameters<typeof selectHomepage>[1]> = {}) => ({
    featured: [],
    latest: [],
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

  it('does not fill an unchosen box with the newest article of its category', () => {
    const lead = makeArticle('lead', 'carta-canta')
    const newest = makeArticle('newest', 'poltrone')
    const layout = selectHomepage({ lead, slots: [null], raccolta: [] }, sources({ latest: [newest] }))
    expect(shownArticles(layout).map((a) => a._id)).toEqual(['lead'])
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

  it('returns nothing without history', () => {
    expect(replacementsOverTime([], [], [], SINCE)).toEqual([])
  })
})
