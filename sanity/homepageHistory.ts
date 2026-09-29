// Tracks articles taken off the homepage, with the time they were removed, so
// the "Ultime notizie" column can put the latest arrivals on top.

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

export interface RemovedEntry {
  _type: 'removedArticle'
  _key: string
  article: { _type: 'reference'; _ref: string; _weak: true }
  removedAt: string
}

type HomepageDoc = Partial<Record<(typeof HOMEPAGE_SLOT_FIELDS)[number], Ref | undefined>> & {
  recentlyRemoved?: RemovedEntry[]
}

function slotIds(doc: HomepageDoc | null | undefined): string[] {
  if (!doc) return []
  return HOMEPAGE_SLOT_FIELDS.map((field) => doc[field]?._ref).filter((id): id is string => Boolean(id))
}

function entry(id: string, removedAt: string): RemovedEntry {
  return {
    _type: 'removedArticle',
    _key: id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'k',
    // Weak so a deleted article never blocks publishing the homepage.
    article: { _type: 'reference', _ref: id, _weak: true },
    removedAt,
  }
}

// Returns the new history, or null when nothing changed.
export function nextRemovedHistory(
  published: HomepageDoc | null | undefined,
  draft: HomepageDoc | null | undefined,
  now: string
): RemovedEntry[] | null {
  const current = new Set(slotIds(draft))
  const removed = slotIds(published).filter((id) => !current.has(id))
  const previous = draft?.recentlyRemoved ?? published?.recentlyRemoved ?? []
  const kept = previous.filter((item) => !current.has(item.article._ref) && !removed.includes(item.article._ref))

  if (removed.length === 0 && kept.length === previous.length) return null

  return [...removed.map((id) => entry(id, now)), ...kept].slice(0, REMOVED_HISTORY_LIMIT)
}
