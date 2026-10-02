import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'
import { formatNewsTimestamp } from '@/lib/utils/date'
import { ArticleTitle } from './ArticleTitle'
import { CoverImage } from './CoverImage'
import { SectionBar } from './SectionBar'

export function LatestNews({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section className="mt-6">
      <SectionBar title="Lingua Lunga" color="dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lingua-lunga.png" alt="" aria-hidden="true" width={446} height={96} className="h-7 w-auto md:h-8" />
      </SectionBar>
      <ol className="divide-y divide-neutral-300 border-x border-b border-neutral-300 bg-white">
        {articles.map((article) => (
          <li key={article._id}>
            <Link href={`/articolo/${article.slug}`} className="group flex gap-4 p-3 hover:bg-neutral-50">
              {article.coverImage && (
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-neutral-100 sm:w-32">
                  <CoverImage image={article.coverImage} alt={article.title} width={320} sizes="128px" />
                </div>
              )}
              <div className="hidden w-20 shrink-0 pt-1 text-xs font-semibold text-neutral-800 sm:block">
                <time dateTime={article.publishedAt}>{formatNewsTimestamp(article.publishedAt)}</time>
              </div>
              <div className="min-w-0 flex-1">
                <time dateTime={article.publishedAt} className="block text-xs font-semibold text-neutral-800 sm:hidden">
                  {formatNewsTimestamp(article.publishedAt)}
                </time>
                {article.category && (
                  <span className="text-xs font-bold uppercase tracking-wide text-[#d42a1c]">{article.category.name}</span>
                )}
                <ArticleTitle title={article.title} className="text-lg group-hover:underline" />
                {article.excerpt && (
                  <p className="mt-1 font-display text-sm text-neutral-900 line-clamp-2">{article.excerpt}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
