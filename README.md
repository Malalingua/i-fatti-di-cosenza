# I Fatti di Cosenza

Sito di notizie su Cosenza (cronaca, politica, cultura, sport, enogastronomia) — Next.js 14 + Sanity.

## Sviluppo locale

1. `npm install`
2. Copia `.env.example` in `.env.local` e compila i valori (progetto Sanity da https://www.sanity.io/manage).
3. Avvia lo Studio (`npm run dev` e poi vai su `/studio`) e crea 5 documenti categoria con esattamente questi slug: `cronaca`, `politica`, `cultura`, `sport`, `enogastronomia` (nomi: Cronaca, Politica, Cultura, Sport, Enogastronomia) — la navigazione di header e footer è cablata su questi slug e restituirà 404 se non corrispondono.
4. `npm run dev` — sito su http://localhost:3000, Studio su http://localhost:3000/studio
5. `npm test` — esegue i test Vitest

## Deploy su Vercel

1. Importa la repository su https://vercel.com/new
2. Aggiungi le stesse variabili di `.env.example` nelle Environment Variables del progetto Vercel (`NEXT_PUBLIC_SITE_URL` con l'URL di produzione)
3. Deploy
4. Configura il webhook di revalidation su Sanity (vedi Task 18 del piano di implementazione) puntando a `https://<dominio-produzione>/api/revalidate?secret=...`
