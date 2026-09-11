import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-6 py-8 text-sm text-neutral-500">
      <nav className="flex gap-4">
        {CATEGORIES.map((category) => (
          <Link key={category.slug} href={`/${category.slug}`}>
            {category.name}
          </Link>
        ))}
      </nav>
      <p className="mt-4">© {new Date().getFullYear()} I Fatti di Cosenza</p>
    </footer>
  )
}
