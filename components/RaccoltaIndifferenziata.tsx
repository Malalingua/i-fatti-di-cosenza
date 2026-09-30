import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'
import { ArticleTitle } from './ArticleTitle'
import { CoverImage } from './CoverImage'
import { SectionBar } from './SectionBar'

// The two editor picks, each with its photo on top at the same 16:9 format.
// Empty positions are left out; with no picks the section is not shown.
export function RaccoltaIndifferenziata({ articles }: { articles: (ArticleSummary | null)[] }) {
  const picks = articles.filter((article): article is ArticleSummary => Boolean(article))
  if (picks.length === 0) return null

  return (
    <section className="mt-4">
      <SectionBar title="Raccolta indifferenziata" color="blue">
        <span className="bg-[#d42a1c] px-2 py-0.5 text-xs font-bold uppercase tracking-wide">Le malelingue del web</span>
      </SectionBar>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        {picks.map((article) => (
          <Link
            key={article._id}
            href={`/articolo/${article.slug}`}
            className="group block h-full border border-neutral-300 bg-white p-2 hover:bg-neutral-50"
          >
            {article.coverImage && (
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                <CoverImage
                  image={article.coverImage}
                  alt={article.title}
                  width={1000}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="transition-opacity group-hover:opacity-90"
                />
              </div>
            )}
            <ArticleTitle title={article.title} className="mt-3 text-xl" />
            {article.excerpt && <p className="mt-1 font-display text-sm text-neutral-700 line-clamp-3">{article.excerpt}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}
