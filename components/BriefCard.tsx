import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function BriefCard({ article }: { article: ArticleSummary }) {
  return (
    <Link href={`/articolo/${article.slug}`} className="block border-t border-neutral-200 pt-3">
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <h3 className="mt-2 font-display text-lg font-bold leading-snug hover:underline">{article.title}</h3>
      <time className="mt-1 block text-xs text-neutral-500" dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
    </Link>
  )
}
