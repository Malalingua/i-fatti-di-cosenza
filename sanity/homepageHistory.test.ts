import { describe, it, expect } from 'vitest'
import { nextRemovedHistory } from './homepageHistory'

const ref = (id: string) => ({ _ref: id })
const ids = (history: ReturnType<typeof nextRemovedHistory>) => history?.map((item) => item._ref)

describe('nextRemovedHistory', () => {
  it('puts a replaced article at the top of the history', () => {
    const published = { topLeft: ref('old'), recentlyRemoved: [{ _type: 'reference' as const, _ref: 'older', _key: 'older' }] }
    const draft = { ...published, topLeft: ref('new') }
    expect(ids(nextRemovedHistory(published, draft))).toEqual(['old', 'older'])
  })

  it('tracks the lead and the Raccolta slots too', () => {
    const published = { lead: ref('a'), raccolta1: ref('b') }
    const draft = { lead: ref('c'), raccolta1: ref('d') }
    expect(ids(nextRemovedHistory(published, draft))).toEqual(['a', 'b'])
  })

  it('does not count an article moved to another slot as removed', () => {
    const published = { topLeft: ref('a'), raccolta1: ref('b') }
    const draft = { topLeft: ref('b'), raccolta1: ref('c') }
    expect(ids(nextRemovedHistory(published, draft))).toEqual(['a'])
  })

  it('drops an article from the history when it goes back on the homepage', () => {
    const published = { topLeft: ref('x'), recentlyRemoved: [{ _type: 'reference' as const, _ref: 'a', _key: 'a' }] }
    const draft = { ...published, topLeft: ref('a') }
    expect(ids(nextRemovedHistory(published, draft))).toEqual(['x'])
  })

  it('returns null when no article was removed', () => {
    const published = { topLeft: ref('a') }
    expect(nextRemovedHistory(published, { topLeft: ref('a') })).toBeNull()
  })

  it('handles the first publish with no previous version', () => {
    expect(nextRemovedHistory(null, { topLeft: ref('a') })).toBeNull()
  })
})
