# Homepage Newspaper Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's hero-banner-plus-category-rows layout with a newspaper-front-page-style grid (one lead story + a compact brief box per other category), and add a masthead date bar to the site header.

**Architecture:** A new pure utility formats today's date with a capitalized Italian weekday. `Header` (used site-wide via the `(site)` route group layout) renders that date in a new bar above the existing logo/nav row. The homepage fetches one featured article plus the single most recent article per other category, restyles `Hero` from a full-bleed overlay into a stacked image-then-text lead block, and adds a new `BriefCard` component (no image) for every other category that has content — categories with none produce no grid cell, so the CSS grid auto-compacts without gaps.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Vitest + React Testing Library.

## Global Constraints

- Masthead date format: capitalized Italian weekday + day + long month + year, e.g. "Martedì 15 settembre 2026" (spec: "Testata (Header)").
- The date bar appears in `Header`, which is shared by every page under the `(site)` route group — homepage, category, article, search (spec: "visibile su **tutte** le pagine").
- Homepage: the lead story block is followed by exactly one compact `BriefCard` (no image) per category that has at least one published article, excluding the lead's own category. A category with zero articles produces no grid cell — no empty placeholders (spec: "Nascondi lo slot").
- If no article has `featured = true`, the first available article (any category) becomes the lead so the homepage is never without a main block (spec: "Fallback").
- Out of scope, do not touch: `app/(site)/[category]/page.tsx`, `app/(site)/articolo/[slug]/page.tsx`, `app/(site)/cerca/page.tsx`, `app/studio/**` (spec: "Non toccato").
- Existing project test convention: Vitest + React Testing Library for components and pure utilities; async Server Components that fetch data (page-level files under `app/`) are verified manually via the dev server, not unit-tested — follow this pattern, do not add a test file for the homepage page component.

---

### Task 1: `formatMastheadDate` utility (TDD)

**Files:**
- Modify: `lib/utils/date.ts`
- Modify: `lib/utils/date.test.ts`

**Interfaces:**
- Consumes: nothing new (uses the existing `formatDate(isoString: string): string` already in this file).
- Produces: `formatMastheadDate(date: Date): string` — consumed by `Header` (Task 2).

- [ ] **Step 1: Write the failing test**

Add to `lib/utils/date.test.ts` (keep the existing `formatDate` describe block, add a new one below it):

```ts
import { describe, it, expect } from 'vitest'
import { formatDate, formatMastheadDate } from './date'

describe('formatDate', () => {
  it('formats an ISO date in Italian long form', () => {
    expect(formatDate('2026-09-11T12:00:00.000Z')).toBe('11 settembre 2026')
  })

  it('formats a different month correctly', () => {
    expect(formatDate('2026-01-03T12:00:00.000Z')).toBe('3 gennaio 2026')
  })
})

describe('formatMastheadDate', () => {
  it('formats a date with a capitalized Italian weekday', () => {
    expect(formatMastheadDate(new Date('2026-01-01T12:00:00.000Z'))).toBe('Giovedì 1 gennaio 2026')
  })
})
```

