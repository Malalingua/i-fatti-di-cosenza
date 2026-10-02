import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { GA_MEASUREMENT_ID } from '@/lib/consent'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <CookieConsent gaId={process.env.VERCEL_ENV === 'production' ? GA_MEASUREMENT_ID : null} />
    </>
  )
}
