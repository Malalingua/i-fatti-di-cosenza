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

// One article per box, only when chosen by hand in the Homepage document and
// from the box's category. Nothing is filled in automatically: articles not
// placed in a box go to "Titoli del giorno".
export function pickManualBoxes(
  manual: (ArticleSummary | null)[],
  boxSlugs: string[],
  excludeIds: string[]
): (ArticleSummary | undefined)[] {
  const seen = new Set(excludeIds)
  return boxSlugs.map((slug, i) => {
    const article = manual[i]
    if (!article || seen.has(article._id) || article.category?.slug !== slug) return undefined
    seen.add(article._id)
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

// "Titoli del giorno": every article not on the homepage, latest arrival on
// top. An article arrives when it is published without being placed in a box,
// or when it is replaced in a box. Articles published before `since` only
// appear once replaced.
export function buildLatestFeed(
  removed: { removedAt: string; article: ArticleSummary }[],
  latest: ArticleSummary[],
  shown: (ArticleSummary | null)[],
  since: string,
  limit: number
): ArticleSummary[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  const arrivals = new Map<string, { article: ArticleSummary; at: number }>()
  const add = (article: ArticleSummary, time: string) => {
    if (shownIds.has(article._id)) return
    const at = new Date(time).getTime()
    const current = arrivals.get(article._id)
    if (!current || at > current.at) arrivals.set(article._id, { article, at })
  }
  for (const item of removed) add(item.article, item.removedAt)
  const start = new Date(since).getTime()
  for (const article of latest) {
    if (new Date(article.publishedAt).getTime() >= start) add(article, article.publishedAt)
  }
  return [...arrivals.values()]
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map((item) => item.article)
}

export interface HomepagePicks {
  lead: ArticleSummary | null
  slots: (ArticleSummary | null)[]
  raccolta: (ArticleSummary | null)[]
}

export interface HomepageSources {
  featured: ArticleSummary[]
  latest: ArticleSummary[]
  boxSlugs: string[]
}

export interface HomepageLayout {
  lead: ArticleSummary
  boxes: (ArticleSummary | undefined)[]
  raccolta: (ArticleSummary | null)[]
}

// What the homepage actually shows for a set of editor picks. Only the lead
// has a fallback (the article flagged "In evidenza", else the newest).
export function selectHomepage(picks: HomepagePicks, sources: HomepageSources): HomepageLayout | null {
  const lead = picks.lead ?? sources.featured[0] ?? sources.latest[0]
  if (!lead) return null
  const boxes = pickManualBoxes(picks.slots, sources.boxSlugs, [lead._id])
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
