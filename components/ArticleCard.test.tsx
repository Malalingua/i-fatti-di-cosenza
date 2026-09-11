import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleCard } from './ArticleCard'
import type { ArticleSummary } from '@/lib/sanity/types'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />,
}))

vi.mock('@/lib/sanity/image', () => ({
  urlForImage: () => ({ width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/test.jpg' }) }) }),
}))

const article: ArticleSummary = {
  _id: '1',
  title: 'Il centro storico si rifà il look',
  slug: 'centro-storico-rifa-look',
  excerpt: 'Al via i lavori di riqualificazione di Corso Mazzini.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-09-11T12:00:00.000Z',
  category: { _id: 'c1', name: 'Cronaca', slug: 'cronaca', accentColor: '#C81E2D' },
}

describe('ArticleCard', () => {
  it('renders title, excerpt, category, and date', () => {
    render(<ArticleCard article={article} />)
    expect(screen.getByText(article.title)).toBeInTheDocument()
    expect(screen.getByText(article.excerpt)).toBeInTheDocument()
    expect(screen.getByText('Cronaca')).toBeInTheDocument()
    expect(screen.getByText('11 settembre 2026')).toBeInTheDocument()
  })

  it('links title and image to the article page', () => {
    render(<ArticleCard article={article} />)
    const links = screen.getAllByRole('link')
    expect(links.every((link) => link.getAttribute('href') === '/articolo/centro-storico-rifa-look')).toBe(true)
  })
})
