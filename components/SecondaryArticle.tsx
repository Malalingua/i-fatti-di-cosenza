import Image from 'next/image'
import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'

interface SecondaryArticleProps {
  article: ArticleSummary
  category?: string
  bgColor?: 'white' | 'blue'
}

export function SecondaryArticle({ article, category, bgColor = 'white' }: SecondaryArticleProps) {
  const bgClass = bgColor === 'blue' ? 'bg-blue-800 text-white' : 'bg-white'
  const tagBgClass = bgColor === 'blue' ? 'bg-blue-900' : 'bg-red-600 text-white'

  return (
    <Link href={`/articoli/${article.slug}`}>
      <div className={`group overflow-hidden h-full flex flex-col ${bgClass} border border-gray-200`}>
        {article.coverImage && (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={article.coverImage.url}
              alt={article.title}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity"
            />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col">
          {category && (
            <div className={`mb-2 inline-block ${tagBgClass} px-2 py-1 text-xs font-bold uppercase tracking-wide w-fit`}>
              {category}
            </div>
          )}
          <h3 className="font-display text-lg font-bold leading-tight mb-2 flex-1">{article.title}</h3>
          <p className="text-xs line-clamp-2 opacity-75">{article.excerpt}</p>
        </div>
      </div>
    </Link>
  )
}
