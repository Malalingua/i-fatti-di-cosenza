import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookieConsent, CookiePreferencesLink } from './CookieConsent'

vi.mock('next/script', () => ({
  default: ({ id, src }: { id?: string; src?: string }) => <script data-testid={id ?? 'gtag-src'} data-src={src} />,
}))

describe('CookieConsent', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows the banner on the first visit and does not load Analytics', () => {
    render(<CookieConsent gaId="G-TEST" />)
    expect(screen.getByRole('dialog', { name: 'Preferenze cookie' })).toBeInTheDocument()
    expect(screen.queryByTestId('ga4')).not.toBeInTheDocument()
  })

  it('loads Analytics only after Accetta and remembers the choice', () => {
    render(<CookieConsent gaId="G-TEST" />)
    fireEvent.click(screen.getByRole('button', { name: 'Accetta' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('gtag-src')).toHaveAttribute('data-src', 'https://www.googletagmanager.com/gtag/js?id=G-TEST')
    expect(window.localStorage.getItem('malalingua-cookie-consent')).toBe('granted')
  })

  it('never loads Analytics after Rifiuta', () => {
    render(<CookieConsent gaId="G-TEST" />)
    fireEvent.click(screen.getByRole('button', { name: 'Rifiuta' }))
    expect(screen.queryByTestId('ga4')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('malalingua-cookie-consent')).toBe('denied')
  })

  it('does not load Analytics outside the public site even with consent', () => {
    window.localStorage.setItem('malalingua-cookie-consent', 'granted')
    render(<CookieConsent gaId={null} />)
    expect(screen.queryByTestId('ga4')).not.toBeInTheDocument()
  })

  it('reopens the banner from the footer link', () => {
    window.localStorage.setItem('malalingua-cookie-consent', 'denied')
    render(
      <>
        <CookieConsent gaId="G-TEST" />
        <CookiePreferencesLink />
      </>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Preferenze cookie' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
