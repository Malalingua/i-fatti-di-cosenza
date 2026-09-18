import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function Hero({ article }: { article: ArticleSummary }) {
  return (
    <Link href={`/articolo/${article.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
        <Image
          src={urlForImage(article.coverImage).width(1600).height(1000).url()}
          alt={article.title}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
        <time className="mt-2 block text-sm text-neutral-500" dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  )
}
