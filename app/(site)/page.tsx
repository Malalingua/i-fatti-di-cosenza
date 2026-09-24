import {
  getAllCategories,
  getCategoryArticles,
  getFeaturedArticles,
  getHomepageSlots,
  getLatestArticles,
} from '@/lib/sanity/queries'
import { Hero } from '@/components/Hero'
import { BriefCard } from '@/components/BriefCard'
import { OtherNewsCard } from '@/components/OtherNewsCard'
import { sortCategoriesEditorially, selectLead, splitBriefs, pickOtherNews } from '@/lib/homepage'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 3600

export default async function HomePage() {
  const [categoriesRaw, featured, slots, latest] = await Promise.all([
    getAllCategories(),
    getFeaturedArticles(1),
    getHomepageSlots(),
    getLatestArticles(12),
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

  const { top: topBriefs } = splitBriefs(slots, finalBriefs, lead._id)
  const otherNews = pickOtherNews(latest, [lead, ...topBriefs], 4)

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-2 lg:row-span-2">
          <Hero article={lead} />
        </div>
        {topBriefs.map((article, i) =>
          article ? <BriefCard key={article._id} article={article} /> : <div key={`empty-${i}`} className="hidden lg:block" />
        )}
      </div>
      {otherNews.length > 0 && (
        <section className="mt-12 border-t-2 border-neutral-900 pt-4">
          <h2 className="border-b-2 border-neutral-900 pb-3 font-display text-3xl font-bold">Le altre notizie</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-neutral-300 lg:[&>*:not(:first-child)]:pl-8">
            {otherNews.map((article) => (
              <OtherNewsCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
