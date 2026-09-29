import { describe, it, expect } from 'vitest'
import { nextRemovedHistory, type RemovedEntry } from './homepageHistory'

const NOW = '2026-09-29T18:00:00.000Z'
const ref = (id: string) => ({ _ref: id })
const old = (id: string): RemovedEntry => ({
  _type: 'removedArticle',
  _key: id,
  article: { _type: 'reference', _ref: id, _weak: true },
  removedAt: '2026-09-28T10:00:00.000Z',
})
const ids = (history: RemovedEntry[] | null) => history?.map((item) => item.article._ref)

describe('nextRemovedHistory', () => {
  it('puts a replaced article at the top with the removal time', () => {
    const published = { topLeft: ref('old'), recentlyRemoved: [old('older')] }
    const draft = { ...published, topLeft: ref('new') }
    const history = nextRemovedHistory(published, draft, NOW)
    expect(ids(history)).toEqual(['old', 'older'])
    expect(history?.[0].removedAt).toBe(NOW)
    expect(history?.[1].removedAt).toBe('2026-09-28T10:00:00.000Z')
  })

  it('tracks the lead and the Raccolta slots too', () => {
    const history = nextRemovedHistory({ lead: ref('a'), raccolta1: ref('b') }, { lead: ref('c'), raccolta1: ref('d') }, NOW)
    expect(ids(history)).toEqual(['a', 'b'])
  })

  it('does not count an article moved to another slot as removed', () => {
    const history = nextRemovedHistory({ topLeft: ref('a'), raccolta1: ref('b') }, { topLeft: ref('b'), raccolta1: ref('c') }, NOW)
    expect(ids(history)).toEqual(['a'])
  })

  it('drops an article from the history when it goes back on the homepage', () => {
    const published = { topLeft: ref('x'), recentlyRemoved: [old('a')] }
    expect(ids(nextRemovedHistory(published, { ...published, topLeft: ref('a') }, NOW))).toEqual(['x'])
  })

  it('returns null when nothing changed', () => {
    expect(nextRemovedHistory({ topLeft: ref('a') }, { topLeft: ref('a') }, NOW)).toBeNull()
    expect(nextRemovedHistory(null, { topLeft: ref('a') }, NOW)).toBeNull()
  })
})
