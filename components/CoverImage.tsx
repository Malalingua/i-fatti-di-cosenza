import Image from 'next/image'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { hasImageAsset, hotspotPosition, urlForImage } from '@/lib/sanity/image'

interface CoverImageProps {
  image: SanityImageSource
  alt: string
  sizes: string
  width?: number
  className?: string
  priority?: boolean
}

// Fills its (positioned) parent so every box shows photos at the same format.
// The crop and the focal point set in the Studio decide what stays in view.
export function CoverImage({ image, alt, sizes, width = 1200, className = '', priority }: CoverImageProps) {
  if (!hasImageAsset(image)) return null
  return (
    <Image
      src={urlForImage(image).width(width).fit('max').url()}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      style={{ objectPosition: hotspotPosition(image) }}
    />
  )
}
