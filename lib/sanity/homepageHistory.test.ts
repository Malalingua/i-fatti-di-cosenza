import { describe, it, expect } from 'vitest'
import { referencedIds, replacementsFromShown } from './homepageHistory'

describe('replacementsFromShown', () => {
  it('records an article that stops being shown, with the time of that publish', () => {
    const states = [
      { time: 't0', shown: ['scuola', 'x'] },
      { time: 't1', shown: ['giudice', 'x'] },
    ]
    expect(replacementsFromShown(states)).toEqual([{ id: 'scuola', removedAt: 't1' }])
  })

  it('does not count an article that only moves to another box', () => {
    expect(replacementsFromShown([{ time: 't0', shown: ['a', 'b'] }, { time: 't1', shown: ['b', 'a'] }])).toEqual([])
  })

  it('keeps the latest removal when an article comes back and leaves again', () => {
    const states = [
      { time: 't0', shown: ['a'] },
      { time: 't1', shown: ['b'] },
      { time: 't2', shown: ['a'] },
      { time: 't3', shown: ['c'] },
    ]
    const byId = Object.fromEntries(replacementsFromShown(states).map((r) => [r.id, r.removedAt]))
    expect(byId).toEqual({ a: 't3', b: 't2' })
  })
})

describe('referencedIds', () => {
  it('collects every article referenced by any version, once', () => {
    const versions = [
      { time: 't0', doc: { lead: { _ref: 'a' }, topLeft: { _ref: 'b' } } },
      { time: 't1', doc: { lead: { _ref: 'a' }, raccolta2: { _ref: 'c' } } },
      { time: 't2', doc: null },
    ]
    expect(referencedIds(versions).sort()).toEqual(['a', 'b', 'c'])
  })
})
