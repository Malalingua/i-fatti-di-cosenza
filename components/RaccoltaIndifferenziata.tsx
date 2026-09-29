import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'
import { ArticleTitle } from './ArticleTitle'
import { SectionBar } from './SectionBar'

// Positions are fixed (01, 02); an empty position shows just its number, as
// in the template.
export function RaccoltaIndifferenziata({ articles }: { articles: (ArticleSummary | null)[] }) {
  return (
    <section className="mt-4">
      <SectionBar title="Raccolta indifferenziata" color="blue">
        <span className="bg-[#d42a1c] px-2 py-0.5 text-xs font-bold uppercase tracking-wide">Le malelingue del web</span>
      </SectionBar>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        {articles.map((article, i) => {
          const number = <div className="font-display text-3xl font-bold text-[#d42a1c]">{String(i + 1).padStart(2, '0')}</div>
          if (!article) {
            return (
              <div key={`empty-${i}`} className="min-h-[6rem] border border-neutral-300 bg-white p-4">
                {number}
              </div>
            )
          }
          return (
            <Link
              key={article._id}
              href={`/articolo/${article.slug}`}
              className="block border border-neutral-300 bg-white p-4 hover:bg-neutral-50"
            >
              {number}
              <ArticleTitle title={article.title} className="mt-2 text-lg" />
              {article.excerpt && <p className="mt-1 font-display text-sm text-neutral-700 line-clamp-3">{article.excerpt}</p>}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
