import { describe, it, expect } from 'vitest'
import { planBulkDelete } from './bulkDelete'

describe('planBulkDelete', () => {
  it('deletes each article and its draft', () => {
    expect(planBulkDelete(['a', 'b'], []).deleteIds).toEqual(['a', 'drafts.a', 'b', 'drafts.b'])
  })

  it('clears Homepage references to the deleted articles, published and draft', () => {
    const plan = planBulkDelete(
      ['a'],
      [
        { _id: 'homepage', lead: { _ref: 'a' }, topLeft: { _ref: 'x' }, raccolta2: { _ref: 'a' } },
        { _id: 'drafts.homepage', topRight: { _ref: 'a' } },
      ]
    )
    expect(plan.unset).toEqual([
      { id: 'homepage', fields: ['lead', 'raccolta2'] },
      { id: 'drafts.homepage', fields: ['topRight'] },
    ])
  })

  it('leaves the Homepage alone when it does not point to the selection', () => {
    expect(planBulkDelete(['a'], [{ _id: 'homepage', lead: { _ref: 'x' } }]).unset).toEqual([])
  })
})
