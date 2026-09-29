import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import type { ArticleSummary } from '@/lib/sanity/types'
import { formatNewsTimestamp } from '@/lib/utils/date'
import { ArticleTitle } from './ArticleTitle'
import { SectionBar } from './SectionBar'

export function LatestNews({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section className="mt-6">
      <SectionBar title="Ultime notizie" color="dark" />
      <ol className="divide-y divide-neutral-300 border-x border-b border-neutral-300 bg-white">
        {articles.map((article) => (
          <li key={article._id}>
            <Link href={`/articolo/${article.slug}`} className="group flex gap-4 p-3 hover:bg-neutral-50">
              <div className="w-20 shrink-0 pt-1 text-xs font-semibold text-neutral-500">
                <time dateTime={article.publishedAt}>{formatNewsTimestamp(article.publishedAt)}</time>
              </div>
              <div className="min-w-0 flex-1">
                {article.category && (
                  <span className="text-xs font-bold uppercase tracking-wide text-[#d42a1c]">{article.category.name}</span>
                )}
                <ArticleTitle title={article.title} className="text-lg group-hover:underline" />
                {article.excerpt && (
                  <p className="mt-1 font-display text-sm text-neutral-700 line-clamp-2">{article.excerpt}</p>
                )}
              </div>
              {article.coverImage && (
                <div className="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden sm:block">
                  <Image
                    src={urlForImage(article.coverImage).width(256).height(192).url()}
                    alt={article.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
