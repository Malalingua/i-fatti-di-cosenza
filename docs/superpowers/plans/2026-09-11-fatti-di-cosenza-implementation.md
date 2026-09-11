# I Fatti di Cosenza Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + Sanity news website for Cosenza covering cronaca, politica, cultura, sport, enogastronomia, with editorial-bold design and strong SEO.

**Architecture:** Next.js 14 App Router (TypeScript) renders pages with ISR, fetching content from Sanity (headless CMS, embedded Studio at `/studio`) via typed GROQ queries. Pure logic (query builders, pagination, formatting) is unit-tested with Vitest; presentational components are tested with React Testing Library; data-fetching Server Components are verified manually in the browser. Publishing in Sanity triggers a webhook that hits `/api/revalidate` to refresh ISR pages on demand.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Sanity v3 (`sanity`, `next-sanity`, `@sanity/image-url`), `@portabletext/react`, Vitest + React Testing Library, npm, Vercel.

## Global Constraints

- Rendering strategy: ISR with on-demand revalidation via Sanity webhook (spec: "Rendering").
- Fixed category set: cronaca, politica, cultura, sport, enogastronomia (spec: "Content model").
- Visual style: editorial bold — serif display font for headlines, neutral sans for body, full-width hero with dark overlay, colored category badges (spec: "Design visivo").
- SEO: dynamic per-page metadata, `sitemap.xml`/`robots.txt`, JSON-LD Article schema (spec: "SEO").
- Multi-author via Sanity's built-in project roles — no custom auth/roles code in the Next.js app.
- Out of scope: newsletter signup, comments, dark mode (spec: "Fuori scope").
- Language: UI copy in Italian.

---

