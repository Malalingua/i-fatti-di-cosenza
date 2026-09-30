import { describe, it, expect, vi } from 'vitest'

vi.mock('./client', () => ({ client: { config: () => ({ projectId: 'p', dataset: 'd' }) } }))

import { hasImageAsset, hotspotPosition, imageDimensions } from './image'

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

describe('hasImageAsset', () => {
  it('is false for an image block with no uploaded photo', () => {
    expect(hasImageAsset({ _type: 'image', _key: 'k' } as never)).toBe(false)
    expect(hasImageAsset(null)).toBe(false)
  })

  it('is true once a photo is uploaded', () => {
    expect(hasImageAsset({ asset: { _ref: 'image-abc-10x10-jpg' } })).toBe(true)
  })
})

describe('hotspotPosition', () => {
  it('centres the photo when no focal point is set', () => {
    expect(hotspotPosition({ asset: { _ref: 'image-a-10x10-jpg' } })).toBe('50% 50%')
  })

  it('uses the focal point set in the Studio', () => {
    expect(hotspotPosition({ asset: { _ref: 'image-a-10x10-jpg' }, hotspot: { x: 0.3, y: 0.2 } } as never)).toBe('30% 20%')
  })

  it('shifts the focal point into the cropped area', () => {
    const image = { asset: { _ref: 'image-a-10x10-jpg' }, crop: { left: 0.2, right: 0.2, top: 0, bottom: 0 }, hotspot: { x: 0.5, y: 0.5 } }
    expect(hotspotPosition(image as never)).toBe('50% 50%')
  })
})
