import { getCategoryArticles, getFeaturedArticles, getHomepageSlots, getLatestArticles } from '@/lib/sanity/queries'
import { FeaturedArticle } from '@/components/FeaturedArticle'
import { SecondaryArticle } from '@/components/SecondaryArticle'
import { RaccoltaIndifferenziata } from '@/components/RaccoltaIndifferenziata'
import { Ticker } from '@/components/Ticker'
import { LatestNews } from '@/components/LatestNews'
import type { SectionColor } from '@/components/SectionBar'
import { LEAD_SECTION_TITLE } from '@/lib/constants'
import { pickCategoryBoxes, pickWithManual } from '@/lib/homepage'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 300

const BOXES: { slug: string; title: string; color: SectionColor; layout: 'stacked' | 'side' }[] = [
  { slug: 'come-campiamo', title: 'Come campiamo', color: 'green', layout: 'stacked' },
  { slug: 'poltrone', title: 'Poltrone & potere', color: 'blue', layout: 'stacked' },
  { slug: 'carta-canta', title: 'Carta canta', color: 'red', layout: 'side' },
  { slug: 'tribunali-e-tribolazioni', title: 'Tribunali e tribolazioni', color: 'brown', layout: 'side' },
]

export default async function HomePage() {
  const [homepage, featured, latest, ...categoryLists] = await Promise.all([
    getHomepageSlots(),
    getFeaturedArticles(1),
    getLatestArticles(30),
    ...BOXES.map((box) => getCategoryArticles(box.slug, 1, 3)),
  ])

  const lead = homepage.lead ?? featured[0] ?? latest[0]

  if (!lead) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-neutral-500">Nessun articolo pubblicato.</p>
      </main>
    )
  }

  const boxArticles = pickCategoryBoxes(
    categoryLists,
    [lead._id],
    homepage.slots,
    BOXES.map((box) => box.slug)
  )
  const shownAbove = [lead, ...boxArticles.filter((article): article is ArticleSummary => Boolean(article))]
  const raccolta = pickWithManual(homepage.raccolta, latest, shownAbove, 2)
  // Only articles taken off the homepage, most recently removed first.
  const olderNews = pickWithManual(homepage.recentlyRemoved, [], [...shownAbove, ...raccolta], 20)
  const tickerArticle = latest[0]

  // Boxes come in pairs (top: 0-1, bottom: 2-3). An empty box is hidden and
  // its partner widens so the grid keeps the template's shape.
  const partner = [1, 0, 3, 2]
  const boxSpan = (index: number) => {
    const alone = !boxArticles[partner[index]]
    if (index < 2) return alone ? 'md:col-span-2' : ''
    return alone ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-2'
  }
  const leadSpan = boxArticles[0] || boxArticles[1] ? 'md:col-span-2' : 'md:col-span-2 lg:col-span-4'

  const renderBox = (index: number) => {
    const box = BOXES[index]
    const article = boxArticles[index]
    if (!article) return null
    return (
      <div key={box.slug} className={boxSpan(index)}>
        <SecondaryArticle article={article} title={box.title} color={box.color} layout={box.layout} />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-4">
      {tickerArticle && <Ticker article={tickerArticle} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className={leadSpan}>
          <FeaturedArticle article={lead} title={LEAD_SECTION_TITLE} />
        </div>
        {renderBox(0)}
        {renderBox(1)}
        {renderBox(2)}
        {renderBox(3)}
      </div>

      {raccolta.length > 0 && <RaccoltaIndifferenziata articles={raccolta} />}

      {olderNews.length > 0 && <LatestNews articles={olderNews} />}
    </main>
  )
}
