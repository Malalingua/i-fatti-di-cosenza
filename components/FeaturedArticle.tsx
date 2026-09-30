import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CoverImage } from './CoverImage'
import { SectionBar } from './SectionBar'

interface FeaturedArticleProps {
  article: ArticleSummary
  title: string
}

// The photo fills the whole box (as tall as the boxes beside it), with the
// title laid over its lower part, as in the template.
export function FeaturedArticle({ article, title }: FeaturedArticleProps) {
  return (
    <section className="flex h-full flex-col border border-neutral-300 bg-white">
      <SectionBar title={title} color="red" />
      <Link
        href={`/articolo/${article.slug}`}
        className="group relative block min-h-[22rem] flex-1 overflow-hidden bg-neutral-900 lg:min-h-[26rem]"
      >
        {article.coverImage && (
          <CoverImage
            image={article.coverImage}
            alt={article.title}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="transition-opacity group-hover:opacity-90"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-5 pb-5 pt-24 text-white">
          <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">{article.title}</h2>
          {article.excerpt && <p className="mt-2 font-display text-base leading-snug text-white/90">{article.excerpt}</p>}
        </div>
      </Link>
    </section>
  )
}
