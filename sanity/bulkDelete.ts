// Plans a bulk delete of articles in one transaction. The Homepage (and its
// draft) point to articles, so those references are cleared first, otherwise
// Sanity refuses to delete a referenced article.

export const HOMEPAGE_ARTICLE_FIELDS = [
  'lead',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'raccolta1',
  'raccolta2',
] as const

type HomepageDoc = { _id: string } & Partial<Record<(typeof HOMEPAGE_ARTICLE_FIELDS)[number], { _ref?: string }>>

export interface DeletePlan {
  unset: { id: string; fields: string[] }[]
  deleteIds: string[]
}

export function planBulkDelete(articleIds: string[], homepageDocs: HomepageDoc[]): DeletePlan {
  const selected = new Set(articleIds)
  const unset = homepageDocs
    .map((doc) => ({
      id: doc._id,
      fields: HOMEPAGE_ARTICLE_FIELDS.filter((field) => {
        const ref = doc[field]?._ref
        return ref !== undefined && selected.has(ref)
      }) as string[],
    }))
    .filter((item) => item.fields.length > 0)
  // Each article may also have an unpublished draft copy.
  const deleteIds = articleIds.flatMap((id) => [id, `drafts.${id}`])
  return { unset, deleteIds }
}
