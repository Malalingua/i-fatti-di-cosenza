import Image from 'next/image'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { imageDimensions, urlForImage } from '@/lib/sanity/image'

interface SanityImageProps {
  image: SanityImageSource
  alt: string
  width: number
  sizes: string
  className?: string
  priority?: boolean
}

// Shows an uploaded photo whole, at its own proportions (after any crop made
// in the Studio), never cut to fit a fixed box.
export function SanityImage({ image, alt, width, sizes, className = '', priority }: SanityImageProps) {
  const size = imageDimensions(image) ?? { width: 4, height: 3 }
  return (
    <Image
      src={urlForImage(image).width(width).fit('max').url()}
      alt={alt}
      width={size.width}
      height={size.height}
      sizes={sizes}
      priority={priority}
      className={`h-auto w-full ${className}`}
    />
  )
}
