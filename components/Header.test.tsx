import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Header', () => {
  it('renders a link for each of the 6 fixed categories', () => {
    render(<Header />)
    const expected = [
      ["L'intervista sincera", '/intervista-sincera'],
      ['Poltrone & Potere', '/poltrone'],
      ['Tribunali e tribolazioni', '/tribunali-e-tribolazioni'],
      ['Come campiamo', '/come-campiamo'],
      ['Italiani brava gente', '/italiani-brava-gente'],
      ['Carta canta', '/carta-canta'],
    ]
    for (const [name, href] of expected) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('renders the site name linking home', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'I Fatti di Cosenza' })).toHaveAttribute('href', '/')
  })

  it('renders the satirical tagline', () => {
    render(<Header />)
    expect(screen.getByText('Blog satirico dalla calabria')).toBeInTheDocument()
  })

  it('renders the masthead date for a given date', () => {
    render(<Header date={new Date('2026-01-01T12:00:00.000Z')} />)
    expect(screen.getByText('Giovedì 1 gennaio 2026')).toBeInTheDocument()
  })
})
