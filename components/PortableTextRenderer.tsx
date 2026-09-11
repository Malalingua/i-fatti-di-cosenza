import { PortableText, type PortableTextBlock } from '@portabletext/react'
import Image from 'next/image'
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
                className="rounded-lg"
              />
            ),
          },
        }}
      />
    </div>
  )
}
