// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const revalidatePathMock = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

beforeEach(() => {
  revalidatePathMock.mockClear()
  process.env.SANITY_REVALIDATE_SECRET = 'test-secret'
})

describe('POST /api/revalidate', () => {
  it('rejects requests with a missing or wrong secret', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/revalidate?secret=wrong', {
      method: 'POST',
      body: JSON.stringify({ _type: 'article', slug: { current: 'test' } }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('revalidates the homepage, category, and article path for an article payload', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/revalidate?secret=test-secret', {
      method: 'POST',
      body: JSON.stringify({ _type: 'article', slug: { current: 'test-slug' }, categorySlug: 'cronaca' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(revalidatePathMock).toHaveBeenCalledWith('/')
    expect(revalidatePathMock).toHaveBeenCalledWith('/articolo/test-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/cronaca')
  })

  it('rejects requests when the secret is an empty string, even if the configured secret is also empty', async () => {
    process.env.SANITY_REVALIDATE_SECRET = ''
    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/revalidate?secret=', {
      method: 'POST',
      body: JSON.stringify({ _type: 'article', slug: { current: 'test' } }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns 400 for a malformed JSON body', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/revalidate?secret=test-secret', {
      method: 'POST',
      body: '{not valid json',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })
})
