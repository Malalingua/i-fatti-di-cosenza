'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import {
  clearAnalyticsCookies,
  OPEN_PREFERENCES_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from '@/lib/consent'

// Cookie banner + Google Analytics. Analytics loads only after "Accetta";
// gaId is null outside the public site so tests and previews are not counted.
export function CookieConsent({ gaId }: { gaId: string | null }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = readConsent()
    setChoice(saved)
    setOpen(saved === null)
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_PREFERENCES_EVENT, reopen)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, reopen)
  }, [])

  function decide(next: ConsentChoice) {
    saveConsent(next)
    setOpen(false)
    if (next === 'denied' && choice === 'granted') {
      clearAnalyticsCookies()
      // The script is already running: reload so it stops for good.
      window.location.reload()
      return
    }
    setChoice(next)
  }

  return (
    <>
      {gaId && choice === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      )}
      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Preferenze cookie"
          className="fixed inset-x-0 bottom-0 z-50 border-t-4 border-[#d42a1c] bg-neutral-950 text-sm text-neutral-200 shadow-2xl"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <p className="leading-relaxed">
              Usiamo cookie tecnici necessari al sito e, solo se accetti, Google Analytics per contare le visite in
              forma statistica.{' '}
              <Link href="/cookie-policy" className="underline hover:text-white">
                Cookie policy
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide('denied')}
                className="border border-neutral-500 px-4 py-2 font-semibold hover:border-white hover:text-white"
              >
                Rifiuta
              </button>
              <button
                type="button"
                onClick={() => decide('granted')}
                className="bg-[#d42a1c] px-4 py-2 font-semibold text-white hover:bg-[#b52215]"
              >
                Accetta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))} className={className}>
      Preferenze cookie
    </button>
  )
}
