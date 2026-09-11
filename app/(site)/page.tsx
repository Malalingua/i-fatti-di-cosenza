import Link from 'next/link'
import { getAllCategories, getCategoryArticles, getFeaturedArticles } from '@/lib/sanity/queries'
import { Hero } from '@/components/Hero'
import { ArticleCard } from '@/components/ArticleCard'
import { CATEGORIES } from '@/lib/constants'

export const revalidate = 3600

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getAllCategories(), getFeaturedArticles(1)])

  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await getCategoryArticles(category.slug, 1, 4),
    }))
  )

  const order = CATEGORIES.map((c) => c.slug)
  sections.sort((a, b) => order.indexOf(a.category.slug) - order.indexOf(b.category.slug))

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {featured[0] && (
        <div className="mb-12">
          <Hero article={featured[0]} />
        </div>
      )}

      {sections.map(({ category, articles }) =>
        articles.length > 0 ? (
          <section key={category._id} className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">{category.name}</h2>
              <Link href={`/${category.slug}`} className="text-sm font-semibold underline">
                Vedi tutti
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </main>
  )
}
