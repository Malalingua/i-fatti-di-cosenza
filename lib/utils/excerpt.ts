export function truncateExcerpt(text: string, maxLength = 140): string {
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  const safeCut = lastSpace > 0 ? lastSpace : maxLength
  return `${truncated.slice(0, safeCut)}…`
}
