import { describe, it, expect } from 'vitest'
import { referencedIds } from './homepageHistory'

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
