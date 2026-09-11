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
