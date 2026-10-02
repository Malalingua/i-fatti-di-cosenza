export const GA_MEASUREMENT_ID = 'G-9T5H8RWVSZ'

export type ConsentChoice = 'granted' | 'denied'

const STORAGE_KEY = 'malalingua-cookie-consent'

// Fired by the footer link to show the cookie banner again.
export const OPEN_PREFERENCES_EVENT = 'malalingua:cookie-preferences'

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }
}

// Removes the Analytics cookies (_ga, _ga_<id>) after a visitor withdraws consent.
export function clearAnalyticsCookies() {
  const host = window.location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (!name.startsWith('_ga')) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
    }
  }
}
