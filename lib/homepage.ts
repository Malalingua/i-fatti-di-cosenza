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
  picked: ArticleSummary[],
  automatic: ArticleSummary[],
  leadId: string
): { top: ArticleSummary[]; more: ArticleSummary[] } {
  const top: ArticleSummary[] = []
  const more: ArticleSummary[] = []
  const seen = new Set([leadId])

  const pickedWithoutLead = picked.filter((article) => article._id !== leadId).slice(0, TOP_BOX_SIZE)
  for (const article of [...pickedWithoutLead, ...automatic]) {
    if (seen.has(article._id)) continue
    seen.add(article._id)
    ;(top.length < TOP_BOX_SIZE ? top : more).push(article)
  }
  return { top, more }
}
