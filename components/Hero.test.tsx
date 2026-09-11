import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import type { ArticleSummary } from '@/lib/sanity/types'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />,
}))

vi.mock('@/lib/sanity/image', () => ({
  urlForImage: () => ({ width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/hero.jpg' }) }) }),
}))

const article: ArticleSummary = {
  _id: '1',
  title: 'La Calabria celebra il Redentore',
  slug: 'calabria-celebra-redentore',
  excerpt: 'Migliaia in strada per la festa più sentita.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-09-11T12:00:00.000Z',
  category: { _id: 'c1', name: 'Cultura', slug: 'cultura', accentColor: '#7A1EC8' },
}

describe('Hero', () => {
  it('renders the featured article title, category, and date', () => {
    render(<Hero article={article} />)
    expect(screen.getByRole('heading', { name: article.title })).toBeInTheDocument()
    expect(screen.getByText('Cultura')).toBeInTheDocument()
    expect(screen.getByText('11 settembre 2026')).toBeInTheDocument()
  })

  it('links to the article page', () => {
    render(<Hero article={article} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articolo/calabria-celebra-redentore')
  })
})
