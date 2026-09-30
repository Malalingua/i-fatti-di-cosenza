import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import { truncateExcerpt } from '@/lib/utils/excerpt'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'
import { CoverImage } from './CoverImage'

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const href = `/articolo/${article.slug}`

  return (
    <article className="flex flex-col gap-3">
      <Link href={href} className="group relative block aspect-video overflow-hidden rounded-lg bg-neutral-100">
        <CoverImage
          image={article.coverImage}
          alt={article.title}
          width={800}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="transition-transform group-hover:scale-105"
        />
      </Link>
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <Link href={href}>
        <h3 className="font-display text-xl font-bold leading-tight hover:underline">{article.title}</h3>
      </Link>
      {article.excerpt && <p className="text-sm text-neutral-600">{truncateExcerpt(article.excerpt)}</p>}
      <time className="text-xs text-neutral-400" dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
    </article>
  )
}
