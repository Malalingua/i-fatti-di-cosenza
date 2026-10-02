import { PortableText, type PortableTextBlock } from '@portabletext/react'
import Link from 'next/link'
import { urlForFile, getVideoEmbedUrl } from '@/lib/sanity/file'
import { SanityImage } from './SanityImage'

export function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="prose prose-neutral max-w-none [--tw-prose-body:theme(colors.neutral.900)] [--tw-prose-bullets:theme(colors.neutral.700)]">
      <PortableText
        value={value}
        components={{
          types: {
            image: ({ value: imageValue }) => (
              <SanityImage
                image={imageValue}
                alt={imageValue.alt || ''}
                width={1600}
                sizes="(max-width: 768px) 100vw, 768px"
                className="rounded-lg"
              />
            ),
            videoEmbed: ({ value: videoValue }) => {
              const embedUrl = getVideoEmbedUrl(videoValue?.url || '')
              if (!embedUrl) return null
              return (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <iframe
                    src={embedUrl}
                    title="Video incorporato"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              )
            },
            videoFile: ({ value: videoValue }) => {
              const src = urlForFile(videoValue)
              if (!src) return null
              return (
                <figure>
                  <video controls className="w-full rounded-lg" src={src} />
                  {videoValue.caption && (
                    <figcaption className="mt-2 text-sm text-neutral-800">{videoValue.caption}</figcaption>
                  )}
                </figure>
              )
            },
          },
          marks: {
            link: ({ children, value: linkValue }) => {
              const href: string = linkValue?.href || ''
              const isExternal = /^https?:\/\//.test(href)
              if (isExternal) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                )
              }
              return <Link href={href}>{children}</Link>
            },
          },
        }}
      />
    </div>
  )
}
