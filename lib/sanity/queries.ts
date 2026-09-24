import { client } from './client'
import type { Article, ArticleSummary, Category } from './types'

export function paginationRange(page: number, pageSize: number): [number, number] {
  const start = (page - 1) * pageSize
  return [start, start + pageSize]
}

const articleSummaryFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  "category": category->{ _id, name, "slug": slug.current, accentColor }
`

export const featuredArticlesQuery = `*[_type == "article" && featured == true] | order(publishedAt desc) [0...$limit] { ${articleSummaryFields} }`

export const topBoxArticlesQuery = `*[_type == "article" && topBox == true] | order(publishedAt desc) [0...$limit] { ${articleSummaryFields} }`

export const categoryArticlesQuery = `*[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) [$start...$end] { ${articleSummaryFields} }`

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0]{ ${articleSummaryFields}, body, "author": author->{ _id, name, photo, bio } }`

export const searchArticlesQuery = `*[_type == "article" && (title match $term || excerpt match $term)] | order(publishedAt desc) [0...20] { ${articleSummaryFields} }`

export const allCategoriesQuery = `*[_type == "category"] | order(name asc) { _id, name, "slug": slug.current, accentColor }`

export async function getAllCategories(): Promise<Category[]> {
  return client.fetch(allCategoriesQuery)
}

export async function getFeaturedArticles(limit: number): Promise<ArticleSummary[]> {
  return client.fetch(featuredArticlesQuery, { limit })
}

export async function getTopBoxArticles(limit: number): Promise<ArticleSummary[]> {
  return client.fetch(topBoxArticlesQuery, { limit })
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
