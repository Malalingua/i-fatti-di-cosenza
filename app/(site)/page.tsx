import {
  getArticlesByIds,
  getFeaturedArticles,
  getHomepageSlots,
  getLatestArticles,
} from '@/lib/sanity/queries'
import {
  FEED_RESET,
  HOMEPAGE_RACCOLTA_FIELDS,
  HOMEPAGE_SLOT_FIELDS,
  getHomepageVersions,
  referencedIds,
} from '@/lib/sanity/homepageHistory'
import { FeaturedArticle } from '@/components/FeaturedArticle'
import { SecondaryArticle } from '@/components/SecondaryArticle'
import { RaccoltaIndifferenziata } from '@/components/RaccoltaIndifferenziata'
import { Ticker } from '@/components/Ticker'
import { LatestNews } from '@/components/LatestNews'
import type { SectionColor } from '@/components/SectionBar'
import { LEAD_SECTION_TITLE } from '@/lib/constants'
import {
  buildLatestFeed,
  replacementsOverTime,
  selectHomepage,
  shownArticles,
  type HomepageSources,
} from '@/lib/homepage'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 60

const BOXES: { slug: string; title: string; color: SectionColor; layout: 'stacked' | 'side' }[] = [
  { slug: 'come-campiamo', title: 'Come campiamo', color: 'green', layout: 'stacked' },
  { slug: 'poltrone', title: 'Poltrone & potere', color: 'blue', layout: 'stacked' },
  { slug: 'carta-canta', title: 'Carta canta', color: 'red', layout: 'side' },
  { slug: 'tribunali-e-tribolazioni', title: 'Tribunali e tribolazioni', color: 'brown', layout: 'side' },
]

export default async function HomePage() {
  const [homepage, versions, featured, latest] = await Promise.all([
    getHomepageSlots(),
    getHomepageVersions(),
    getFeaturedArticles(10),
    getLatestArticles(30),
  ])

  const sources: HomepageSources = { featured, latest, boxSlugs: BOXES.map((box) => box.slug) }
  const layout = selectHomepage(homepage, sources)

  if (!layout) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-neutral-500">Nessun articolo pubblicato.</p>
      </main>
    )
  }

  const { lead, boxes: boxArticles, raccolta } = layout

  // "Ultime notizie": replay the homepage since the reset (every Homepage
  // publish and every article publish) and list the articles that dropped out.
  const historyArticles = await getArticlesByIds(referencedIds(versions))
  const byId = new Map(historyArticles.map((article) => [article._id, article]))
  const resolve = (ref: { _ref?: string } | undefined) => (ref?._ref && byId.get(ref._ref)) || null
  const pool = [...latest, ...featured, ...historyArticles]
  const replacements = replacementsOverTime(
    versions.map(({ time, doc }) => ({
      time,
      picks: {
        lead: resolve(doc?.lead),
        slots: HOMEPAGE_SLOT_FIELDS.map((field) => resolve(doc?.[field])),
        raccolta: HOMEPAGE_RACCOLTA_FIELDS.map((field) => resolve(doc?.[field])),
      },
    })),
    pool,
    sources.boxSlugs,
    FEED_RESET
  )
  const replacedArticles = await getArticlesByIds(replacements.map((replacement) => replacement.id))
  const removed = replacements.flatMap((replacement) => {
    const article = replacedArticles.find((candidate) => candidate._id === replacement.id)
    return article ? [{ article, removedAt: replacement.removedAt }] : []
  })
  const olderNews = buildLatestFeed(removed, latest, shownArticles(layout), FEED_RESET, 20)
  const tickerArticle = latest[0]

  // Two aligned rows, as in the template: lead | Come campiamo + Poltrone,
  // then Carta canta | Tribunali. Boxes in a row share its height, so there
  // are no gaps. Empty boxes are hidden and their neighbour widens.
  const [comeCampiamo, poltrone, cartaCanta, tribunali] = boxArticles
  const topPairAlone = Boolean(comeCampiamo) !== Boolean(poltrone)
  const hasTopPair = Boolean(comeCampiamo || poltrone)
  const bottomAlone = Boolean(cartaCanta) !== Boolean(tribunali)

  const renderBox = (index: number, className = '', layout?: 'stacked' | 'side') => {
    const box = BOXES[index]
    const article = boxArticles[index]
    if (!article) return null
    return (
      <div key={box.slug} className={className}>
        <SecondaryArticle
          article={article}
          title={homepage.boxTitles[index] ?? box.title}
          color={box.color}
          layout={layout ?? box.layout}
        />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-4">
      {tickerArticle && <Ticker article={tickerArticle} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={hasTopPair ? '' : 'lg:col-span-2'}>
          <FeaturedArticle article={lead} title={homepage.leadTitle ?? LEAD_SECTION_TITLE} />
        </div>
        {hasTopPair && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderBox(0, topPairAlone ? 'sm:col-span-2' : '', topPairAlone ? 'side' : undefined)}
            {renderBox(1, topPairAlone ? 'sm:col-span-2' : '', topPairAlone ? 'side' : undefined)}
          </div>
        )}
        {renderBox(2, bottomAlone ? 'lg:col-span-2' : '')}
        {renderBox(3, bottomAlone ? 'lg:col-span-2' : '')}
      </div>

      <RaccoltaIndifferenziata articles={raccolta} />

      {olderNews.length > 0 && <LatestNews articles={olderNews} />}
    </main>
  )
}
