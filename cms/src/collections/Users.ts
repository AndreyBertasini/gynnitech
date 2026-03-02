import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'Amministratori del CMS GinnyTech',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nome',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Ruolo',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
