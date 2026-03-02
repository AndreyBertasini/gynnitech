import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: 'Immagini e file per il corso e il blog (storage su Cloudflare R2)',
  },
  upload: {
    // staticDir rimosso: R2 gestisce lo storage tramite il plugin in payload.config.ts
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 432,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1280,
        height: 720,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Testo alternativo (alt)',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Didascalia',
    },
  ],
}
