import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { r2Storage } from '@payloadcms/storage-r2'
import type { R2StorageOptions } from '@payloadcms/storage-r2'
import { getCloudflareContext } from '@opennextjs/cloudflare'

type R2Bucket = R2StorageOptions['bucket']

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Lessons } from './src/collections/Lessons'
import { Posts } from './src/collections/Posts'
import { Pages } from './src/collections/Pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Lazy proxy for the Cloudflare R2 bucket binding.
 * At build time the object is created but no methods are called.
 * At runtime on Cloudflare Workers each call resolves the live R2 binding.
 */
function createR2BucketProxy(): R2Bucket {
  const getReal = (): R2Bucket => {
    const { env } = getCloudflareContext()
    return (env as Record<string, unknown>).R2_MEDIA as R2Bucket
  }
  return {
    createMultipartUpload: (key, options) => getReal().createMultipartUpload(key, options),
    delete: (keys) => getReal().delete(keys),
    get: (key, options) => getReal().get(key, options),
    head: (key) => getReal().head(key),
    list: (options) => getReal().list(options),
    put: (key, value, options) => getReal().put(key, value, options),
    resumeMultipartUpload: (key, uploadId) => getReal().resumeMultipartUpload(key, uploadId),
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— GinnyTech CMS',
    },
  },

  collections: [Users, Media, Lessons, Posts, Pages],

  editor: lexicalEditor({}),

  secret: process.env.PAYLOAD_SECRET || 'change-me-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // ── Database: Turso (SQLite via libsql — compatibile Cloudflare Workers) ──────
  // Local dev: usa file locale ./dev.db
  // Produzione: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
  db: sqliteAdapter({
    client: {
      url: process.env.TURSO_DATABASE_URL || 'file:./dev.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
  }),

  // ── Storage: Cloudflare R2 (binding nativo Workers) ───────────────────────────
  plugins: [
    r2Storage({
      collections: {
        media: true,
      },
      bucket: createR2BucketProxy(),
    }),
  ],

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',

  // Allow Astro (Cloudflare Pages) to fetch from this CMS
  cors: [
    process.env.ASTRO_SITE_URL || 'http://localhost:3000',
    'https://ginnytech.it',
    'https://www.ginnytech.it',
  ],
})
