import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Header', () => {
  it('renders a link for each of the 5 fixed categories', () => {
    render(<Header />)
    const expected = [
      ['Cronaca', '/cronaca'],
      ['Politica', '/politica'],
      ['Cultura', '/cultura'],
      ['Sport', '/sport'],
      ['Enogastronomia', '/enogastronomia'],
    ]
    for (const [name, href] of expected) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('renders the site name linking home', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'I Fatti di Cosenza' })).toHaveAttribute('href', '/')
  })
})
