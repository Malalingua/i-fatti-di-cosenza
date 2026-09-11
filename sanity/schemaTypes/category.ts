import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Categoria',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (rule) => rule.required() }),
    defineField({
      name: 'accentColor',
      title: 'Colore accento',
      type: 'string',
      description: 'Codice colore esadecimale, es. #C81E2D',
      validation: (rule) => rule.required().regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
    }),
  ],
})
