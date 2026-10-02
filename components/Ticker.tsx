import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'

// Reading speed of the strip: the loop lasts longer when there are more headlines.
const CHARS_PER_SECOND = 9

function TickerItems({ articles, hidden = false }: { articles: ArticleSummary[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {articles.map((article) => (
        <li key={article._id} className="flex items-center whitespace-nowrap">
          <Link
            href={`/articolo/${article.slug}`}
            className="font-display hover:text-[#d42a1c] hover:underline"
            tabIndex={hidden ? -1 : undefined}
          >
            {article.title}
          </Link>
          <span className="px-4 text-[#d42a1c]" aria-hidden="true">
            •
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Ticker({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null
  const chars = articles.reduce((total, article) => total + article.title.length + 6, 0)
  const duration = Math.max(20, Math.round(chars / CHARS_PER_SECOND))

  return (
    <div className="mb-4 flex items-center gap-3 border-b border-neutral-300 pb-2 text-sm">
      <span className="relative z-10 shrink-0 bg-[#d42a1c] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
        Malalingua ora
      </span>
      <div className="ticker relative min-w-0 flex-1 overflow-hidden" aria-label="Ultimi articoli">
        {/* The list is repeated once so the strip loops without a gap. */}
        <div className="ticker-track flex w-max" style={{ animationDuration: `${duration}s` }}>
          <TickerItems articles={articles} />
          <TickerItems articles={articles} hidden />
        </div>
      </div>
    </div>
  )
}
