import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticleBySlug, getCategoryArticles } from '@/lib/sanity/queries'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import { CategoryBadge } from '@/components/CategoryBadge'
import { ArticleCard } from '@/components/ArticleCard'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return {}
  const imageUrl = urlForImage(article.coverImage).width(1200).height(630).url()
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, images: [imageUrl] },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)
  if (!article) notFound()

  const related = (await getCategoryArticles(article.category.slug, 1, 4)).filter((item) => item._id !== article._id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [urlForImage(article.coverImage).width(1200).height(630).url()],
    datePublished: article.publishedAt,
    author: [{ '@type': 'Person', name: article.author.name }],
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{article.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {article.author.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <div className="mt-8">
        <PortableTextRenderer value={article.body} />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl font-bold">Articoli correlati</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.slice(0, 3).map((item) => (
              <ArticleCard key={item._id} article={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
