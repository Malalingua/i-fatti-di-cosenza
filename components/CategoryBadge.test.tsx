import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadge } from './CategoryBadge'

describe('CategoryBadge', () => {
  it('renders the category name', () => {
    render(<CategoryBadge name="Sport" accentColor="#1E5AC8" />)
    expect(screen.getByText('Sport')).toBeInTheDocument()
  })

  it('applies the accent color as the background', () => {
    render(<CategoryBadge name="Cultura" accentColor="#7A1EC8" />)
    expect(screen.getByText('Cultura')).toHaveStyle({ backgroundColor: '#7A1EC8' })
  })
})
