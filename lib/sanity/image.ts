import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}

interface ImageWithMeta {
  asset?: { _ref?: string; _id?: string }
  crop?: { top?: number; bottom?: number; left?: number; right?: number }
}

// Real size of an uploaded image, after the crop set in the Studio. The asset
// id encodes the original size (image-<hash>-<width>x<height>-<ext>).
export function imageDimensions(source: SanityImageSource | null | undefined): { width: number; height: number } | null {
  const image = source as ImageWithMeta | null | undefined
  const id = image?.asset?._ref ?? image?.asset?._id ?? ''
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(id)
  if (!match) return null
  const crop = image?.crop ?? {}
  const width = Math.round(Number(match[1]) * (1 - (crop.left ?? 0) - (crop.right ?? 0)))
  const height = Math.round(Number(match[2]) * (1 - (crop.top ?? 0) - (crop.bottom ?? 0)))
  return width > 0 && height > 0 ? { width, height } : null
}

export function hasImageAsset(source: SanityImageSource | null | undefined): boolean {
  const image = source as ImageWithMeta | null | undefined
  return Boolean(image?.asset?._ref || image?.asset?._id)
}

// CSS object-position that keeps the hotspot (the "punto focale" set in the
// Studio) in view when a photo is cut to fill a fixed box. The hotspot is
// stored relative to the original photo, so it is shifted into the cropped area.
export function hotspotPosition(source: SanityImageSource | null | undefined): string {
  const image = source as (ImageWithMeta & { hotspot?: { x?: number; y?: number } }) | null | undefined
  const hotspot = image?.hotspot
  if (hotspot?.x === undefined || hotspot?.y === undefined) return '50% 50%'
  const crop = image?.crop ?? {}
  const left = crop.left ?? 0
  const top = crop.top ?? 0
  const width = 1 - left - (crop.right ?? 0)
  const height = 1 - top - (crop.bottom ?? 0)
  const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value * 1000) / 10))
  return `${clamp((hotspot.x - left) / width)}% ${clamp((hotspot.y - top) / height)}%`
}
