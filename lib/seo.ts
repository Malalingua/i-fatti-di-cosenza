import type { Metadata } from 'next'
import type { PortableTextBlock } from '@portabletext/react'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { hasImageAsset, urlForImage } from './sanity/image'
import { truncateExcerpt } from './utils/excerpt'

const PRODUCTION_URL = 'https://malalingua.blog'

// Public address of the site, used for links shared on social networks.
// Production always uses the real domain, so a stale env var cannot leak an old one.
export const SITE_URL =
  process.env.VERCEL_ENV === 'production'
    ? PRODUCTION_URL
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const SITE_NAME = 'Malalingua'
export const SITE_TITLE = `${SITE_NAME} — La lingua che non lecca`
export const SITE_DESCRIPTION = 'La lingua che non lecca. Blog satirico dalla Calabria: interviste, poltrone, tribunali e tribolazioni.'

const OG_SIZE = { width: 1200, height: 630 }

export const DEFAULT_OG_IMAGE = { url: '/og-default.jpg', ...OG_SIZE, alt: 'Malalingua.blog — La lingua che non lecca' }

// Shared defaults: Next replaces (does not merge) a parent's openGraph, so every page spreads these.
export const baseOpenGraph = {
  siteName: SITE_NAME,
  locale: 'it_IT',
  type: 'website',
  images: [DEFAULT_OG_IMAGE],
} satisfies NonNullable<Metadata['openGraph']>

export function pageMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const shareTitle = title ?? SITE_TITLE
  return {
    // Leaving `title` out (not undefined) keeps the default from the root layout.
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title: shareTitle, description, url: path },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images: [DEFAULT_OG_IMAGE.url] },
  }
}

// 1200x630 JPEG cut around the focal point: WhatsApp and Facebook do not reliably show WebP.
export function shareImage(image: SanityImageSource | null | undefined, alt: string) {
  if (!hasImageAsset(image)) return DEFAULT_OG_IMAGE
  const url = urlForImage(image!).width(OG_SIZE.width).height(OG_SIZE.height).fit('crop').format('jpg').quality(85).url()
  return { url, ...OG_SIZE, alt }
}

// Plain text from the article body, for when the "Sommario" is left empty.
export function bodyText(body: PortableTextBlock[] | null | undefined): string {
  return (body ?? [])
    .filter((block) => block._type === 'block')
    .map((block) => ((block.children as { text?: string }[] | undefined) ?? []).map((child) => child.text ?? '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function shareDescription(excerpt: string | null | undefined, body: PortableTextBlock[] | null | undefined): string {
  const text = excerpt?.trim() || bodyText(body)
  return text ? truncateExcerpt(text, 200) : SITE_DESCRIPTION
}
