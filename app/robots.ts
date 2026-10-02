import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/studio' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
