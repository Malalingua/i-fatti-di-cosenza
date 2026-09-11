# I Fatti di Cosenza — Design

## Obiettivo
Sito di notizie online su Cosenza: cronaca, politica, cultura, sport, enogastronomia. Look editoriale moderno, ottimizzato SEO.

## Stack
- Next.js 14 (App Router), TypeScript, React
- Sanity CMS (headless) — multi-redattore con ruoli Editor/Admin nativi di Sanity
- Tailwind CSS
- Rendering: ISR con revalidation on-demand via webhook Sanity → Next.js al momento della pubblicazione
- Hosting: Vercel

## Content model (Sanity)
- **article**: title, slug, excerpt, body (Portable Text con immagini inline), coverImage, category (ref → category), author (ref → author), publishedAt, featured (bool)
- **category**: name, slug, colore accento (cronaca, politica, cultura, sport, enogastronomia)
- **author**: name, photo, bio breve

## Pagine
- `/` — Hero (1-2 articoli featured, foto grande + titolo bold) + 5 sezioni orizzontali per categoria (3-4 card + "vedi tutti")
- `/[categoria]` — Lista articoli categoria, paginata
- `/articolo/[slug]` — Articolo completo: hero image, titolo, autore/data, corpo, correlati stessa categoria
- `/cerca?q=` — Ricerca full-text via GROQ su title/excerpt/body

## Design visivo
Editoriale bold: font display serif per titoli, sans neutro per corpo. Hero full-width con overlay scuro. Card 16:9 con badge categoria colorato. Palette bianco/nero + colore accento per categoria. Header sticky (logo + nav 5 categorie + ricerca), footer con link categorie.

## SEO
- Metadata dinamici per pagina (title/description/OG image da coverImage)
- Sitemap.xml + robots.txt automatici (next-sitemap)
- JSON-LD Article schema
- ISR → HTML pre-renderizzato, crawl veloce

## Fuori scope (post-MVP)
Newsletter attiva, commenti lettori, dark mode.
