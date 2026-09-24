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
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              defineField({
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    description: 'Assoluto (https://...) per link esterni, relativo (/articolo/slug) per link interni.',
                    validation: (rule) =>
                      rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
                  }),
                ],
              }),
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Testo alternativo', type: 'string' })],
        },
        defineField({
          name: 'videoEmbed',
          title: 'Video (link YouTube o Vimeo)',
          type: 'object',
          fields: [
            defineField({
              name: 'url',
              title: 'URL video',
              type: 'url',
              description: 'Incolla il link YouTube o Vimeo del video.',
              validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
            }),
          ],
          preview: { select: { subtitle: 'url' }, prepare: ({ subtitle }) => ({ title: 'Video', subtitle }) },
        }),
        defineField({
          name: 'videoFile',
          title: 'Video (file caricato)',
          type: 'file',
          options: { accept: 'video/*' },
          fields: [defineField({ name: 'caption', title: 'Didascalia', type: 'string' })],
        }),
      ],
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
      description:
        'Per programmare l’uscita imposta una data futura e premi Pubblica: l’articolo apparirà sul sito da quell’ora (entro 5 minuti).',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'featured', title: 'In evidenza', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', publishedAt: 'publishedAt', category: 'category.name' },
    prepare: ({ title, media, publishedAt, category }) => {
      const scheduled = publishedAt && new Date(publishedAt) > new Date()
      const when = publishedAt
        ? new Date(publishedAt).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Rome' })
        : ''
      return { title, media, subtitle: scheduled ? `Programmato per ${when}` : category }
    },
  },
})
