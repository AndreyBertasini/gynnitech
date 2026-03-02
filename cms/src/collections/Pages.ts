import type { CollectionConfig } from 'payload'
import { triggerCloudflareRebuild } from '../hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    description: 'Pagine marketing del sito (hero, CTA, sezioni statiche)',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [triggerCloudflareRebuild],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titolo pagina',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug URL',
      required: true,
      unique: true,
      admin: {
        description: 'Es: "home", "chi-siamo", "corso"',
      },
    },

    // ── Hero Section ──────────────────────────────────────────────
    {
      name: 'hero',
      type: 'group',
      label: 'Sezione Hero',
      fields: [
        {
          name: 'headline',
          type: 'text',
          label: 'Titolo principale (H1)',
        },
        {
          name: 'subheadline',
          type: 'textarea',
          label: 'Sottotitolo',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'Testo bottone CTA',
        },
        {
          name: 'ctaUrl',
          type: 'text',
          label: 'URL bottone CTA',
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Immagine hero',
          relationTo: 'media',
        },
      ],
    },

    // ── Sezioni contenuto libero ──────────────────────────────────
    {
      name: 'sections',
      type: 'array',
      label: 'Sezioni pagina',
      fields: [
        {
          name: 'sectionType',
          type: 'select',
          label: 'Tipo sezione',
          options: [
            { label: 'Testo libero', value: 'richtext' },
            { label: 'Features / Benefici', value: 'features' },
            { label: 'FAQ', value: 'faq' },
            { label: 'Testimonial', value: 'testimonial' },
            { label: 'CTA Banner', value: 'cta' },
          ],
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Contenuto sezione',
        },
      ],
    },

    // ── SEO ───────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta title',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta description',
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
        { label: 'Pubblicata', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
