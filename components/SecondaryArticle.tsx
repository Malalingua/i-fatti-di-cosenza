import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import type { ArticleSummary } from '@/lib/sanity/types'
import { ArticleTitle } from './ArticleTitle'
import { SectionBar, type SectionColor } from './SectionBar'

interface SecondaryArticleProps {
  article: ArticleSummary
  title: string
  color: SectionColor
  layout?: 'stacked' | 'side'
}

export function SecondaryArticle({ article, title, color, layout = 'stacked' }: SecondaryArticleProps) {
  const side = layout === 'side'

  return (
    <section className="flex h-full flex-col border border-neutral-300 bg-white">
      <SectionBar title={title} color={color} />
      <Link
        href={`/articoli/${article.slug}`}
        className={`group flex flex-1 gap-3 p-2 ${side ? 'flex-col sm:flex-row' : 'flex-col'}`}
      >
        {article.coverImage && (
          <div className={`relative shrink-0 overflow-hidden ${side ? 'aspect-[4/3] sm:aspect-auto sm:w-1/2' : 'aspect-[4/3]'}`}>
            <Image
              src={urlForImage(article.coverImage).width(600).height(450).url()}
              alt={article.title}
              fill
              sizes="(min-width: 1024px) 25vw, 100vw"
              className="object-cover transition-opacity group-hover:opacity-90"
            />
          </div>
        )}
        <div className="flex-1">
          <ArticleTitle title={article.title} className={side ? 'text-2xl' : 'text-xl'} />
          {article.excerpt && (
            <p className="mt-2 font-display text-sm leading-snug text-neutral-700 line-clamp-5">{article.excerpt}</p>
          )}
        </div>
      </Link>
    </section>
  )
}
