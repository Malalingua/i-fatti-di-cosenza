import { describe, it, expect, vi } from 'vitest'

vi.mock('./client', () => ({ client: { config: () => ({ projectId: 'p', dataset: 'd' }) } }))

import { imageDimensions } from './image'

describe('imageDimensions', () => {
  it('reads the original size from the asset id', () => {
    expect(imageDimensions({ asset: { _ref: 'image-abc123-1200x800-jpg' } })).toEqual({ width: 1200, height: 800 })
  })

  it('applies the crop set in the Studio', () => {
    const image = { asset: { _ref: 'image-abc123-1000x1000-png' }, crop: { top: 0.1, bottom: 0.1, left: 0, right: 0.5 } }
    expect(imageDimensions(image)).toEqual({ width: 500, height: 800 })
  })

  it('returns null when the size is unknown', () => {
    expect(imageDimensions({ asset: { _ref: 'something-else' } })).toBeNull()
    expect(imageDimensions(null)).toBeNull()
  })
})
