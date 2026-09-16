import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  // Pages are already cached via ISR + on-demand revalidation on publish; the extra
  // Sanity CDN layer adds its own ~30s propagation lag on top, so a "Publish" in
  // Studio can appear to do nothing until a second edit lands after the CDN catches up.
  // Fetching the API directly keeps "published" meaning "live immediately".
  useCdn: false,
})
