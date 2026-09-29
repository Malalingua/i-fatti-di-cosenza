import { CATEGORIES } from '@/lib/constants'
import type { ArticleSummary, Category } from '@/lib/sanity/types'

export function sortCategoriesEditorially(categories: Category[]): Category[] {
  const order = CATEGORIES.map((c) => c.slug)
  return [...categories].sort((a, b) => {
    const indexA = order.indexOf(a.slug)
    const indexB = order.indexOf(b.slug)
    const rankA = indexA === -1 ? order.length : indexA
    const rankB = indexB === -1 ? order.length : indexB
    return rankA - rankB
  })
}

export function selectLead(
  featured: ArticleSummary[],
  briefCandidates: ArticleSummary[]
): { lead: ArticleSummary | undefined; briefs: ArticleSummary[] } {
  if (featured[0]) {
    return { lead: featured[0], briefs: briefCandidates }
  }
  const [firstBrief, ...rest] = briefCandidates
  return { lead: firstBrief, briefs: rest }
}

const TOP_BOX_SIZE = 4

export function splitBriefs(
  slots: (ArticleSummary | null)[],
  automatic: ArticleSummary[],
  leadId: string
): { top: (ArticleSummary | null)[] } {
  const seen = new Set([leadId])
  const top: (ArticleSummary | null)[] = []
  for (let i = 0; i < TOP_BOX_SIZE; i++) {
    const article = slots[i]
    if (article && !seen.has(article._id)) {
      seen.add(article._id)
      top.push(article)
    } else {
      top.push(null)
    }
  }

  const remaining = automatic.filter((article) => {
    if (seen.has(article._id)) return false
    seen.add(article._id)
    return true
  })
  for (let i = 0; i < TOP_BOX_SIZE && remaining.length > 0; i++) {
    if (!top[i]) top[i] = remaining.shift()!
  }
  return { top }
}

// One article per category box. A manual pick from the Homepage document wins
// when it belongs to the box's category; otherwise the box shows the newest
// article of that category not already shown. A box never shows an article
// from another category: with nothing left in its category it stays empty.
export function pickCategoryBoxes(
  categoryLists: ArticleSummary[][],
  excludeIds: string[],
  manual: (ArticleSummary | null)[] = [],
  boxSlugs: string[] = []
): (ArticleSummary | undefined)[] {
  const seen = new Set(excludeIds)
  const picks = categoryLists.map((_, i) => {
    const article = manual[i]
    if (!article || seen.has(article._id)) return undefined
    if (boxSlugs[i] && article.category?.slug !== boxSlugs[i]) return undefined
    seen.add(article._id)
    return article
  })
  return picks.map((pick, i) => {
    if (pick) return pick
    const article = categoryLists[i].find((candidate) => !seen.has(candidate._id))
    if (article) seen.add(article._id)
    return article
  })
}

// Editor picks only: one entry per position, null when the position is empty
// or its article is already shown elsewhere on the page.
export function pickManualOnly(
  manual: (ArticleSummary | null)[],
  shown: (ArticleSummary | null)[],
  size: number
): (ArticleSummary | null)[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  return Array.from({ length: size }, (_, i) => {
    const article = manual[i]
    if (!article || shownIds.has(article._id)) return null
    shownIds.add(article._id)
    return article
  })
}

// "Ultime notizie": only articles replaced in a homepage box, most recently
// replaced on top, whatever their publish date. Articles back on the homepage
// are left out.
export function buildLatestFeed(
  removed: { removedAt: string; article: ArticleSummary }[],
  shown: (ArticleSummary | null)[],
  limit: number
): ArticleSummary[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  return [...removed]
    .sort((a, b) => new Date(b.removedAt).getTime() - new Date(a.removedAt).getTime())
    .map((item) => item.article)
    .filter((article) => {
      if (shownIds.has(article._id)) return false
      shownIds.add(article._id)
      return true
    })
    .slice(0, limit)
}

export interface HomepagePicks {
  lead: ArticleSummary | null
  slots: (ArticleSummary | null)[]
  raccolta: (ArticleSummary | null)[]
}

export interface HomepageSources {
  featured: ArticleSummary[]
  latest: ArticleSummary[]
  categoryLists: ArticleSummary[][]
  boxSlugs: string[]
}

export interface HomepageLayout {
  lead: ArticleSummary
  boxes: (ArticleSummary | undefined)[]
  raccolta: (ArticleSummary | null)[]
}

// What the homepage actually shows for a set of editor picks, including the
// automatic choices (featured/latest lead, newest article per category box).
export function selectHomepage(picks: HomepagePicks, sources: HomepageSources): HomepageLayout | null {
  const lead = picks.lead ?? sources.featured[0] ?? sources.latest[0]
  if (!lead) return null
  const boxes = pickCategoryBoxes(sources.categoryLists, [lead._id], picks.slots, sources.boxSlugs)
  const above = [lead, ...boxes.filter((article): article is ArticleSummary => Boolean(article))]
  const raccolta = pickManualOnly(picks.raccolta, above, 2)
  return { lead, boxes, raccolta }
}

export function shownArticles(layout: HomepageLayout | null): ArticleSummary[] {
  if (!layout) return []
  return [layout.lead, ...layout.boxes, ...layout.raccolta].filter((article): article is ArticleSummary =>
    Boolean(article)
  )
}

// The homepage inputs as they were at `time`: only articles already published
// then (flags and categories are taken as they are now).
export function sourcesAt(pool: ArticleSummary[], boxSlugs: string[], time: string): HomepageSources {
  const at = new Date(time).getTime()
  const byId = new Map(pool.map((article) => [article._id, article]))
  const live = [...byId.values()]
    .filter((article) => new Date(article.publishedAt).getTime() <= at)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  return {
    featured: live.filter((article) => article.featured),
    latest: live,
    categoryLists: boxSlugs.map((slug) => live.filter((article) => article.category?.slug === slug)),
    boxSlugs,
  }
}

export interface Replacement {
  id: string
  removedAt: string
}

// Replays the homepage from `since`: at every Homepage publish and every
// article publish it works out what was shown, and records each article that
// dropped out (latest removal wins if it came back and left again).
export function replacementsOverTime(
  versions: { time: string; picks: HomepagePicks }[],
  pool: ArticleSummary[],
  boxSlugs: string[],
  since: string
): Replacement[] {
  if (versions.length === 0) return []
  const start = new Date(since).getTime()
  const times = [
    since,
    ...versions.map((version) => version.time),
    ...pool.map((article) => article.publishedAt),
  ].filter((time) => new Date(time).getTime() >= start)
  const events = [...new Set(times)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const picksAt = (time: string) => {
    const at = new Date(time).getTime()
    let current = versions[0].picks
    for (const version of versions) {
      if (new Date(version.time).getTime() <= at) current = version.picks
    }
    return current
  }

  const removedAt = new Map<string, string>()
  let previous: Set<string> | null = null
  for (const time of events) {
    const shown = new Set(
      shownArticles(selectHomepage(picksAt(time), sourcesAt(pool, boxSlugs, time))).map((article) => article._id)
    )
    if (previous) {
      for (const id of previous) if (!shown.has(id)) removedAt.set(id, time)
    }
    previous = shown
  }
  return [...removedAt].map(([id, time]) => ({ id, removedAt: time }))
}

export function pickOtherNews(
  latest: ArticleSummary[],
  shown: (ArticleSummary | null)[],
  limit: number
): ArticleSummary[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  return latest.filter((article) => !shownIds.has(article._id)).slice(0, limit)
}
