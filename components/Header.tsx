import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES, JOURNALIST_EMAIL } from '@/lib/constants'
import { formatMastheadDate } from '@/lib/utils/date'
import { SearchBox } from './SearchBox'

export function Header({ date = new Date() }: { date?: Date } = {}) {
  return (
    <header className="bg-white">
      <div className="bg-[#1b3d8f] text-xs text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1">
          <span>{formatMastheadDate(date)}</span>
          <div className="flex items-center gap-4">
            <div className="hidden text-black md:block [&_button]:text-white [&_input]:py-0.5 [&_input]:text-xs">
              <SearchBox />
            </div>
            <span>Calabria - Italia</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black">Blog dalla Calabria</p>
        <Link href="/" className="mt-1 inline-block">
          <Image
            src="/logo-malalingua-blog.jpg"
            alt="Malalingua"
            width={2000}
            height={686}
            sizes="(min-width: 768px) 560px, 90vw"
            className="h-auto w-[90vw] max-w-[560px] mix-blend-multiply"
            priority
          />
        </Link>
      </div>

      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="border-b-4 border-neutral-800">
          <nav className="flex gap-x-5 gap-y-1 overflow-x-auto whitespace-nowrap py-2 text-sm font-semibold md:flex-wrap md:justify-center md:overflow-visible">
            {CATEGORIES.map((category) => (
              <Link key={category.slug} href={`/${category.slug}`} className="hover:text-[#d42a1c]">
                {category.name}
              </Link>
            ))}
            <a href={`mailto:${JOURNALIST_EMAIL}`} className="hover:text-[#d42a1c]">
              Invia un&apos;email
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