(Only the import line and the new `describe('formatMastheadDate', ...)` block are additions — the existing `formatDate` block stays exactly as it is.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/date.test.ts`
Expected: FAIL — `formatMastheadDate` is not exported from `./date`.

- [ ] **Step 3: Add the implementation**

Add to `lib/utils/date.ts` (below the existing `formatDate` function, keep `formatDate` unchanged):

```ts
export function formatMastheadDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: 'UTC' }).format(date)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalizedWeekday} ${formatDate(date.toISOString())}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/date.test.ts`
Expected: PASS (3 tests: the 2 existing `formatDate` tests plus the new `formatMastheadDate` test).

- [ ] **Step 5: Commit**

```bash
git add lib/utils/date.ts lib/utils/date.test.ts
git commit -m "feat: add formatMastheadDate utility for header date bar"
```

---

### Task 2: Header masthead date bar (TDD)

**Files:**
- Modify: `components/Header.tsx`
- Modify: `components/Header.test.tsx`

**Interfaces:**
- Consumes: `formatMastheadDate(date: Date): string` (Task 1).
- Produces: `Header({ date }?: { date?: Date })` — the `date` prop is optional (defaults to `new Date()`), consumed by the `(site)` layout which renders `<Header />` with no props in production; tests pass an explicit fixed `date` for determinism.

- [ ] **Step 1: Write the failing test**

Add a new test to `components/Header.test.tsx` (keep the two existing tests and the `next/navigation` mock exactly as they are):

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Header', () => {
  it('renders a link for each of the 5 fixed categories', () => {
    render(<Header />)
    const expected = [
      ['Cronaca', '/cronaca'],
      ['Politica', '/politica'],
      ['Cultura', '/cultura'],
      ['Sport', '/sport'],
      ['Enogastronomia', '/enogastronomia'],
    ]
    for (const [name, href] of expected) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('renders the site name linking home', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'I Fatti di Cosenza' })).toHaveAttribute('href', '/')
  })

  it('renders the masthead date for a given date', () => {
    render(<Header date={new Date('2026-01-01T12:00:00.000Z')} />)
    expect(screen.getByText('Giovedì 1 gennaio 2026')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/Header.test.tsx`
Expected: FAIL — `Header` does not accept a `date` prop yet, and the masthead text is not rendered.

- [ ] **Step 3: Update the implementation**

Replace the contents of `components/Header.tsx`:

```tsx
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
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/Header.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/Header.tsx components/Header.test.tsx
git commit -m "feat: add masthead date bar to Header"
```

---

### Task 3: `BriefCard` component (TDD, new)

**Files:**
- Create: `components/BriefCard.tsx`
- Create: `components/BriefCard.test.tsx`

**Interfaces:**
- Consumes: `CategoryBadge` (existing, `components/CategoryBadge.tsx`), `formatDate` (existing, `lib/utils/date.ts`), `ArticleSummary` type (existing, `lib/sanity/types.ts`).
- Produces: `BriefCard({ article: ArticleSummary })` — consumed by the homepage (Task 5).

- [ ] **Step 1: Write the failing test**

Create `components/BriefCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BriefCard } from './BriefCard'
import type { ArticleSummary } from '@/lib/sanity/types'

const article: ArticleSummary = {
  _id: '1',
  title: 'Il consiglio comunale approva il bilancio',
  slug: 'consiglio-comunale-bilancio',
  excerpt: 'Sintesi della seduta.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-01-03T12:00:00.000Z',
  category: { _id: 'c2', name: 'Politica', slug: 'politica', accentColor: '#1E5AC8' },
}

describe('BriefCard', () => {
  it('renders category, title, and date', () => {
    render(<BriefCard article={article} />)
    expect(screen.getByText('Politica')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: article.title })).toBeInTheDocument()
    expect(screen.getByText('3 gennaio 2026')).toBeInTheDocument()
  })

  it('links to the article page', () => {
    render(<BriefCard article={article} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articolo/consiglio-comunale-bilancio')
  })
})
```

