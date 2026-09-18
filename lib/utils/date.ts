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
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: 'UTC' }).format(date)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalizedWeekday} ${formatDate(date.toISOString())}`
}
