import { getAllCategories, getCategoryArticles, getFeaturedArticles } from '@/lib/sanity/queries'
import { Hero } from '@/components/Hero'
import { BriefCard } from '@/components/BriefCard'
import { sortCategoriesEditorially, selectLead } from '@/lib/homepage'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 3600

export default async function HomePage() {
  const [categoriesRaw, featured] = await Promise.all([getAllCategories(), getFeaturedArticles(1)])
  const categories = sortCategoriesEditorially(categoriesRaw)

  const briefCandidates = await Promise.all(
    categories
      .filter((category) => category._id !== featured[0]?.category._id)
      .map(async (category) => (await getCategoryArticles(category.slug, 1, 1))[0])
  )

  const briefs: ArticleSummary[] = briefCandidates.filter((article): article is ArticleSummary => Boolean(article))

  const { lead, briefs: finalBriefs } = selectLead(featured, briefs)

  if (!lead) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-neutral-500">Nessun articolo pubblicato.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 lg:row-span-2">
          <Hero article={lead} />
        </div>
        {finalBriefs.map((article) => (
          <BriefCard key={article._id} article={article} />
        ))}
      </div>
    </main>
  )
}
