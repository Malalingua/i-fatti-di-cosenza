import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticleBySlug, getCategoryArticles } from '@/lib/sanity/queries'
import { hasImageAsset } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import { CategoryBadge } from '@/components/CategoryBadge'
import { ArticleCard } from '@/components/ArticleCard'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { SanityImage } from '@/components/SanityImage'
import { baseOpenGraph, shareDescription, shareImage, SITE_NAME, SITE_URL } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return {}
  const description = shareDescription(article.excerpt, article.body)
  const image = shareImage(article.coverImage, article.title)
  const path = `/articolo/${article.slug}`
  return {
    title: article.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...baseOpenGraph,
      type: 'article',
      title: article.title,
      description,
      url: path,
      images: [image],
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      section: article.category?.name,
    },
    twitter: { card: 'summary_large_image', title: article.title, description, images: [image.url] },
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
    description: shareDescription(article.excerpt, article.body),
    image: hasImageAsset(article.coverImage) ? [shareImage(article.coverImage, article.title).url] : [],
    datePublished: article.publishedAt,
    mainEntityOfPage: `${SITE_URL}/articolo/${article.slug}`,
    author: [{ '@type': 'Person', name: article.author.name }],
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-malalingua-blog.jpg` } },
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{article.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {article.author.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <div className="mt-6 overflow-hidden rounded-xl">
        <SanityImage
          image={article.coverImage}
          alt={article.title}
          width={1600}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
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
