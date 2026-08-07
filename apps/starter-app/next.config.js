/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  transpilePackages: ['@arsi/shared-ui', '@arsi/db', '@arsi/email'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    const HOSTS = [
      'entrustedcareresidence.org',
      'www.entrustedcareresidence.org',
    ];

    const legacy = [
      ['/contact-us', '/contact'],
      ['/our-homes',  '/assisted-living/homes'],
    ];

    return HOSTS.flatMap((host) =>
      legacy.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
        has: [{ type: 'host', value: host }],
      }))
    );
  },
}

module.exports = nextConfig
