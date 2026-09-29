// Rebuilds, from Sanity's document history, which articles were replaced in
// the homepage boxes and when. This runs on the server, so it works however
// the Homepage is published. Reading history needs a read token
// (SANITY_READ_TOKEN); without it the list is empty.

export const HOMEPAGE_SLOT_FIELDS = [
  'lead',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'raccolta1',
  'raccolta2',
] as const

// Replacements before this moment are ignored ("Ultime notizie" was reset).
export const FEED_RESET = '2026-09-29T18:00:00Z'

type HomepageDoc = Partial<Record<(typeof HOMEPAGE_SLOT_FIELDS)[number], { _ref?: string }>> | null | undefined

export interface Replacement {
  id: string
  removedAt: string
}

function slotIds(doc: HomepageDoc): Set<string> {
  const ids = new Set<string>()
  for (const field of HOMEPAGE_SLOT_FIELDS) {
    const id = doc?.[field]?._ref
    if (id) ids.add(id)
  }
  return ids
}

// `states` are successive published versions, oldest first; the first one is
// the baseline. An article counts as replaced when it leaves every slot; if it
// comes back and leaves again, the latest removal wins.
export function replacementsFromStates(states: { time: string; doc: HomepageDoc }[]): Replacement[] {
  const removedAt = new Map<string, string>()
  for (let i = 1; i < states.length; i++) {
    const before = slotIds(states[i - 1].doc)
    const after = slotIds(states[i].doc)
    for (const id of before) {
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

export async function getHomepageReplacements(): Promise<Replacement[]> {
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
  return replacementsFromStates([
    { time: FEED_RESET, doc: baseline },
    ...transactions.map((transaction, i) => ({ time: transaction.timestamp, doc: versions[i] })),
  ])
}
