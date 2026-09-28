import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import type { ArticleSummary } from '@/lib/sanity/types'

interface FeaturedArticleProps {
  article: ArticleSummary
  category?: string
}

export function FeaturedArticle({ article, category }: FeaturedArticleProps) {
  return (
    <Link href={`/articoli/${article.slug}`}>
      <div className="group overflow-hidden bg-red-600 text-white">
        {article.coverImage && (
          <div className="relative h-72 w-full overflow-hidden">
            <Image
              src={urlForImage(article.coverImage).width(800).height(600).url()}
              alt={article.title}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity"
            />
          </div>
        )}
        <div className="p-6">
          {category && (
            <div className="mb-3 inline-block bg-red-700 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {category}
            </div>
          )}
          <h2 className="font-display text-2xl font-bold leading-tight mb-3">{article.title}</h2>
          <p className="text-sm line-clamp-3 opacity-95">{article.excerpt}</p>
        </div>
      </div>
    </Link>
  )
}
