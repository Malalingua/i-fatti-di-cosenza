import { describe, it, expect, vi } from 'vitest'
import { paginationRange } from './queries'

vi.mock('./client', () => ({
  client: { fetch: vi.fn() },
}))

describe('paginationRange', () => {
  it('returns [0, pageSize] for the first page', () => {
    expect(paginationRange(1, 10)).toEqual([0, 10])
  })

  it('offsets by page size for later pages', () => {
    expect(paginationRange(3, 10)).toEqual([20, 30])
  })

  it('supports a custom page size', () => {
    expect(paginationRange(2, 5)).toEqual([5, 10])
  })
})
