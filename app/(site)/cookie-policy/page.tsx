import type { Metadata } from 'next'
import { CookiePreferencesLink } from '@/components/CookieConsent'
import { MASTHEAD } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Cookie policy',
  description: 'Quali cookie usa Malalingua.blog e come gestire il consenso.',
  path: '/cookie-policy',
})

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 leading-relaxed text-black">
      <h1 className="font-display text-4xl font-bold">Cookie policy</h1>
      <p className="mt-2 text-sm text-neutral-900">Ultimo aggiornamento: 2 ottobre 2026</p>

      <h2 className="mt-8 font-display text-2xl font-bold">Chi gestisce il sito</h2>
      <p className="mt-2">
        Malalingua.blog, {MASTHEAD.address}. Per qualsiasi richiesta sui dati:{' '}
        <a href={`mailto:${MASTHEAD.email}`} className="text-[#d42a1c] underline">
          {MASTHEAD.email}
        </a>
        .
      </p>

      <h2 className="mt-8 font-display text-2xl font-bold">Cosa sono i cookie</h2>
      <p className="mt-2">
        Sono piccoli file che il sito salva nel tuo browser per ricordare informazioni durante e tra le visite.
      </p>

      <h2 className="mt-8 font-display text-2xl font-bold">Cookie tecnici</h2>
      <p className="mt-2">
        Il sito ricorda la tua scelta sul banner dei cookie nella memoria del browser, così non te la chiede a ogni
        pagina. È necessaria al funzionamento e non richiede consenso. Non usiamo cookie di profilazione o pubblicitari.
      </p>

      <h2 className="mt-8 font-display text-2xl font-bold">Cookie statistici: Google Analytics 4</h2>
      <p className="mt-2">
        Solo se premi <strong>Accetta</strong> usiamo Google Analytics 4, fornito da Google Ireland Limited, per sapere
        in forma aggregata quante persone leggono il sito, quali articoli e da quale dispositivo. Se rifiuti, Google
        Analytics non viene caricato.
      </p>
      <ul className="mt-2 list-disc pl-6">
        <li>
          Cookie <code>_ga</code> e <code>_ga_*</code>: distinguono i visitatori in modo anonimo; durata massima 2
          anni.
        </li>
        <li>Google Analytics 4 non registra né conserva l’indirizzo IP completo.</li>
        <li>
          I dati possono essere trattati da Google anche negli Stati Uniti, nel quadro dell’EU-US Data Privacy
          Framework.
        </li>
      </ul>
      <p className="mt-2">
        Informativa di Google:{' '}
        <a
          href="https://policies.google.com/privacy?hl=it"
          className="text-[#d42a1c] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/privacy
        </a>
        .
      </p>

      <h2 className="mt-8 font-display text-2xl font-bold">Cambiare idea</h2>
      <p className="mt-2">
        Puoi modificare la tua scelta in qualsiasi momento:{' '}
        <CookiePreferencesLink className="text-[#d42a1c] underline" />. Puoi anche cancellare i cookie dalle
        impostazioni del tuo browser.
      </p>

      <h2 className="mt-8 font-display text-2xl font-bold">I tuoi diritti</h2>
      <p className="mt-2">
        Puoi chiedere accesso, cancellazione o opporti al trattamento scrivendo all’indirizzo sopra, e puoi presentare
        reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).
      </p>
    </main>
  )
}
