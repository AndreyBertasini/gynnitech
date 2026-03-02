/**
 * Payload CMS REST API client for Astro (build-time fetching).
 *
 * Usage:
 *   import { payload } from '@/lib/payload/client'
 *   const lessons = await payload.getLessons({ module: 'analisi-prodotto' })
 *   const lesson  = await payload.getLessonBySlug('analisi-coorte')
 *   const posts   = await payload.getPosts()
 *   const page    = await payload.getPageBySlug('home')
 */

const BASE_URL = import.meta.env.PAYLOAD_URL ?? 'http://localhost:3001'
const API = `${BASE_URL}/api`

// ─── Types (lightweight, expand as needed) ────────────────────────────────────

export type LessonStatus = 'draft' | 'published' | 'archived'

export type Lesson = {
  id: string
  title: string
  slug: string
  module: string
  order: number
  description?: string
  content: unknown // Lexical rich text JSON
  status: LessonStatus
  qualityFlag?: 'ok' | 'incomplete' | 'stub'
  wordCount?: number
  updatedAt: string
  createdAt: string
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: unknown
  publishedDate?: string
  tags?: { tag: string }[]
  status: 'draft' | 'published'
  updatedAt: string
  createdAt: string
}

export type Page = {
  id: string
  title: string
  slug: string
  hero?: {
    headline?: string
    subheadline?: string
    ctaLabel?: string
    ctaUrl?: string
    image?: { url: string; alt: string }
  }
  sections?: unknown[]
  seo?: { metaTitle?: string; metaDescription?: string }
  status: 'draft' | 'published'
  updatedAt: string
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function fetchPayload<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${API}${endpoint}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Payload API error: ${res.status} ${res.statusText} — ${url}`)
  }

  return res.json() as T
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

async function getLessons(opts?: {
  module?: string
  status?: LessonStatus
  limit?: number
}): Promise<Lesson[]> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 200),
    sort: 'order',
  }

  if (opts?.module) {
    params['where[module][equals]'] = opts.module
  }

  params['where[status][equals]'] = opts?.status ?? 'published'

  const data = await fetchPayload<{ docs: Lesson[] }>('/lessons', params)
  return data.docs
}

async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const data = await fetchPayload<{ docs: Lesson[] }>('/lessons', {
    'where[slug][equals]': slug,
    limit: '1',
    depth: '2',
  })
  return data.docs[0] ?? null
}

// ─── Posts ────────────────────────────────────────────────────────────────────

async function getPosts(opts?: { limit?: number }): Promise<Post[]> {
  const data = await fetchPayload<{ docs: Post[] }>('/posts', {
    'where[status][equals]': 'published',
    sort: '-publishedDate',
    limit: String(opts?.limit ?? 50),
  })
  return data.docs
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await fetchPayload<{ docs: Post[] }>('/posts', {
    'where[slug][equals]': slug,
    limit: '1',
    depth: '2',
  })
  return data.docs[0] ?? null
}

// ─── Pages ────────────────────────────────────────────────────────────────────

async function getPageBySlug(slug: string): Promise<Page | null> {
  const data = await fetchPayload<{ docs: Page[] }>('/pages', {
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
    limit: '1',
    depth: '2',
  })
  return data.docs[0] ?? null
}

// ─── Exported client ─────────────────────────────────────────────────────────

export const payload = {
  getLessons,
  getLessonBySlug,
  getPosts,
  getPostBySlug,
  getPageBySlug,
}
