import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

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
      <body className="min-h-screen font-sans text-neutral-900">{children}</body>
    </html>
  )
}
