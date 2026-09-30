import { defineField, defineType } from 'sanity'

// Each box in the homepage template belongs to one category, so its picker
// only offers articles from that category.
const slot = (name: string, title: string, categorySlug: string) =>
  defineField({
    name,
    title,
    type: 'reference',
    to: [{ type: 'article' }],
    fieldset: 'boxes',
    options: {
      filter: 'category->slug.current == $categorySlug',
      filterParams: { categorySlug },
    },
  })

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fieldsets: [
    {
      name: 'boxes',
      title: 'Box del template',
      description:
        'Scegli l’articolo per ogni box. I box vuoti mostrano in automatico l’ultimo articolo della categoria. Gli articoli sostituiti scendono in “Titoli del giorno”.',
      options: { columns: 2 },
    },
    {
      name: 'raccolta',
      title: 'Raccolta indifferenziata',
      description: 'Scegli i due articoli di “Le malelingue del web”. Un box vuoto resta vuoto.',
      options: { columns: 2 },
    },
  ],
  fields: [
    defineField({
      name: 'leadTitle',
      title: 'Titolo della barra rossa',
      description: 'Il titolo sopra l’articolo in evidenza. Se vuoto: “Malalingua batte dove la risposta duole”.',
      type: 'string',
    }),
    defineField({
      name: 'lead',
      title: 'Articolo in evidenza',
      description: 'Il box grande “Malalingua batte dove la risposta duole”. Se vuoto, viene usato l’ultimo articolo pubblicato.',
      type: 'reference',
      to: [{ type: 'article' }],
    }),
    slot('topLeft', 'Come campiamo (verde)', 'come-campiamo'),
    slot('topRight', 'Poltrone & potere (blu)', 'poltrone'),
    slot('bottomLeft', 'Carta canta (rosso)', 'carta-canta'),
    slot('bottomRight', 'Tribunali e tribolazioni (marrone)', 'tribunali-e-tribolazioni'),
    defineField({ name: 'raccolta1', title: '01', type: 'reference', to: [{ type: 'article' }], fieldset: 'raccolta' }),
    defineField({ name: 'raccolta2', title: '02', type: 'reference', to: [{ type: 'article' }], fieldset: 'raccolta' }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
})
