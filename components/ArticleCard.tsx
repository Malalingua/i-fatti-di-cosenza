import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import { truncateExcerpt } from '@/lib/utils/excerpt'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const href = `/articolo/${article.slug}`

  return (
    <article className="flex flex-col gap-3">
      <Link href={href} className="group relative block aspect-video overflow-hidden rounded-lg">
        <Image
          src={urlForImage(article.coverImage).width(600).height(338).url()}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </Link>
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <Link href={href}>
        <h3 className="font-display text-xl font-bold leading-tight hover:underline">{article.title}</h3>
      </Link>
      <p className="text-sm text-neutral-600">{truncateExcerpt(article.excerpt)}</p>
      <time className="text-xs text-neutral-400" dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
    </article>
  )
}
