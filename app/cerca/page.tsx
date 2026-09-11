import { searchArticles } from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/ArticleCard'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const term = searchParams.q?.trim() || ''
  const articles = term ? await searchArticles(term) : []

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">
        {term ? `Risultati per "${term}"` : 'Cerca notizie'}
      </h1>
      {term && articles.length === 0 && <p className="text-neutral-500">Nessun articolo trovato.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </main>
  )
}
