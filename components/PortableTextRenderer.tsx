import { PortableText, type PortableTextBlock } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'

export function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="prose prose-neutral max-w-none">
      <PortableText
        value={value}
        components={{
          types: {
            image: ({ value: imageValue }) => (
              <Image
                src={urlForImage(imageValue).width(1200).url()}
                alt={imageValue.alt || ''}
                width={1200}
                height={675}
                sizes="(max-width: 768px) 100vw, 768px"
                className="rounded-lg"
              />
            ),
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
