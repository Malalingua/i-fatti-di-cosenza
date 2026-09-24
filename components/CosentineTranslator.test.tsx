import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CosentineTranslator } from './CosentineTranslator'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CosentineTranslator', () => {
  it('renders the form with input and button', () => {
    render(<CosentineTranslator />)
    expect(screen.getByPlaceholderText(/scrivi una frase/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /traduci in cosentino/i })).toBeInTheDocument()
  })

  it('disables button when input is empty', () => {
    render(<CosentineTranslator />)
    const button = screen.getByRole('button', { name: /traduci in cosentino/i })
    expect(button).toBeDisabled()
  })

  it('enables button when input has text', async () => {
    render(<CosentineTranslator />)
    const input = screen.getByPlaceholderText(/scrivi una frase/i)
    const button = screen.getByRole('button', { name: /traduci in cosentino/i })

    await userEvent.type(input, 'Avviato un percorso')
    expect(button).not.toBeDisabled()
  })

  it('shows error when text exceeds 300 characters', async () => {
    render(<CosentineTranslator />)
    const input = screen.getByPlaceholderText(/scrivi una frase/i)
    const longText = 'a'.repeat(301)

    await userEvent.type(input, longText)
    expect(screen.getByText(/massimo 300 caratteri/i)).toBeInTheDocument()
  })

  it('shows loading state while translating', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    render(<CosentineTranslator />)
    const input = screen.getByPlaceholderText(/scrivi una frase/i)
    const button = screen.getByRole('button', { name: /traduci in cosentino/i })

    await userEvent.type(input, 'Test')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/traduzione in corso/i)).toBeInTheDocument()
    })
  })
})
