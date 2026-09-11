import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import { SearchBox } from './SearchBox'

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <Link href="/" className="font-display text-2xl font-bold">
        I Fatti di Cosenza
      </Link>
      <nav className="flex gap-6 text-sm font-semibold">
        {CATEGORIES.map((category) => (
          <Link key={category.slug} href={`/${category.slug}`}>
            {category.name}
          </Link>
        ))}
      </nav>
      <SearchBox />
    </header>
  )
}
