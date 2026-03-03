import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // pg uses native TCP/TLS which works on Cloudflare Workers via nodejs_compat
  // Keep it as external so @opennextjs/cloudflare can handle it correctly
  serverExternalPackages: ['@vercel/og'],
}

export default withPayload(nextConfig)
