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
