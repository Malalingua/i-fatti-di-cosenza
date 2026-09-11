import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildSearchHref, SearchBox } from './SearchBox'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  pushMock.mockClear()
})

describe('buildSearchHref', () => {
  it('URL-encodes the search term into the query string', () => {
    expect(buildSearchHref('sagra peperoncino')).toBe('/cerca?q=sagra%20peperoncino')
  })
})

describe('SearchBox', () => {
  it('navigates to the search page on submit', async () => {
    render(<SearchBox />)
    await userEvent.type(screen.getByLabelText('Cerca notizie'), 'Calabria')
    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    expect(pushMock).toHaveBeenCalledWith('/cerca?q=Calabria')
  })

  it('does not navigate on empty submit', async () => {
    render(<SearchBox />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    expect(pushMock).not.toHaveBeenCalled()
  })
})
