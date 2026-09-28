import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES, JOURNALIST_EMAIL, SITE_TAGLINE } from '@/lib/constants'
import { formatMastheadDate } from '@/lib/utils/date'
import { SearchBox } from './SearchBox'

export function Header({ date = new Date() }: { date?: Date } = {}) {
  return (
    <header className="bg-white">
      <div className="bg-[#1b3d8f] text-xs text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1">
          <span>{formatMastheadDate(date)}</span>
          <span>Calabria - Italia</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-700">Blog dalla Calabria</p>
        <Link href="/" className="mt-2 inline-flex items-end justify-center gap-1">
          <Image
            src="/logo-malalingua.webp"
            alt="Malalingua"
            width={2000}
            height={500}
            className="h-auto w-60 shrink-0 md:w-96"
            priority
          />
          <span aria-hidden className="mb-2 font-display text-lg font-bold md:mb-4 md:text-2xl">.blog</span>
        </Link>
        <div className="mx-auto -mt-1 w-fit bg-[#d42a1c] px-8 py-1 font-display text-base font-bold uppercase italic tracking-wide text-white [clip-path:polygon(0_0,100%_0,96%_50%,100%_100%,0_100%,4%_50%)] md:text-xl">
          {SITE_TAGLINE}
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="flex items-center gap-4 border-b-4 border-neutral-800">
          <nav className="flex flex-1 gap-5 overflow-x-auto whitespace-nowrap py-2 text-sm font-semibold">
            {CATEGORIES.map((category) => (
              <Link key={category.slug} href={`/${category.slug}`} className="hover:text-[#d42a1c]">
                {category.name}
              </Link>
            ))}
            <a href={`mailto:${JOURNALIST_EMAIL}`} className="hover:text-[#d42a1c]">
              Invia un&apos;email
            </a>
          </nav>
          <div className="hidden lg:flex">
            <SearchBox />
          </div>
        </div>
      </div>
    </header>
  )
}
