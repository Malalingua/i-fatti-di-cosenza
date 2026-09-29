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

// "Ultime notizie": articles taken off the homepage plus new articles never
// placed on it, ordered by when they arrived in the column (removal or
// publish time), latest first. Articles published before `since` only appear
// once they have been removed from the homepage.
export function buildLatestFeed(
  removed: { removedAt: string; article: ArticleSummary }[],
  latest: ArticleSummary[],
  shown: (ArticleSummary | null)[],
  since: string,
  limit: number
): ArticleSummary[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  const arrivals = new Map<string, { article: ArticleSummary; at: number }>()
  const add = (article: ArticleSummary, at: string) => {
    if (shownIds.has(article._id)) return
    const time = new Date(at).getTime()
    const existing = arrivals.get(article._id)
    if (!existing || time > existing.at) arrivals.set(article._id, { article, at: time })
  }
  for (const item of removed) add(item.article, item.removedAt)
  for (const article of latest) {
    if (new Date(article.publishedAt) >= new Date(since)) add(article, article.publishedAt)
  }
  return [...arrivals.values()]
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map((item) => item.article)
}

export function pickOtherNews(
  latest: ArticleSummary[],
  shown: (ArticleSummary | null)[],
  limit: number
): ArticleSummary[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  return latest.filter((article) => !shownIds.has(article._id)).slice(0, limit)
}
