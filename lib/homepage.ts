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
): { top: (ArticleSummary | null)[]; more: ArticleSummary[] } {
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
  return { top, more: remaining }
}
