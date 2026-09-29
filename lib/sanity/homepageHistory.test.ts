import { describe, it, expect } from 'vitest'
import { replacementsFromStates } from './homepageHistory'

const ref = (id: string) => ({ _ref: id })

describe('replacementsFromStates', () => {
  it('records an article replaced in a box with the time of that publish', () => {
    const states = [
      { time: 't0', doc: { topRight: ref('david-rossi') } },
      { time: 't1', doc: { topRight: ref('caro-prezzi') } },
    ]
    expect(replacementsFromStates(states)).toEqual([{ id: 'david-rossi', removedAt: 't1' }])
  })

  it('tracks the lead and the Raccolta slots too', () => {
    const states = [
      { time: 't0', doc: { lead: ref('a'), raccolta2: ref('b') } },
      { time: 't1', doc: { lead: ref('c'), raccolta2: ref('d') } },
    ]
    expect(replacementsFromStates(states).map((r) => r.id)).toEqual(['a', 'b'])
  })

  it('does not count an article moved to another box as replaced', () => {
    const states = [
      { time: 't0', doc: { topLeft: ref('a'), topRight: ref('b') } },
      { time: 't1', doc: { topLeft: ref('b'), topRight: ref('c') } },
    ]
    expect(replacementsFromStates(states).map((r) => r.id)).toEqual(['a'])
  })

  it('keeps the latest removal when an article comes back and is replaced again', () => {
    const states = [
      { time: 't0', doc: { topLeft: ref('a') } },
      { time: 't1', doc: { topLeft: ref('b') } },
      { time: 't2', doc: { topLeft: ref('a') } },
      { time: 't3', doc: { topLeft: ref('c') } },
    ]
    const byId = Object.fromEntries(replacementsFromStates(states).map((r) => [r.id, r.removedAt]))
    expect(byId).toEqual({ a: 't3', b: 't2' })
  })

  it('returns nothing without changes', () => {
    expect(replacementsFromStates([{ time: 't0', doc: { topLeft: ref('a') } }])).toEqual([])
  })
})
