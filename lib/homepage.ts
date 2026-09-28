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

// One article per category box: the newest in that category not already shown,
// falling back to the newest unused article when the category has none.
export function pickCategoryBoxes(
  categoryLists: ArticleSummary[][],
  fallback: ArticleSummary[],
  excludeIds: string[]
): (ArticleSummary | undefined)[] {
  const seen = new Set(excludeIds)
  const boxes = categoryLists.map((list) => {
    const article = list.find((candidate) => !seen.has(candidate._id))
    if (article) seen.add(article._id)
    return article
  })
  return boxes.map((article) => {
    if (article) return article
    const substitute = fallback.find((candidate) => !seen.has(candidate._id))
    if (substitute) seen.add(substitute._id)
    return substitute
  })
}

export function pickOtherNews(
  latest: ArticleSummary[],
  shown: (ArticleSummary | null)[],
  limit: number
): ArticleSummary[] {
  const shownIds = new Set(shown.map((article) => article?._id))
  return latest.filter((article) => !shownIds.has(article._id)).slice(0, limit)
}
