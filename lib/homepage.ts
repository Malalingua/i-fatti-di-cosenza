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
