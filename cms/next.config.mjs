import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Keep @libsql/* as external so @opennextjs/cloudflare copies the full package.
  // This ensures the workerd-compatible `web.js` / `web.mjs` entry points are available.
  // NOTE: @libsql/isomorphic-ws/node.mjs is patched to web.mjs in deploy-cms.yml
  // to avoid the worker_threads.MessagePort error on Cloudflare Workers.
  serverExternalPackages: [
    '@vercel/og',
    '@libsql/client',
    '@libsql/core',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
  ],
}

export default withPayload(nextConfig)
