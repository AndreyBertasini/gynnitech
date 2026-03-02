import type { CollectionConfig } from 'payload'
import { triggerCloudflareRebuild } from '../hooks/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    description: 'Articoli del blog GinnyTech',
    defaultColumns: ['title', 'publishedDate', 'status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 3000,
      },
    },
  },
  hooks: {
    afterChange: [triggerCloudflareRebuild],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titolo articolo',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug URL',
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Estratto (preview)',
      admin: {
        description: 'Breve descrizione per lista blog e SEO (max 200 caratteri)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Immagine di copertina',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Contenuto articolo',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Data pubblicazione',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tag',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Stato',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Bozza', value: 'draft' },
        { label: 'Pubblicato', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
