import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import type { ArticleSummary } from '@/lib/sanity/types'
import { SectionBar } from './SectionBar'

interface FeaturedArticleProps {
  article: ArticleSummary
  title: string
}

export function FeaturedArticle({ article, title }: FeaturedArticleProps) {
  return (
    <section className="flex h-full flex-col border border-neutral-300 bg-white">
      <SectionBar title={title} color="red" />
      <Link href={`/articolo/${article.slug}`} className="group relative block min-h-[26rem] flex-1 overflow-hidden bg-neutral-900">
        {article.coverImage && (
          <Image
            src={urlForImage(article.coverImage).width(1000).height(1100).url()}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-opacity group-hover:opacity-90"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-24 text-white">
          <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">{article.title}</h2>
          {article.excerpt && <p className="mt-3 font-display text-lg leading-snug text-white/90">{article.excerpt}</p>}
        </div>
      </Link>
    </section>
  )
}
