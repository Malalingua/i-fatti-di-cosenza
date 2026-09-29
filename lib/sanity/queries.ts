import { client } from './client'
import type { Article, ArticleSummary, Category } from './types'

export function paginationRange(page: number, pageSize: number): [number, number] {
  const start = (page - 1) * pageSize
  return [start, start + pageSize]
}

const isPublished = `publishedAt <= now()`

const articleSummaryFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  featured,
  "category": category->{ _id, name, "slug": slug.current, accentColor }
`

export const featuredArticlesQuery = `*[_type == "article" && featured == true && ${isPublished}] | order(publishedAt desc) [0...$limit] { ${articleSummaryFields} }`

export const homepageSlotsQuery = `*[_type == "homepage" && _id == "homepage"][0]{
  "lead": select(lead->publishedAt <= now() => lead->{ ${articleSummaryFields} }),
  "slots": [
    select(topLeft->publishedAt <= now() => topLeft->{ ${articleSummaryFields} }),
    select(topRight->publishedAt <= now() => topRight->{ ${articleSummaryFields} }),
    select(bottomLeft->publishedAt <= now() => bottomLeft->{ ${articleSummaryFields} }),
    select(bottomRight->publishedAt <= now() => bottomRight->{ ${articleSummaryFields} })
  ],
  "raccolta": [
    select(raccolta1->publishedAt <= now() => raccolta1->{ ${articleSummaryFields} }),
    select(raccolta2->publishedAt <= now() => raccolta2->{ ${articleSummaryFields} })
  ]
}`

export const articlesByIdsQuery = `*[_type == "article" && _id in $ids && ${isPublished}] { ${articleSummaryFields} }`

export const latestArticlesQuery = `*[_type == "article" && ${isPublished}] | order(publishedAt desc) [0...$limit] { ${articleSummaryFields} }`

export const categoryArticlesQuery = `*[_type == "article" && category->slug.current == $categorySlug && ${isPublished}] | order(publishedAt desc) [$start...$end] { ${articleSummaryFields} }`

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug && ${isPublished}][0]{ ${articleSummaryFields}, body, "author": author->{ _id, name, photo, bio } }`

export const searchArticlesQuery = `*[_type == "article" && (title match $term || excerpt match $term) && ${isPublished}] | order(publishedAt desc) [0...20] { ${articleSummaryFields} }`

export const articleSlugsQuery = `*[_type == "article" && ${isPublished}]{ "slug": slug.current, publishedAt }`

export const allCategoriesQuery = `*[_type == "category"] | order(name asc) { _id, name, "slug": slug.current, accentColor }`

export async function getAllCategories(): Promise<Category[]> {
  return client.fetch(allCategoriesQuery)
}

export async function getFeaturedArticles(limit: number): Promise<ArticleSummary[]> {
  return client.fetch(featuredArticlesQuery, { limit })
}

export interface HomepageSelection {
  lead: ArticleSummary | null
  slots: (ArticleSummary | null)[]
  raccolta: (ArticleSummary | null)[]
}

export async function getHomepageSlots(): Promise<HomepageSelection> {
  const result: Partial<HomepageSelection> | null = await client.fetch(homepageSlotsQuery)
  return {
    lead: result?.lead ?? null,
    slots: result?.slots ?? [],
    raccolta: result?.raccolta ?? [],
  }
}

export async function getArticlesByIds(ids: string[]): Promise<ArticleSummary[]> {
  if (ids.length === 0) return []
  return client.fetch(articlesByIdsQuery, { ids })
}

export async function getLatestArticles(limit: number): Promise<ArticleSummary[]> {
  return client.fetch(latestArticlesQuery, { limit })
}

export async function getCategoryArticles(categorySlug: string, page: number, pageSize: number): Promise<ArticleSummary[]> {
  const [start, end] = paginationRange(page, pageSize)
  return client.fetch(categoryArticlesQuery, { categorySlug, start, end })
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return client.fetch(articleBySlugQuery, { slug })
}

export async function searchArticles(term: string): Promise<ArticleSummary[]> {
  return client.fetch(searchArticlesQuery, { term: `${term}*` })
}
