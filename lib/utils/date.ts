export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatMastheadDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
