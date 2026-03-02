import type { CollectionConfig } from 'payload'
import { triggerCloudflareRebuild } from '../hooks/revalidate'

// Matches the 13 modules in src/data/course-modules.ts
const MODULE_OPTIONS = [
  { label: '01 — Fondamenti di Marketing Data', value: 'fondamenti-marketing-data' },
  { label: '02 — Metriche e KPI Fondamentali', value: 'metriche-fondamenti' },
  { label: '03 — Analisi del Prodotto', value: 'analisi-prodotto' },
  { label: '04 — Analisi delle Campagne', value: 'analisi-campagne' },
  { label: '05 — Customer Analytics', value: 'customer-analytics' },
  { label: '06 — Dashboard e Visualizzazione', value: 'dashboard-visualizzazione' },
  { label: '07 — Data Collection e Tag Management', value: 'data-collection' },
  { label: '08 — Marketing Attribution', value: 'marketing-attribution' },
  { label: '09 — Gestione Data-Driven', value: 'gestione-data-driven' },
  { label: '10 — Real-Time Analytics', value: 'real-time-analytics' },
  { label: '11 — Marketing Data Science', value: 'marketing-data-science' },
  { label: '12 — Privacy e Compliance', value: 'privacy-compliance' },
  { label: '13 — Progetto Finale', value: 'progetto-finale' },
]

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    description: 'Lezioni del corso GinnyTech (Marketing Data & Analytics Engineering)',
    defaultColumns: ['title', 'module', 'order', 'status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 3000, // autosave ogni 3 secondi
      },
    },
  },
  hooks: {
    afterChange: [triggerCloudflareRebuild],
  },
  fields: [
    // ── Informazioni di base ──────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      label: 'Titolo lezione',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug URL',
      required: true,
      unique: true,
      admin: {
        description: 'Es: "analisi-coorte" → /corso/analisi-prodotto/analisi-coorte',
      },
    },
    {
      name: 'module',
      type: 'select',
      label: 'Modulo',
      required: true,
      options: MODULE_OPTIONS,
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordine nel modulo',
      required: true,
      admin: {
        description: 'Numero progressivo della lezione nel modulo (1, 2, 3...)',
      },
    },

    // ── Metadati SEO ──────────────────────────────────────────────
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrizione breve (meta description)',
      admin: {
        description: '150-160 caratteri per SEO ottimale',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Immagine di copertina',
      relationTo: 'media',
    },

    // ── Contenuto principale ──────────────────────────────────────
    {
      name: 'content',
      type: 'richText',
      label: 'Contenuto lezione',
      required: true,
      admin: {
        description: 'Editor Lexical — supporta titoli, liste, codice, tabelle, callout',
      },
    },

    // ── Stato pubblicazione ───────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      label: 'Stato',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Bozza', value: 'draft' },
        { label: 'Pubblicata', value: 'published' },
        { label: 'Archiviata', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ── Qualità e flag interni ────────────────────────────────────
    {
      name: 'qualityFlag',
      type: 'select',
      label: 'Flag qualità',
      defaultValue: 'stub',
      options: [
        { label: '✅ OK (≥3000w, completa)', value: 'ok' },
        { label: '⚠️ Incompleta', value: 'incomplete' },
        { label: '❌ Stub (da scrivere)', value: 'stub' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Usato internamente per tracciare la qualità',
      },
    },
    {
      name: 'wordCount',
      type: 'number',
      label: 'Conteggio parole (approssimativo)',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
