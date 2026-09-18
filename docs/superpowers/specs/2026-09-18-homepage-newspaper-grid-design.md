# Homepage griglia-giornale — Design

## Obiettivo
Sostituire l'attuale homepage (hero grande + righe orizzontali per categoria) con un layout ispirato alle prime pagine di quotidiano — testata con data, titolo principale in evidenza, griglia compatta di box per le altre categorie.

## Scope
- Header (`components/Header.tsx`): aggiunta barra data, visibile su **tutte** le pagine del sito.
- Homepage (`app/(site)/page.tsx`): nuovo layout a griglia.
- **Non toccato**: pagina categoria, pagina articolo, ricerca, Studio.

## Testata (Header)
Nuova riga sottile sopra il logo esistente, con la data odierna in italiano nel formato "Martedì 15 settembre 2026" (giorno della settimana + giorno + mese + anno, prima lettera maiuscola). Sotto resta invariato: logo + nav 5 categorie + casella ricerca.

Nuova utility in `lib/utils/date.ts`: `formatMastheadDate(date: Date): string`, usa `Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })` e capitalizza la prima lettera (l'output nativo del locale it-IT è minuscolo).

Nota: la data riflette il momento di generazione della pagina (ISR), non l'istante esatto di visita — accettabile, è un elemento decorativo di stile "quotidiano", non un dato funzionale.

## Homepage — griglia
`app/(site)/page.tsx` cambia fetch e markup:

- **Fetch**: `getFeaturedArticles(1)` per il titolone; `getAllCategories()`; per ogni categoria **diversa** da quella del titolone, `getCategoryArticles(slug, 1, 1)` per il suo articolo più recente.
- **Markup**: contenitore CSS grid (Tailwind `grid`). Il titolone occupa 2 colonne × 2 righe su desktop (immagine + titolo grande + data), 1 colonna intera su mobile. Ogni categoria con almeno un articolo produce una cella compatta nella stessa griglia (badge colore categoria + titolo + data, senza immagine). Categorie senza articoli: nessuna cella — l'auto-flow della griglia CSS si ricompatta da solo, mai spazi vuoti.
- **Fallback**: se non esiste nessun articolo con `featured = true`, il primo articolo disponibile (qualunque categoria) diventa il titolone — la homepage non resta mai senza blocco principale.

## Componenti

- `components/Header.tsx` — **modificato**: aggiunge la riga data sopra il logo, usando `formatMastheadDate`.
- `components/Hero.tsx` — **modificato in place** (non un nuovo componente): il layout cambia da immagine full-bleed con overlay a immagine + titolo visibile sotto (coerente con lo stile "titolone di prima pagina" scelto). Resta l'unico consumatore di questo componente (solo la homepage), quindi si modifica direttamente invece di aggiungerne uno parallelo.
- `components/BriefCard.tsx` — **nuovo**: box compatto categoria + titolo + data, senza immagine. Diverso a sufficienza da `ArticleCard` (che include sempre immagine ed excerpt) da giustificare un componente proprio, coerente con la granularità già usata nel progetto (es. `CategoryBadge` come pezzo a parte).

## Fuori scope
Pagine categoria/articolo/ricerca, Studio, contrasto testo su badge colore arbitrario (minor già noto e non correlato).
