import {
  getAllCategories,
  getCategoryArticles,
  getFeaturedArticles,
  getHomepageSlots,
  getLatestArticles,
} from '@/lib/sanity/queries'
import { FeaturedArticle } from '@/components/FeaturedArticle'
import { SecondaryArticle } from '@/components/SecondaryArticle'
import { SectionDivider } from '@/components/SectionDivider'
import { OtherNewsCard } from '@/components/OtherNewsCard'
import { sortCategoriesEditorially, selectLead, splitBriefs, pickOtherNews } from '@/lib/homepage'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 300

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
      {/* Main grid: Featured left (2/3) tall + Secondary right (1/3) split in 2 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 lg:row-span-2">
          <FeaturedArticle article={lead} category={lead.category?.name} />
        </div>
        {topBriefs[0] && <SecondaryArticle article={topBriefs[0]} category={topBriefs[0].category?.name} />}
        {topBriefs[1] && <SecondaryArticle article={topBriefs[1]} category={topBriefs[1].category?.name} bgColor="blue" />}
      </div>

      {/* Tribulazioni section */}
      {topBriefs.length > 2 && (
        <>
          <SectionDivider title="Tribulazioni e Tribolazioni" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-8">
            {topBriefs.slice(2, 4).map((article) =>
              article ? (
                <div key={article._id} className="flex flex-col">
                  <SecondaryArticle article={article} category={article.category?.name} />
                </div>
              ) : null
            )}
          </div>
        </>
      )}

      {/* Carta Canta section */}
      {otherNews.length > 0 && (
        <>
          <SectionDivider title="Carta Canta" />
          <div className="mb-8">
            <SecondaryArticle article={otherNews[0]} category={otherNews[0].category?.name} />
          </div>
        </>
      )}

      {/* Raccolta Indifferenziata section */}
      {otherNews.length > 1 && (
        <>
          <SectionDivider title="Raccolta Indifferenziata" />
          <div className="grid grid-cols-2 gap-8 mb-8">
            {otherNews.slice(1, 3).map((article, i) => (
              <div key={article._id} className="text-center">
                <div className="text-4xl font-bold text-neutral-400 mb-4">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-sm font-bold">{article.title}</h3>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
