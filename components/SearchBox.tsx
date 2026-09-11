'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function buildSearchHref(term: string): string {
  return `/cerca?q=${encodeURIComponent(term.trim())}`
}

export function SearchBox() {
  const router = useRouter()
  const [term, setTerm] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!term.trim()) return
    router.push(buildSearchHref(term))
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2">
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Cerca notizie..."
        aria-label="Cerca notizie"
        className="rounded-full border border-neutral-300 px-4 py-1 text-sm"
      />
      <button type="submit" className="text-sm font-semibold">
        Cerca
      </button>
    </form>
  )
}
