'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES, JOURNALIST_EMAIL } from '@/lib/constants'
import { formatMastheadDate } from '@/lib/utils/date'
import { SearchBox } from './SearchBox'

export function Header({ date = new Date() }: { date?: Date } = {}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-6 py-1 text-center text-xs uppercase tracking-wide text-neutral-500">
        {formatMastheadDate(date)}
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Link href="/">
            <Image src="/logo-malalingua.webp" alt="Malalingua" width={200} height={49} className="h-10 w-auto" priority />
          </Link>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Blog satirico dalla calabria</p>
        </div>
        <nav className="hidden gap-6 text-sm font-semibold md:flex">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/${category.slug}`}>
              {category.name}
            </Link>
          ))}
          <a href={`mailto:${JOURNALIST_EMAIL}`}>Invia un&apos;email</a>
        </nav>
        <div className="hidden md:flex">
          <SearchBox />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 text-neutral-900"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-semibold">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                onClick={() => setIsOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <a
              href={`mailto:${JOURNALIST_EMAIL}`}
              onClick={() => setIsOpen(false)}
            >
              Invia un&apos;email
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
