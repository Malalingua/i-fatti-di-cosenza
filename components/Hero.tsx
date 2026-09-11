import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function Hero({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/articolo/${article.slug}`}
      className="group relative block h-[60vh] min-h-[400px] overflow-hidden rounded-2xl"
    >
      <Image
        src={urlForImage(article.coverImage).width(1600).height(900).url()}
        alt={article.title}
        fill
        sizes="100vw"
        priority
        className="object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">{article.title}</h1>
        <time className="mt-2 block text-sm text-neutral-300" dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  )
}
