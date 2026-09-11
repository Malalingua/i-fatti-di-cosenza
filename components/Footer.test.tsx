import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders a link for each of the 5 fixed categories', () => {
    render(<Footer />)
    for (const name of ['Cronaca', 'Politica', 'Cultura', 'Sport', 'Enogastronomia']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('renders the current year in the copyright line', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  })
})
