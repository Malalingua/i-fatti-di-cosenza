import Link from 'next/link'
import type { ArticleSummary } from '@/lib/sanity/types'
import { SanityImage } from './SanityImage'
import { SectionBar } from './SectionBar'

interface FeaturedArticleProps {
  article: ArticleSummary
  title: string
}

// The whole photo, with the title laid over its lower part (as in the
// template). Photo and title share one grid cell, so the box is as tall as the
// photo, or as the title when the title is taller.
export function FeaturedArticle({ article, title }: FeaturedArticleProps) {
  return (
    <section className="border border-neutral-300 bg-white">
      <SectionBar title={title} color="red" />
      <Link href={`/articolo/${article.slug}`} className="group grid bg-neutral-900">
        {article.coverImage && (
          <div className="[grid-area:1/1]">
            <SanityImage
              image={article.coverImage}
              alt={article.title}
              width={1200}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="transition-opacity group-hover:opacity-90"
            />
          </div>
        )}
        <div className="self-end bg-gradient-to-t from-black via-black/75 to-transparent px-5 pb-5 pt-20 text-white [grid-area:1/1]">
          <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">{article.title}</h2>
          {article.excerpt && <p className="mt-2 font-display text-base leading-snug text-white/90">{article.excerpt}</p>}
        </div>
      </Link>
    </section>
  )
}
