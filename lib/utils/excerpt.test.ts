import { describe, it, expect } from 'vitest'
import { truncateExcerpt } from './excerpt'

describe('truncateExcerpt', () => {
  it('returns short text unchanged', () => {
    expect(truncateExcerpt('Testo breve.', 140)).toBe('Testo breve.')
  })

  it('truncates long text at a word boundary with an ellipsis', () => {
    const text = 'a'.repeat(10) + ' ' + 'b'.repeat(10) + ' ' + 'c'.repeat(10)
    expect(truncateExcerpt(text, 15)).toBe('aaaaaaaaaa…')
  })
})
