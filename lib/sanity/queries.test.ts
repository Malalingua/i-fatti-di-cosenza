import { describe, it, expect, vi } from 'vitest'
import {
  paginationRange,
  featuredArticlesQuery,
  latestArticlesQuery,
  categoryArticlesQuery,
  articleBySlugQuery,
  searchArticlesQuery,
  homepageSlotsQuery,
  articleSlugsQuery,
} from './queries'

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

describe('scheduled articles', () => {
  it.each([
    ['featured', featuredArticlesQuery],
    ['latest', latestArticlesQuery],
    ['category', categoryArticlesQuery],
    ['by slug', articleBySlugQuery],
    ['search', searchArticlesQuery],
    ['sitemap slugs', articleSlugsQuery],
  ])('%s query hides articles with a future publish date', (_name, query) => {
    expect(query).toContain('publishedAt <= now()')
  })

  it('homepage slots hide articles with a future publish date', () => {
    for (const slot of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']) {
      expect(homepageSlotsQuery).toContain(`${slot}->publishedAt <= now()`)
    }
  })
})
