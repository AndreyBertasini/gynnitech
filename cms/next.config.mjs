import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Keep @libsql/* as external so @opennextjs/cloudflare copies the full package.
  // This ensures the workerd-compatible `web.js` / `web.mjs` entry points are available.
  serverExternalPackages: [
    '@vercel/og',
    '@libsql/client',
    '@libsql/core',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Force @libsql/isomorphic-ws to use the web (native WebSocket) variant.
      // Without this alias, webpack resolves it via the "node" export condition
      // which picks node.mjs → imports `ws` npm package → uses worker_threads.MessagePort
      // which does NOT exist on Cloudflare Workers.
      config.resolve.alias = {
        ...config.resolve.alias,
        '@libsql/isomorphic-ws': path.join(__dirname, 'node_modules/@libsql/isomorphic-ws/web.mjs'),
      }
    }
    return config
  },
}

export default withPayload(nextConfig)
