// Reads, from Sanity's document history, every published version of the
// Homepage since the "Ultime notizie" reset. The site compares what each
// version showed to find which articles were replaced and when. This runs on
// the server, so it works however the Homepage is published. Reading history
// needs a read token (SANITY_READ_TOKEN); without it there are no versions.

export const HOMEPAGE_SLOT_FIELDS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const
export const HOMEPAGE_RACCOLTA_FIELDS = ['raccolta1', 'raccolta2'] as const

// Replacements before this moment are ignored ("Ultime notizie" was reset).
export const FEED_RESET = '2026-09-29T18:00:00Z'

type Ref = { _ref?: string } | undefined
export type HomepageDoc = Record<string, Ref> | null

export interface HomepageVersion {
  time: string
  doc: HomepageDoc
}

export interface Replacement {
  id: string
  removedAt: string
}

export function referencedIds(versions: HomepageVersion[]): string[] {
  const ids = new Set<string>()
  for (const { doc } of versions) {
    for (const field of ['lead', ...HOMEPAGE_SLOT_FIELDS, ...HOMEPAGE_RACCOLTA_FIELDS]) {
      const id = doc?.[field]?._ref
      if (id) ids.add(id)
    }
  }
  return [...ids]
}

// `states` list what the homepage showed, oldest first; the first one is the
// baseline. An article counts as replaced when it stops being shown; if it
// comes back and leaves again, the latest removal wins.
export function replacementsFromShown(states: { time: string; shown: string[] }[]): Replacement[] {
  const removedAt = new Map<string, string>()
  for (let i = 1; i < states.length; i++) {
    const after = new Set(states[i].shown)
    for (const id of states[i - 1].shown) {
      if (!after.has(id)) removedAt.set(id, states[i].time)
    }
  }
  return [...removedAt].map(([id, time]) => ({ id, removedAt: time }))
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

async function historyRequest(path: string, immutable: boolean): Promise<Response | null> {
  const token = process.env.SANITY_READ_TOKEN
  if (!token) return null
  const response = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/data/history/${dataset}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...(immutable ? { cache: 'force-cache' as const } : { next: { revalidate: 60 } }),
  })
  if (!response.ok) {
    console.error(`Sanity history request failed (${response.status}): ${path}`)
    return null
  }
  return response
}

async function documentAt(query: string, immutable: boolean): Promise<HomepageDoc> {
  const response = await historyRequest(`documents/homepage?${query}`, immutable)
  if (!response) return null
  const body: { documents?: HomepageDoc[] } = await response.json()
  return body.documents?.[0] ?? null
}

export async function getHomepageVersions(): Promise<HomepageVersion[]> {
  const transactionsResponse = await historyRequest(
    `transactions/homepage?excludeContent=true&fromTime=${encodeURIComponent(FEED_RESET)}`,
    false
  )
  if (!transactionsResponse) return []

  const transactions: { id: string; timestamp: string }[] = (await transactionsResponse.text())
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
  if (transactions.length === 0) return []

  const [baseline, ...versions] = await Promise.all([
    documentAt(`time=${encodeURIComponent(FEED_RESET)}`, true),
    ...transactions.map((transaction) => documentAt(`revision=${transaction.id}`, true)),
  ])
  return [
    { time: FEED_RESET, doc: baseline },
    ...transactions.map((transaction, i) => ({ time: transaction.timestamp, doc: versions[i] })),
  ]
}