No mocks are needed — `BriefCard` has no image, so it never touches `next/image` or `urlForImage`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/BriefCard.test.tsx`
Expected: FAIL — `BriefCard.tsx` does not exist yet.

- [ ] **Step 3: Create `components/BriefCard.tsx`**

```tsx
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function BriefCard({ article }: { article: ArticleSummary }) {
  return (
    <Link href={`/articolo/${article.slug}`} className="block border-t border-neutral-200 pt-3">
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <h3 className="mt-2 font-display text-lg font-bold leading-snug hover:underline">{article.title}</h3>
      <time className="mt-1 block text-xs text-neutral-500" dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
    </Link>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/BriefCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/BriefCard.tsx components/BriefCard.test.tsx
git commit -m "feat: add BriefCard component for homepage grid"
```

---

### Task 4: Restyle `Hero` from overlay banner to stacked lead block

**Files:**
- Modify: `components/Hero.tsx`
- Test (no changes expected, run as regression): `components/Hero.test.tsx`

**Interfaces:**
- Consumes: `CategoryBadge`, `urlForImage`, `formatDate`, `ArticleSummary` type — all unchanged from before.
- Produces: `Hero({ article: ArticleSummary })` — **same public contract as before** (still renders one `<h1>` with the article title, the category name as text, the formatted date as text, and wraps everything in exactly one link to `/articolo/<slug>`). Only the internal markup/styling changes, so `components/Hero.test.tsx` does not need to change — it verifies this contract is preserved.

- [ ] **Step 1: Confirm the current test passes before touching anything**

Run: `npx vitest run components/Hero.test.tsx`
Expected: PASS (2 tests) — this is your baseline.

- [ ] **Step 2: Replace the contents of `components/Hero.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function Hero({ article }: { article: ArticleSummary }) {
  return (
    <Link href={`/articolo/${article.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
        <Image
          src={urlForImage(article.coverImage).width(1600).height(1000).url()}
          alt={article.title}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
        <time className="mt-2 block text-sm text-neutral-500" dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  )
}
```

This moves the title/category/date from a dark overlay on top of the image to a plain block below it — the image, category badge, heading, and date elements are the same ones the existing test already queries for, just repositioned.

- [ ] **Step 3: Run test to verify it still passes**

Run: `npx vitest run components/Hero.test.tsx`
Expected: PASS (2 tests) — no test file changes were needed because the public contract (heading text, category text, date text, single link href) is unchanged.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx
git commit -m "refactor: restyle Hero from overlay banner to stacked lead block"
```

---

### Task 5: Homepage grid — lead story + one brief per category

**Files:**
- Modify: `app/(site)/page.tsx`

**Interfaces:**
- Consumes: `getAllCategories`, `getFeaturedArticles`, `getCategoryArticles` (existing, `lib/sanity/queries.ts` — signatures unchanged), `Hero` (Task 4), `BriefCard` (Task 3), `ArticleSummary` type (existing).
- Produces: the `/` route. No other file depends on this one.

- [ ] **Step 1: Replace the contents of `app/(site)/page.tsx`**

```tsx
import { getAllCategories, getCategoryArticles, getFeaturedArticles } from '@/lib/sanity/queries'
import { Hero } from '@/components/Hero'
import { BriefCard } from '@/components/BriefCard'
import type { ArticleSummary } from '@/lib/sanity/types'

export const revalidate = 3600

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getAllCategories(), getFeaturedArticles(1)])

  const briefCandidates = await Promise.all(
    categories
      .filter((category) => category._id !== featured[0]?.category._id)
      .map(async (category) => (await getCategoryArticles(category.slug, 1, 1))[0])
  )

  const briefs: ArticleSummary[] = briefCandidates.filter((article): article is ArticleSummary => Boolean(article))

  const lead = featured[0] ?? briefs.shift()

  if (!lead) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-neutral-500">Nessun articolo pubblicato.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 lg:row-span-2">
          <Hero article={lead} />
        </div>
        {briefs.map((article) => (
          <BriefCard key={article._id} article={article} />
        ))}
      </div>
    </main>
  )
}
```

Note what changed from the previous version: `getCategoryArticles(category.slug, 1, 4)` (4 articles per category, rendered as `ArticleCard` rows) becomes `getCategoryArticles(category.slug, 1, 1)` (the single most recent article per category, rendered as a `BriefCard` grid cell) for every category except the lead's own; the `ArticleCard`, `Link`, and `CATEGORIES` imports are no longer used on this page and are dropped. `ArticleCard` itself is untouched and still used by the category, article, and search pages.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`

Expected, with real Sanity content (at least one `featured` article and a few articles across categories, published via `/studio`):
- The masthead date bar shows today's date above the logo, on every page (spot-check by also opening a category page and the article page).
- The featured article renders as the large lead block (image, then category badge, title, date below it — no dark overlay).
- Every other category that has at least one published article shows exactly one compact box (category badge + title + date, no image) — no empty boxes or gaps for categories with zero articles.
- If no article is marked `featured` in Sanity, confirm the first available article still becomes the lead (temporarily unpublish/unfeature the featured article to check this, then restore it).

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: rebuild homepage as newspaper-style grid (lead + category briefs)"
```
