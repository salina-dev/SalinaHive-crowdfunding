import type { NextConfig } from 'next'

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src * data: blob:",
  "connect-src 'self' https: wss:",
  "font-src 'self' https: data:",
  "frame-ancestors 'self'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
}

export default nextConfig
