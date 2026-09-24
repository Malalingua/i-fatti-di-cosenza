import { getAllCategories, getCategoryArticles, getFeaturedArticles, getTopBoxArticles } from '@/lib/sanity/queries'
import { Hero } from '@/components/Hero'
import { BriefCard } from '@/components/BriefCard'
import { sortCategoriesEditorially, selectLead, splitBriefs } from '@/lib/homepage'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 3600

export default async function HomePage() {
  const [categoriesRaw, featured, picked] = await Promise.all([
    getAllCategories(),
    getFeaturedArticles(1),
    getTopBoxArticles(5),
  ])
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

  const { top: topBriefs, more: moreBriefs } = splitBriefs(picked, finalBriefs, lead._id)

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-2 lg:row-span-2">
          <Hero article={lead} />
        </div>
        {topBriefs.map((article) => (
          <BriefCard key={article._id} article={article} />
        ))}
      </div>
      {moreBriefs.length > 0 && (
        <section className="mt-10">
          <h2 className="border-b border-neutral-200 pb-2 font-display text-xl font-bold">Le altre notizie</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {moreBriefs.map((article) => (
              <BriefCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
