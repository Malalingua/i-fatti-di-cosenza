// Tracks articles taken off the homepage so the "Ultime notizie" column can
// list the most recently removed first.

export const HOMEPAGE_SLOT_FIELDS = [
  'lead',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'raccolta1',
  'raccolta2',
] as const

export const REMOVED_HISTORY_LIMIT = 40

interface Ref {
  _ref: string
}

export interface HistoryRef {
  _type: 'reference'
  _ref: string
  _key: string
  _weak?: boolean
}

type HomepageDoc = Partial<Record<(typeof HOMEPAGE_SLOT_FIELDS)[number], Ref | undefined>> & {
  recentlyRemoved?: HistoryRef[]
}

function slotIds(doc: HomepageDoc | null | undefined): string[] {
  if (!doc) return []
  return HOMEPAGE_SLOT_FIELDS.map((field) => doc[field]?._ref).filter((id): id is string => Boolean(id))
}

// Returns the new history, or null when nothing changed.
export function nextRemovedHistory(
  published: HomepageDoc | null | undefined,
  draft: HomepageDoc | null | undefined
): HistoryRef[] | null {
  const current = new Set(slotIds(draft))
  const removed = slotIds(published).filter((id) => !current.has(id))
  const previous = (draft?.recentlyRemoved ?? published?.recentlyRemoved ?? []).map((ref) => ref._ref)

  const seen = new Set<string>()
  const ids = [...removed, ...previous].filter((id) => {
    if (current.has(id) || seen.has(id)) return false
    seen.add(id)
    return true
  })
  const limited = ids.slice(0, REMOVED_HISTORY_LIMIT)

  if (removed.length === 0 && limited.length === previous.length && limited.every((id, i) => id === previous[i])) {
    return null
  }
  // Weak references so a deleted article never blocks publishing the homepage.
  return limited.map((id) => ({ _type: 'reference', _ref: id, _key: id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'k', _weak: true }))
}
