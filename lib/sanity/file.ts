export function urlForFile(source: { asset?: { _ref?: string } }): string | null {
  const ref = source?.asset?._ref
  if (!ref) return null

  const match = ref.match(/^file-([a-f0-9]+)-(\w+)$/)
  if (!match) return null
  const [, id, extension] = match

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`
}

export function getVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}
