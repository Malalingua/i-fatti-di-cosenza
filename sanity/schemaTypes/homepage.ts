import { defineField, defineType } from 'sanity'

const slot = (name: string, title: string) =>
  defineField({ name, title, type: 'reference', to: [{ type: 'article' }], fieldset: 'topBox' })

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fieldsets: [
    {
      name: 'topBox',
      title: 'Box accanto all’articolo in evidenza',
      description: 'Scegli l’articolo per ogni posizione. Le posizioni vuote vengono riempite in automatico.',
      options: { columns: 2 },
    },
  ],
  fields: [
    slot('topLeft', 'In alto a sinistra'),
    slot('topRight', 'In alto a destra'),
    slot('bottomLeft', 'In basso a sinistra'),
    slot('bottomRight', 'In basso a destra'),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
})
