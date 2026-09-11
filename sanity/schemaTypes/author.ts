import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Autore',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'photo', title: 'Foto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', title: 'Bio breve', type: 'text', rows: 3 }),
  ],
})
