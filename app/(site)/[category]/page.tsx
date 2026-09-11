import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllCategories, getCategoryArticles } from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/ArticleCard'

export const revalidate = 3600
const PAGE_SIZE = 12

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categories = await getAllCategories()
  const category = categories.find((item) => item.slug === params.category)
  if (!category) return {}
  return { title: category.name, description: `Ultime notizie di ${category.name} da Cosenza.` }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string }
  searchParams: { page?: string }
}) {
  const categories = await getAllCategories()
  const category = categories.find((item) => item.slug === params.category)
  if (!category) notFound()

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1
  const articles = await getCategoryArticles(category.slug, page, PAGE_SIZE)

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">{category.name}</h1>
      {articles.length === 0 ? (
        <p className="text-neutral-500">Nessun articolo trovato.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-between text-sm font-semibold">
        {page > 1 && <a href={`/${category.slug}?page=${page - 1}`}>← Pagina precedente</a>}
        {articles.length === PAGE_SIZE && (
          <a href={`/${category.slug}?page=${page + 1}`} className="ml-auto">
            Pagina successiva →
          </a>
        )}
      </div>
    </main>
  )
}
