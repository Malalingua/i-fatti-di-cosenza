import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders a link for each of the 6 fixed categories', () => {
    render(<Footer />)
    for (const name of [
      "L'intervista sincera",
      'Poltrone',
      'Tribunali e tribolazioni',
      'Come campiamo',
      'Italiani brava gente',
      'Carta canta',
    ]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('renders the current year in the copyright line', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  })
})
