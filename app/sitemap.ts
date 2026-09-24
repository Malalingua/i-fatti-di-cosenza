import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { articleSlugsQuery, getAllCategories } from '@/lib/sanity/queries'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const categories = await getAllCategories()
  const articleSlugs: { slug: string; publishedAt: string }[] = await client.fetch(articleSlugsQuery)

  return [
    { url: siteUrl, lastModified: new Date() },
    ...categories.map((category) => ({ url: `${siteUrl}/${category.slug}`, lastModified: new Date() })),
    ...articleSlugs.map((article) => ({
      url: `${siteUrl}/articolo/${article.slug}`,
      lastModified: new Date(article.publishedAt),
    })),
  ]
}
