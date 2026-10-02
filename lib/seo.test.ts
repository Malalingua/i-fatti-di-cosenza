import { describe, expect, it, vi } from 'vitest'

vi.mock('./sanity/client', async () => {
  const { createClient } = await import('next-sanity')
  return { client: createClient({ projectId: 'test', dataset: 'production', apiVersion: '2024-01-01', useCdn: true }) }
})

import { bodyText, shareDescription, shareImage, DEFAULT_OG_IMAGE, SITE_DESCRIPTION } from './seo'

const body = [
  { _type: 'block', _key: 'a', children: [{ _type: 'span', text: 'Primo paragrafo.' }] },
  { _type: 'image', _key: 'b' },
  { _type: 'block', _key: 'c', children: [{ _type: 'span', text: 'Secondo ' }, { _type: 'span', text: 'paragrafo.' }] },
] as never

describe('seo helpers', () => {
  it('extracts plain text from the body, skipping images', () => {
    expect(bodyText(body)).toBe('Primo paragrafo. Secondo paragrafo.')
  })

  it('prefers the Sommario, falls back to body, then to the site description', () => {
    expect(shareDescription('Sommario scritto.', body)).toBe('Sommario scritto.')
    expect(shareDescription('  ', body)).toBe('Primo paragrafo. Secondo paragrafo.')
    expect(shareDescription(null, [])).toBe(SITE_DESCRIPTION)
  })

  it('uses the logo image when the article has no photo', () => {
    expect(shareImage(null, 'Titolo')).toBe(DEFAULT_OG_IMAGE)
  })

  it('serves article photos as 1200x630 JPEG', () => {
    const image = shareImage({ asset: { _ref: 'image-abc123-970x657-webp' } }, 'Titolo')
    expect(image.url).toContain('w=1200')
    expect(image.url).toContain('h=630')
    expect(image.url).toContain('fm=jpg')
    expect(image).toMatchObject({ width: 1200, height: 630, alt: 'Titolo' })
  })
})
