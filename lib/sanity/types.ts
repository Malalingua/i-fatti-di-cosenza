import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import type { PortableTextBlock } from '@portabletext/react'

export interface Category {
  _id: string
  name: string
  slug: string
  accentColor: string
}

export interface Author {
  _id: string
  name: string
  photo?: SanityImageSource
  bio?: string
}

export interface ArticleSummary {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: SanityImageSource
  publishedAt: string
  category: Category
}

export interface Article extends ArticleSummary {
  body: PortableTextBlock[]
  author: Author
}
