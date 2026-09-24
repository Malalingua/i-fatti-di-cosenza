import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'

export function OtherNewsCard({ article }: { article: ArticleSummary }) {
  return (
    <Link href={`/articolo/${article.slug}`} className="group block">
      <span
        className="text-xs font-bold uppercase tracking-wide"
        style={{ color: article.category.accentColor }}
      >
        {article.category.name}
      </span>
      <h3 className="mt-1 font-display text-xl font-bold leading-snug group-hover:underline">{article.title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{article.excerpt}</p>
    </Link>
  )
}
