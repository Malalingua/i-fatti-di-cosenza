import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import { formatMastheadDate } from '@/lib/utils/date'
import { SearchBox } from './SearchBox'

export function Header({ date = new Date() }: { date?: Date } = {}) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-6 py-1 text-center text-xs uppercase tracking-wide text-neutral-500">
        {formatMastheadDate(date)}
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Link href="/" className="font-display text-2xl font-bold">
            I Fatti di Cosenza
          </Link>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Blog satirico dalla calabria</p>
        </div>
        <nav className="flex gap-6 text-sm font-semibold">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
        <SearchBox />
      </div>
    </header>
  )
}
