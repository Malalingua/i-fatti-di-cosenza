import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, baseOpenGraph, DEFAULT_OG_IMAGE } from '@/lib/seo'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { ...baseOpenGraph, title: SITE_TITLE, description: SITE_DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE.url] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans text-neutral-900">{children}</body>
    </html>
  )
}
