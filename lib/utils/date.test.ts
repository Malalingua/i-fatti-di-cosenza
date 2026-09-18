import { describe, it, expect } from 'vitest'
import { formatDate, formatMastheadDate } from './date'

describe('formatDate', () => {
  it('formats an ISO date in Italian long form', () => {
    expect(formatDate('2026-09-11T12:00:00.000Z')).toBe('11 settembre 2026')
  })

  it('formats a different month correctly', () => {
    expect(formatDate('2026-01-03T12:00:00.000Z')).toBe('3 gennaio 2026')
  })
})

describe('formatMastheadDate', () => {
  it('formats a date with a capitalized Italian weekday', () => {
    expect(formatMastheadDate(new Date('2026-01-01T12:00:00.000Z'))).toBe('Giovedì 1 gennaio 2026')
  })
})