### Task 1: Project scaffold — Next.js, TypeScript, Tailwind

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`

**Interfaces:**
- Produces: working `npm run dev` / `npm run build` on a Next.js App Router project with `@/*` path alias resolving to project root.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "i-fatti-di-cosenza",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-sanity": "^9.4.0",
    "sanity": "^3.57.0",
    "@sanity/image-url": "^1.0.2",
    "@sanity/vision": "^3.57.0",
    "styled-components": "^6.1.0",
    "@portabletext/react": "^3.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "vitest": "^1.6.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^24.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `package-lock.json`.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
}

module.exports = nextConfig
```

- [ ] **Step 5: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 6: Create `postcss.config.js`**

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

- [ ] **Step 7: Create `.eslintrc.json`**

```json
{ "extends": "next/core-web-vitals" }
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
.next
out
.env.local
.env*.local
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 9: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 10: Create `app/layout.tsx`** (minimal placeholder, fonts/header/footer added in Task 12)

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'I Fatti di Cosenza',
  description: 'Notizie di cronaca, politica, cultura, sport ed enogastronomia da Cosenza.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 11: Create placeholder `app/page.tsx`**

```tsx
export default function HomePage() {
  return <main>I Fatti di Cosenza</main>
}
```

- [ ] **Step 12: Verify build**

Run: `npm run build`
Expected: build succeeds with no type or lint errors.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.js tailwind.config.ts postcss.config.js .eslintrc.json .gitignore app
git commit -m "chore: scaffold Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Vitest testing setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

**Interfaces:**
- Produces: `npm test` running Vitest with jsdom environment, `@testing-library/jest-dom` matchers, and `@/*` alias resolution — used by every subsequent test file.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Write a smoke test to verify the harness**

Create `lib/utils/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: 1 test passes.

- [ ] **Step 5: Delete the smoke test**

Run: `rm lib/utils/smoke.test.ts`

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "chore: add Vitest + React Testing Library setup"
```

---

### Task 3: Sanity schemas and embedded Studio

**Prerequisite (manual, do this yourself before starting this task):** Create a free Sanity account and project at https://www.sanity.io/manage, or run `npx sanity@latest init` from the project root and follow its login prompt in your own browser. Note the resulting **Project ID** and **dataset name** (default `production`) — you'll put them in `.env.local` in Task 4.

**Files:**
- Create: `sanity/schemaTypes/category.ts`
- Create: `sanity/schemaTypes/author.ts`
- Create: `sanity/schemaTypes/article.ts`
- Create: `sanity/schemaTypes/index.ts`
- Create: `sanity.config.ts`
- Create: `app/studio/[[...tool]]/page.tsx`

**Interfaces:**
- Produces: Sanity schema types `category`, `author`, `article` with fields matching `lib/sanity/types.ts` (Task 4) — `category.name`, `category.slug`, `category.accentColor`; `author.name`, `author.photo`, `author.bio`; `article.title`, `article.slug`, `article.excerpt`, `article.body`, `article.coverImage`, `article.category` (ref), `article.author` (ref), `article.publishedAt`, `article.featured`.

- [ ] **Step 1: Create `sanity/schemaTypes/category.ts`**

```ts
import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Categoria',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (rule) => rule.required() }),
    defineField({
      name: 'accentColor',
      title: 'Colore accento',
      type: 'string',
      description: 'Codice colore esadecimale, es. #C81E2D',
      validation: (rule) => rule.required().regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
    }),
  ],
})
```

- [ ] **Step 2: Create `sanity/schemaTypes/author.ts`**

```ts
import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Autore',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'photo', title: 'Foto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', title: 'Bio breve', type: 'text', rows: 3 }),
  ],
})
```

- [ ] **Step 3: Create `sanity/schemaTypes/article.ts`**

```ts
import { defineField, defineType } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Articolo',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titolo', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({ name: 'excerpt', title: 'Sommario', type: 'text', rows: 3, validation: (rule) => rule.required().max(200) }),
    defineField({
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Corpo articolo',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autore',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data pubblicazione',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'featured', title: 'In evidenza', type: 'boolean', initialValue: false }),
  ],
})
```

- [ ] **Step 4: Create `sanity/schemaTypes/index.ts`**

```ts
import { article } from './article'
import { category } from './category'
import { author } from './author'

export const schemaTypes = [article, category, author]
```

- [ ] **Step 5: Create `sanity.config.ts`** at project root

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'I Fatti di Cosenza',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 6: Create `app/studio/[[...tool]]/page.tsx`**

```tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 7: Add placeholder env vars so the build doesn't crash**

Create `.env.local` (not committed — already covered by `.gitignore`):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

Replace `your-project-id` with the real Project ID from the manual prerequisite above.

- [ ] **Step 8: Verify Studio loads**

Run: `npm run dev`, open `http://localhost:3000/studio`
Expected: Sanity Studio loads and shows "Categoria", "Autore", "Articolo" document types in the sidebar. Create the 5 categories now (cronaca, politica, cultura, sport, enogastronomia) with a distinct accent color each, and one author document — later tasks assume at least one category and one article exist.

- [ ] **Step 9: Commit**

```bash
git add sanity sanity.config.ts app/studio
git commit -m "feat: add Sanity schemas and embedded Studio"
```

---

### Task 4: Sanity client, image builder, shared types

**Files:**
- Create: `lib/sanity/client.ts`
- Create: `lib/sanity/image.ts`
- Create: `lib/sanity/types.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` env vars (Task 3).
- Produces: `client` (Sanity client instance), `urlForImage(source): ImageUrlBuilder`, and types `Category`, `Author`, `ArticleSummary`, `Article` — used by every query and component from here on.

- [ ] **Step 1: Create `lib/sanity/client.ts`**

```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})
```

- [ ] **Step 2: Create `lib/sanity/image.ts`**

```ts
import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}
```

- [ ] **Step 3: Create `lib/sanity/types.ts`**

```ts
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import type { PortableTextBlock } from '@portabletext/react'

export interface Category {
  _id: string
  name: string
  slug: string
  accentColor: string
}

export interface Author {
  _id: string
  name: string
  photo?: SanityImageSource
  bio?: string
}

export interface ArticleSummary {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: SanityImageSource
  publishedAt: string
  category: Category
}

export interface Article extends ArticleSummary {
  body: PortableTextBlock[]
  author: Author
}
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/sanity
git commit -m "feat: add Sanity client, image builder, and shared types"
```

---

### Task 5: Query builders and pagination logic (TDD)

**Files:**
- Create: `lib/sanity/queries.ts`
- Test: `lib/sanity/queries.test.ts`

**Interfaces:**
- Consumes: `client` from `lib/sanity/client.ts` (Task 4), types from `lib/sanity/types.ts` (Task 4).
- Produces: `paginationRange(page, pageSize): [number, number]`, `getAllCategories()`, `getFeaturedArticles(limit)`, `getCategoryArticles(categorySlug, start, end)`, `getArticleBySlug(slug)`, `searchArticles(term)` — consumed by pages in Tasks 13–16.

- [ ] **Step 1: Write the failing test for `paginationRange`**

```ts
import { describe, it, expect } from 'vitest'
import { paginationRange } from './queries'

describe('paginationRange', () => {
  it('returns [0, pageSize] for the first page', () => {
    expect(paginationRange(1, 10)).toEqual([0, 10])
  })

  it('offsets by page size for later pages', () => {
    expect(paginationRange(3, 10)).toEqual([20, 30])
  })

  it('supports a custom page size', () => {
    expect(paginationRange(2, 5)).toEqual([5, 10])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/sanity/queries.test.ts`
Expected: FAIL — `queries.ts` does not exist yet.

- [ ] **Step 3: Create `lib/sanity/queries.ts`**

```ts
import { client } from './client'
import type { Article, ArticleSummary, Category } from './types'

export function paginationRange(page: number, pageSize: number): [number, number] {
  const start = (page - 1) * pageSize
  return [start, start + pageSize]
}

const articleSummaryFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  "category": category->{ _id, name, "slug": slug.current, accentColor }
`

export const featuredArticlesQuery = `*[_type == "article" && featured == true] | order(publishedAt desc) [0...$limit] { ${articleSummaryFields} }`

export const categoryArticlesQuery = `*[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) [$start...$end] { ${articleSummaryFields} }`

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0]{ ${articleSummaryFields}, body, "author": author->{ _id, name, photo, bio } }`

export const searchArticlesQuery = `*[_type == "article" && (title match $term || excerpt match $term)] | order(publishedAt desc) [0...20] { ${articleSummaryFields} }`

export const allCategoriesQuery = `*[_type == "category"] | order(name asc) { _id, name, "slug": slug.current, accentColor }`

export async function getAllCategories(): Promise<Category[]> {
  return client.fetch(allCategoriesQuery)
}

export async function getFeaturedArticles(limit: number): Promise<ArticleSummary[]> {
  return client.fetch(featuredArticlesQuery, { limit })
}

export async function getCategoryArticles(categorySlug: string, page: number, pageSize: number): Promise<ArticleSummary[]> {
  const [start, end] = paginationRange(page, pageSize)
  return client.fetch(categoryArticlesQuery, { categorySlug, start, end })
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return client.fetch(articleBySlugQuery, { slug })
}

export async function searchArticles(term: string): Promise<ArticleSummary[]> {
  return client.fetch(searchArticlesQuery, { term: `${term}*` })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/sanity/queries.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/sanity/queries.ts lib/sanity/queries.test.ts
git commit -m "feat: add GROQ query builders with parameterized pagination"
```

---

### Task 6: Formatting utilities (TDD)

**Files:**
- Create: `lib/utils/date.ts`
- Test: `lib/utils/date.test.ts`
- Create: `lib/utils/excerpt.ts`
- Test: `lib/utils/excerpt.test.ts`

**Interfaces:**
- Produces: `formatDate(isoString: string): string`, `truncateExcerpt(text: string, maxLength?: number): string` — consumed by `ArticleCard`, `Hero` (Tasks 8–9).

- [ ] **Step 1: Write the failing test for `formatDate`**

```ts
import { describe, it, expect } from 'vitest'
import { formatDate } from './date'

describe('formatDate', () => {
  it('formats an ISO date in Italian long form', () => {
    expect(formatDate('2026-09-11T12:00:00.000Z')).toBe('11 settembre 2026')
  })

  it('formats a different month correctly', () => {
    expect(formatDate('2026-01-03T12:00:00.000Z')).toBe('3 gennaio 2026')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/date.test.ts`
Expected: FAIL — `date.ts` does not exist yet.

- [ ] **Step 3: Create `lib/utils/date.ts`**

```ts
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/date.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing test for `truncateExcerpt`**

```ts
import { describe, it, expect } from 'vitest'
import { truncateExcerpt } from './excerpt'

describe('truncateExcerpt', () => {
  it('returns short text unchanged', () => {
    expect(truncateExcerpt('Testo breve.', 140)).toBe('Testo breve.')
  })

  it('truncates long text at a word boundary with an ellipsis', () => {
    const text = 'a'.repeat(10) + ' ' + 'b'.repeat(10) + ' ' + 'c'.repeat(10)
    expect(truncateExcerpt(text, 15)).toBe('aaaaaaaaaa…')
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run lib/utils/excerpt.test.ts`
Expected: FAIL — `excerpt.ts` does not exist yet.

- [ ] **Step 7: Create `lib/utils/excerpt.ts`**

```ts
export function truncateExcerpt(text: string, maxLength = 140): string {
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  const safeCut = lastSpace > 0 ? lastSpace : maxLength
  return `${truncated.slice(0, safeCut)}…`
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run lib/utils/excerpt.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add lib/utils
git commit -m "feat: add date formatting and excerpt truncation utilities"
```

---

### Task 7: `CategoryBadge` component (TDD)

**Files:**
- Create: `components/CategoryBadge.tsx`
- Test: `components/CategoryBadge.test.tsx`

**Interfaces:**
- Produces: `CategoryBadge({ name: string, accentColor: string })` — consumed by `ArticleCard` (Task 8) and `Hero` (Task 9).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadge } from './CategoryBadge'

describe('CategoryBadge', () => {
  it('renders the category name', () => {
    render(<CategoryBadge name="Sport" accentColor="#1E5AC8" />)
    expect(screen.getByText('Sport')).toBeInTheDocument()
  })

  it('applies the accent color as the background', () => {
    render(<CategoryBadge name="Cultura" accentColor="#7A1EC8" />)
    expect(screen.getByText('Cultura')).toHaveStyle({ backgroundColor: '#7A1EC8' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/CategoryBadge.test.tsx`
Expected: FAIL — `CategoryBadge.tsx` does not exist yet.

- [ ] **Step 3: Create `components/CategoryBadge.tsx`**

```tsx
interface CategoryBadgeProps {
  name: string
  accentColor: string
}

export function CategoryBadge({ name, accentColor }: CategoryBadgeProps) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: accentColor }}
    >
      {name}
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/CategoryBadge.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/CategoryBadge.tsx components/CategoryBadge.test.tsx
git commit -m "feat: add CategoryBadge component"
```

---

### Task 8: `ArticleCard` component (TDD)

**Files:**
- Create: `components/ArticleCard.tsx`
- Test: `components/ArticleCard.test.tsx`

**Interfaces:**
- Consumes: `CategoryBadge` (Task 7), `urlForImage` (Task 4), `formatDate` (Task 6), `ArticleSummary` type (Task 4).
- Produces: `ArticleCard({ article: ArticleSummary })` — consumed by homepage (Task 13), category page (Task 14), search page (Task 16).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleCard } from './ArticleCard'
import type { ArticleSummary } from '@/lib/sanity/types'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />,
}))

vi.mock('@/lib/sanity/image', () => ({
  urlForImage: () => ({ width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/test.jpg' }) }) }),
}))

const article: ArticleSummary = {
  _id: '1',
  title: 'Il centro storico si rifà il look',
  slug: 'centro-storico-rifa-look',
  excerpt: 'Al via i lavori di riqualificazione di Corso Mazzini.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-09-11T12:00:00.000Z',
  category: { _id: 'c1', name: 'Cronaca', slug: 'cronaca', accentColor: '#C81E2D' },
}

describe('ArticleCard', () => {
  it('renders title, excerpt, category, and date', () => {
    render(<ArticleCard article={article} />)
    expect(screen.getByText(article.title)).toBeInTheDocument()
    expect(screen.getByText(article.excerpt)).toBeInTheDocument()
    expect(screen.getByText('Cronaca')).toBeInTheDocument()
    expect(screen.getByText('11 settembre 2026')).toBeInTheDocument()
  })

  it('links title and image to the article page', () => {
    render(<ArticleCard article={article} />)
    const links = screen.getAllByRole('link')
    expect(links.every((link) => link.getAttribute('href') === '/articolo/centro-storico-rifa-look')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ArticleCard.test.tsx`
Expected: FAIL — `ArticleCard.tsx` does not exist yet.

- [ ] **Step 3: Create `components/ArticleCard.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const href = `/articolo/${article.slug}`

  return (
    <article className="flex flex-col gap-3">
      <Link href={href} className="group relative block aspect-video overflow-hidden rounded-lg">
        <Image
          src={urlForImage(article.coverImage).width(600).height(338).url()}
          alt={article.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </Link>
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <Link href={href}>
        <h3 className="font-display text-xl font-bold leading-tight hover:underline">{article.title}</h3>
      </Link>
      <p className="text-sm text-neutral-600">{article.excerpt}</p>
      <time className="text-xs text-neutral-400" dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
    </article>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ArticleCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ArticleCard.tsx components/ArticleCard.test.tsx
git commit -m "feat: add ArticleCard component"
```

---

### Task 9: `Hero` component (TDD)

**Files:**
- Create: `components/Hero.tsx`
- Test: `components/Hero.test.tsx`

**Interfaces:**
- Consumes: `CategoryBadge` (Task 7), `urlForImage` (Task 4), `formatDate` (Task 6), `ArticleSummary` type (Task 4).
- Produces: `Hero({ article: ArticleSummary })` — consumed by homepage (Task 13).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import type { ArticleSummary } from '@/lib/sanity/types'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />,
}))

vi.mock('@/lib/sanity/image', () => ({
  urlForImage: () => ({ width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/hero.jpg' }) }) }),
}))

const article: ArticleSummary = {
  _id: '1',
  title: 'La Calabria celebra il Redentore',
  slug: 'calabria-celebra-redentore',
  excerpt: 'Migliaia in strada per la festa più sentita.',
  coverImage: {} as ArticleSummary['coverImage'],
  publishedAt: '2026-09-11T12:00:00.000Z',
  category: { _id: 'c1', name: 'Cultura', slug: 'cultura', accentColor: '#7A1EC8' },
}

describe('Hero', () => {
  it('renders the featured article title, category, and date', () => {
    render(<Hero article={article} />)
    expect(screen.getByRole('heading', { name: article.title })).toBeInTheDocument()
    expect(screen.getByText('Cultura')).toBeInTheDocument()
    expect(screen.getByText('11 settembre 2026')).toBeInTheDocument()
  })

  it('links to the article page', () => {
    render(<Hero article={article} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articolo/calabria-celebra-redentore')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/Hero.test.tsx`
Expected: FAIL — `Hero.tsx` does not exist yet.

- [ ] **Step 3: Create `components/Hero.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import type { ArticleSummary } from '@/lib/sanity/types'
import { CategoryBadge } from './CategoryBadge'

export function Hero({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/articolo/${article.slug}`}
      className="group relative block h-[60vh] min-h-[400px] overflow-hidden rounded-2xl"
    >
      <Image
        src={urlForImage(article.coverImage).width(1600).height(900).url()}
        alt={article.title}
        fill
        priority
        className="object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">{article.title}</h1>
        <time className="mt-2 block text-sm text-neutral-300" dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/Hero.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/Hero.tsx components/Hero.test.tsx
git commit -m "feat: add Hero component"
```

---

### Task 10: `SearchBox` component (TDD)

**Files:**
- Create: `components/SearchBox.tsx`
- Test: `components/SearchBox.test.tsx`

**Interfaces:**
- Produces: `buildSearchHref(term: string): string`, `SearchBox()` client component — consumed by `Header` (Task 11); `buildSearchHref` behavior relied on by the search page's expected URL shape (Task 16).

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildSearchHref, SearchBox } from './SearchBox'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  pushMock.mockClear()
})

describe('buildSearchHref', () => {
  it('URL-encodes the search term into the query string', () => {
    expect(buildSearchHref('sagra peperoncino')).toBe('/cerca?q=sagra%20peperoncino')
  })
})

describe('SearchBox', () => {
  it('navigates to the search page on submit', async () => {
    render(<SearchBox />)
    await userEvent.type(screen.getByLabelText('Cerca notizie'), 'Calabria')
    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    expect(pushMock).toHaveBeenCalledWith('/cerca?q=Calabria')
  })

  it('does not navigate on empty submit', async () => {
    render(<SearchBox />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }))
    expect(pushMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/SearchBox.test.tsx`
Expected: FAIL — `SearchBox.tsx` does not exist yet.

- [ ] **Step 3: Create `components/SearchBox.tsx`**

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/SearchBox.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/SearchBox.tsx components/SearchBox.test.tsx
git commit -m "feat: add SearchBox component"
```

---

### Task 11: `Header` and `Footer` components (TDD)

**Files:**
- Create: `lib/constants.ts`
- Create: `components/Header.tsx`
- Test: `components/Header.test.tsx`
- Create: `components/Footer.tsx`
- Test: `components/Footer.test.tsx`

**Interfaces:**
- Consumes: `SearchBox` (Task 10).
- Produces: `CATEGORIES` (exported from `lib/constants.ts`) — the 5 fixed categories: `[{ name: 'Cronaca', slug: 'cronaca' }, { name: 'Politica', slug: 'politica' }, { name: 'Cultura', slug: 'cultura' }, { name: 'Sport', slug: 'sport' }, { name: 'Enogastronomia', slug: 'enogastronomia' }]`. `Header()`, `Footer()` both import `CATEGORIES` from `lib/constants.ts` rather than each declaring their own copy — consumed by root layout (Task 12).

- [ ] **Step 1: Create `lib/constants.ts`**

```ts
export const CATEGORIES = [
  { name: 'Cronaca', slug: 'cronaca' },
  { name: 'Politica', slug: 'politica' },
  { name: 'Cultura', slug: 'cultura' },
  { name: 'Sport', slug: 'sport' },
  { name: 'Enogastronomia', slug: 'enogastronomia' },
]
```

- [ ] **Step 2: Write the failing test for `Header`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

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
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run components/Header.test.tsx`
Expected: FAIL — `Header.tsx` does not exist yet.

- [ ] **Step 4: Create `components/Header.tsx`**

```tsx
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/Header.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Write the failing test for `Footer`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders a link for each of the 5 fixed categories', () => {
    render(<Footer />)
    for (const name of ['Cronaca', 'Politica', 'Cultura', 'Sport', 'Enogastronomia']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('renders the current year in the copyright line', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run components/Footer.test.tsx`
Expected: FAIL — `Footer.tsx` does not exist yet.

- [ ] **Step 8: Create `components/Footer.tsx`**

```tsx
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
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run components/Footer.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 10: Commit**

```bash
git add lib/constants.ts components/Header.tsx components/Header.test.tsx components/Footer.tsx components/Footer.test.tsx
git commit -m "feat: add Header and Footer components"
```

---

### Task 12: Root layout with fonts, Header, and Footer

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `Header` and `Footer` (Task 11).
- Produces: page shell (fonts as CSS variables `--font-fraunces`, `--font-inter` consumed by `tailwind.config.ts` from Task 1) wrapping every route.

- [ ] **Step 1: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'I Fatti di Cosenza', template: '%s | I Fatti di Cosenza' },
  description: 'Notizie di cronaca, politica, cultura, sport ed enogastronomia da Cosenza.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans text-neutral-900">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`
Expected: page shows header with site name + 5 category links + search box, and footer with the same links and current year. Headings render in the Fraunces serif font (check via browser dev tools computed font-family).

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire fonts, Header, and Footer into root layout"
```

---

### Task 13: Homepage — hero + category sections

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getAllCategories`, `getFeaturedArticles`, `getCategoryArticles` (Task 5), `Hero` (Task 9), `ArticleCard` (Task 8).
- Produces: `/` route with ISR (`revalidate = 3600`, refreshed sooner by the webhook in Task 18).

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
import Link from 'next/link'
import { getAllCategories, getCategoryArticles, getFeaturedArticles } from '@/lib/sanity/queries'
import { Hero } from '@/components/Hero'
import { ArticleCard } from '@/components/ArticleCard'

export const revalidate = 3600

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getAllCategories(), getFeaturedArticles(2)])

  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await getCategoryArticles(category.slug, 1, 4),
    }))
  )

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {featured[0] && (
        <div className="mb-12">
          <Hero article={featured[0]} />
        </div>
      )}

      {sections.map(({ category, articles }) =>
        articles.length > 0 ? (
          <section key={category._id} className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">{category.name}</h2>
              <Link href={`/${category.slug}`} className="text-sm font-semibold underline">
                Vedi tutti
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </main>
  )
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`
Expected: with at least one `featured` article and a few articles per category published in Sanity Studio (`/studio`), the homepage shows the hero followed by one section per category with real content. With no data yet, confirm the page renders without crashing (empty sections are simply omitted).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build homepage with hero and category sections"
```

---

### Task 14: Category listing page with pagination

**Files:**
- Create: `app/[category]/page.tsx`

**Interfaces:**
- Consumes: `getAllCategories`, `getCategoryArticles` (Task 5), `ArticleCard` (Task 8).
- Produces: `/[category]` route, static params from `getAllCategories()`, `?page=` query param for pagination, ISR `revalidate = 3600`.

- [ ] **Step 1: Create `app/[category]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllCategories, getCategoryArticles } from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/ArticleCard'

export const revalidate = 3600
const PAGE_SIZE = 12

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categories = await getAllCategories()
  const category = categories.find((item) => item.slug === params.category)
  if (!category) return {}
  return { title: category.name, description: `Ultime notizie di ${category.name} da Cosenza.` }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string }
  searchParams: { page?: string }
}) {
  const categories = await getAllCategories()
  const category = categories.find((item) => item.slug === params.category)
  if (!category) notFound()

  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1
  const articles = await getCategoryArticles(category.slug, page, PAGE_SIZE)

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">{category.name}</h1>
      {articles.length === 0 ? (
        <p className="text-neutral-500">Nessun articolo trovato.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-between text-sm font-semibold">
        {page > 1 && <a href={`/${category.slug}?page=${page - 1}`}>← Pagina precedente</a>}
        {articles.length === PAGE_SIZE && (
          <a href={`/${category.slug}?page=${page + 1}`} className="ml-auto">
            Pagina successiva →
          </a>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/cronaca` (or another real category slug from Studio)
Expected: page title shows category name, grid shows up to 12 articles for that category, "Pagina successiva" appears only when a 13th article exists, visiting a non-existent category slug (e.g. `/inesistente`) renders the Next.js 404 page.

- [ ] **Step 3: Commit**

```bash
git add "app/[category]/page.tsx"
git commit -m "feat: add category listing page with pagination"
```

---

### Task 15: Article detail page with JSON-LD

**Files:**
- Create: `app/articolo/[slug]/page.tsx`
- Create: `components/PortableTextRenderer.tsx`

**Interfaces:**
- Consumes: `getArticleBySlug` (Task 5), `getCategoryArticles` (Task 5, for related articles), `urlForImage` (Task 4), `formatDate` (Task 6), `ArticleCard` (Task 8).
- Produces: `/articolo/[slug]` route with `generateMetadata` (OG tags) and JSON-LD `Article` schema, ISR `revalidate = 3600`.

- [ ] **Step 1: Create `components/PortableTextRenderer.tsx`**

```tsx
import { PortableText, type PortableTextBlock } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity/image'

export function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="prose prose-neutral max-w-none">
      <PortableText
        value={value}
        components={{
          types: {
            image: ({ value: imageValue }) => (
              <Image
                src={urlForImage(imageValue).width(1200).url()}
                alt={imageValue.alt || ''}
                width={1200}
                height={675}
                className="rounded-lg"
              />
            ),
          },
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create `app/articolo/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticleBySlug, getCategoryArticles } from '@/lib/sanity/queries'
import { urlForImage } from '@/lib/sanity/image'
import { formatDate } from '@/lib/utils/date'
import { CategoryBadge } from '@/components/CategoryBadge'
import { ArticleCard } from '@/components/ArticleCard'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return {}
  const imageUrl = urlForImage(article.coverImage).width(1200).height(630).url()
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, images: [imageUrl] },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)
  if (!article) notFound()

  const related = (await getCategoryArticles(article.category.slug, 1, 4)).filter((item) => item._id !== article._id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [urlForImage(article.coverImage).width(1200).height(630).url()],
    datePublished: article.publishedAt,
    author: [{ '@type': 'Person', name: article.author.name }],
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CategoryBadge name={article.category.name} accentColor={article.category.accentColor} />
      <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{article.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {article.author.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <div className="mt-8">
        <PortableTextRenderer value={article.body} />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl font-bold">Articoli correlati</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.slice(0, 3).map((item) => (
              <ArticleCard key={item._id} article={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open a real article URL (e.g. `http://localhost:3000/articolo/<slug-from-studio>`)
Expected: title, author, date, body (with any inline images), and up to 3 related articles from the same category render. View page source and confirm a `<script type="application/ld+json">` tag with `headline` matching the title is present. Visiting a non-existent slug renders the 404 page.

- [ ] **Step 4: Commit**

```bash
git add "app/articolo/[slug]/page.tsx" components/PortableTextRenderer.tsx
git commit -m "feat: add article detail page with Portable Text and JSON-LD"
```

---

### Task 16: Search page

**Files:**
- Create: `app/cerca/page.tsx`

**Interfaces:**
- Consumes: `searchArticles` (Task 5), `ArticleCard` (Task 8), `buildSearchHref` convention from `SearchBox` (Task 10) for the `?q=` param name.
- Produces: `/cerca?q=` route (dynamic, not statically generated — search results always fetched fresh).

- [ ] **Step 1: Create `app/cerca/page.tsx`**

```tsx
import { searchArticles } from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/ArticleCard'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const term = searchParams.q?.trim() || ''
  const articles = term ? await searchArticles(term) : []

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">
        {term ? `Risultati per "${term}"` : 'Cerca notizie'}
      </h1>
      {term && articles.length === 0 && <p className="text-neutral-500">Nessun articolo trovato.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, use the header search box to submit a term that matches a published article's title
Expected: redirected to `/cerca?q=<term>` showing matching articles; a term with no matches shows "Nessun articolo trovato."; visiting `/cerca` with no query shows the "Cerca notizie" empty state.

- [ ] **Step 3: Commit**

```bash
git add "app/cerca/page.tsx"
git commit -m "feat: add full-text search page"
```

---

### Task 17: Sitemap and robots.txt

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

**Interfaces:**
- Consumes: `getAllCategories` (Task 5), `client` (Task 4, for a lightweight all-slugs query).
- Produces: `GET /sitemap.xml`, `GET /robots.txt` (Next.js file-convention routes).

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { getAllCategories } from '@/lib/sanity/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const categories = await getAllCategories()
  const articleSlugs: { slug: string; publishedAt: string }[] = await client.fetch(
    `*[_type == "article"]{ "slug": slug.current, publishedAt }`
  )

  return [
    { url: siteUrl, lastModified: new Date() },
    ...categories.map((category) => ({ url: `${siteUrl}/${category.slug}`, lastModified: new Date() })),
    ...articleSlugs.map((article) => ({
      url: `${siteUrl}/articolo/${article.slug}`,
      lastModified: new Date(article.publishedAt),
    })),
  ]
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/studio' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/sitemap.xml` and `http://localhost:3000/robots.txt`
Expected: sitemap XML lists the homepage, each category URL, and each published article URL; robots.txt allows `/` and disallows `/studio`, and references the sitemap.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add sitemap and robots.txt"
```

---

### Task 18: Revalidation webhook (TDD)

**Files:**
- Create: `app/api/revalidate/route.ts`
- Test: `app/api/revalidate/route.test.ts`

**Interfaces:**
- Consumes: `SANITY_REVALIDATE_SECRET` env var.
- Produces: `POST /api/revalidate?secret=...` — configured as the endpoint URL in the Sanity webhook (manual step below) so publishing an article refreshes the homepage, its category page, and its own page.

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const revalidatePathMock = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

beforeEach(() => {
  revalidatePathMock.mockClear()
  process.env.SANITY_REVALIDATE_SECRET = 'test-secret'
})

describe('POST /api/revalidate', () => {
  it('rejects requests with a missing or wrong secret', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/revalidate?secret=wrong', {
      method: 'POST',
      body: JSON.stringify({ _type: 'article', slug: { current: 'test' } }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('revalidates the homepage, category, and article path for an article payload', async () => {
    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/revalidate?secret=test-secret', {
      method: 'POST',
      body: JSON.stringify({ _type: 'article', slug: { current: 'test-slug' }, categorySlug: 'cronaca' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(revalidatePathMock).toHaveBeenCalledWith('/')
    expect(revalidatePathMock).toHaveBeenCalledWith('/articolo/test-slug')
    expect(revalidatePathMock).toHaveBeenCalledWith('/cronaca')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/revalidate/route.test.ts`
Expected: FAIL — `route.ts` does not exist yet.

- [ ] **Step 3: Create `app/api/revalidate/route.ts`**

```ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

interface WebhookPayload {
  _type: string
  slug?: { current: string }
  categorySlug?: string
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body: WebhookPayload = await request.json()

  if (body._type === 'article') {
    revalidatePath('/')
    if (body.slug?.current) revalidatePath(`/articolo/${body.slug.current}`)
    if (body.categorySlug) revalidatePath(`/${body.categorySlug}`)
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/revalidate/route.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Manual prerequisite — configure the Sanity webhook yourself**

In https://www.sanity.io/manage → your project → API → Webhooks, create a webhook: URL `https://<your-deployed-domain>/api/revalidate?secret=<value of SANITY_REVALIDATE_SECRET>`, trigger on Create/Update/Delete for the `article` document type, and include a projection `{ "categorySlug": category->slug.current }` merged into the payload so `body.categorySlug` is populated. This step needs your Sanity login and can only be done by you in the Sanity dashboard.

- [ ] **Step 6: Commit**

```bash
git add app/api/revalidate
git commit -m "feat: add Sanity revalidation webhook endpoint"
```

---

### Task 19: Environment docs and deployment readme

**Files:**
- Create: `.env.example`
- Create: `README.md`

**Interfaces:**
- Produces: documented list of required env vars for local dev and Vercel deployment.

- [ ] **Step 1: Create `.env.example`**

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SANITY_REVALIDATE_SECRET=
```

- [ ] **Step 2: Create `README.md`**

```markdown
# I Fatti di Cosenza

Sito di notizie su Cosenza (cronaca, politica, cultura, sport, enogastronomia) — Next.js 14 + Sanity.

## Sviluppo locale

1. `npm install`
2. Copia `.env.example` in `.env.local` e compila i valori (progetto Sanity da https://www.sanity.io/manage).
3. `npm run dev` — sito su http://localhost:3000, Studio su http://localhost:3000/studio
4. `npm test` — esegue i test Vitest

## Deploy su Vercel

1. Importa la repository su https://vercel.com/new
2. Aggiungi le stesse variabili di `.env.example` nelle Environment Variables del progetto Vercel (`NEXT_PUBLIC_SITE_URL` con l'URL di produzione)
3. Deploy
4. Configura il webhook di revalidation su Sanity (vedi Task 18 del piano di implementazione) puntando a `https://<dominio-produzione>/api/revalidate?secret=...`
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add environment variable reference and README"
```
