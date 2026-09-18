import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BriefCard } from './BriefCard'
import type { ArticleSummary } from '@/lib/sanity/types'

const article: ArticleSummary = {
  _id: '1',
  title: 'Il consiglio comunale approva il bilancio',
  slug: 'consiglio-comunale-bilancio',
  excerpt: 'Sintesi della seduta.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-01-03T12:00:00.000Z',
  category: { _id: 'c2', name: 'Politica', slug: 'politica', accentColor: '#1E5AC8' },
}

describe('BriefCard', () => {
  it('renders category, title, and date', () => {
    render(<BriefCard article={article} />)
    expect(screen.getByText('Politica')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: article.title })).toBeInTheDocument()
    expect(screen.getByText('3 gennaio 2026')).toBeInTheDocument()
  })

  it('links to the article page', () => {
    render(<BriefCard article={article} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articolo/consiglio-comunale-bilancio')
  })
})
