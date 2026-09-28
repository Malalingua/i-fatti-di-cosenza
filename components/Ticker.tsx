import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'

export function Ticker({ article }: { article: ArticleSummary }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-neutral-300 pb-2 text-sm">
      <span className="shrink-0 bg-[#d42a1c] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
        Malalingua ora
      </span>
      <Link href={`/articoli/${article.slug}`} className="truncate font-display hover:underline">
        {article.title}
      </Link>
    </div>
  )
}
