import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OtherNewsCard } from './OtherNewsCard'
import type { ArticleSummary } from '@/lib/sanity/types'

const article: ArticleSummary = {
  _id: '1',
  title: 'Muore giovane promessa elettorale',
  slug: 'muore-giovane-promessa-elettorale',
  excerpt: 'Aveva appena cinque campagne.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-01-03T12:00:00.000Z',
  category: { _id: 'c2', name: 'Poltrone & Potere', slug: 'poltrone', accentColor: '#C81E2D' },
}

describe('OtherNewsCard', () => {
  it('renders category, title, and excerpt linking to the article', () => {
    render(<OtherNewsCard article={article} />)
    expect(screen.getByText('Poltrone & Potere')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: article.title })).toBeInTheDocument()
    expect(screen.getByText('Aveva appena cinque campagne.')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articolo/muore-giovane-promessa-elettorale')
  })
})
