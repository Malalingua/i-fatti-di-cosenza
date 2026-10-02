import Link from 'next/link'
import { CookiePreferencesLink } from './CookieConsent'
import { ABOUT_TEXT, CATEGORIES, JOURNALIST_EMAIL, MASTHEAD } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="mt-8 bg-neutral-950 text-sm text-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="font-display text-3xl font-bold text-white">
          Mala<span className="text-[#d42a1c]">lingua</span>
          <span className="text-base">.blog</span>
        </p>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-white">Chi siamo</h2>
            <p className="leading-relaxed">{ABOUT_TEXT}</p>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-white">Gerenza</h2>
            <p>Sede: {MASTHEAD.address}</p>
            <p>
              Telefono:{' '}
              <a href={`tel:+39${MASTHEAD.phone.replace(/\s/g, '')}`} className="hover:text-white">
                {MASTHEAD.phone}
              </a>
            </p>
            <p>
              Email: <a href={`mailto:${MASTHEAD.email}`} className="hover:text-white">{MASTHEAD.email}</a>
            </p>
            <p>
              WhatsApp:{' '}
              <a href={`https://wa.me/39${MASTHEAD.whatsapp.replace(/\s/g, '')}`} className="hover:text-white">
                {MASTHEAD.whatsapp}
              </a>
            </p>
          </div>
        </div>
        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-neutral-800 pt-4 text-xs">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/${category.slug}`} className="hover:text-white">
              {category.name}
            </Link>
          ))}
          <a href={`mailto:${JOURNALIST_EMAIL}`} className="hover:text-white">
            Invia un&apos;email
          </a>
          <Link href="/cookie-policy" className="hover:text-white">
            Cookie policy
          </Link>
          <CookiePreferencesLink className="hover:text-white" />
        </nav>
        <p className="mt-4 text-xs text-neutral-400">© {new Date().getFullYear()} Malalingua</p>
      </div>
    </footer>
  )
}
