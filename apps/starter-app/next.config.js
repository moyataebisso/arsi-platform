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
    const ENTRUSTED_HOSTS = [
      'entrustedcareresidence.org',
      'www.entrustedcareresidence.org',
    ];

    const entrustedLegacy = [
      ['/contact-us', '/contact'],
      ['/our-homes',  '/assisted-living/homes'],
    ];

    const entrustedRedirects = ENTRUSTED_HOSTS.flatMap((host) =>
      entrustedLegacy.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
        has: [{ type: 'host', value: host }],
      }))
    );

    // Adama: /services is a leftover from the generic starter — this tenant
    // uses /menu instead. Includes the Vercel preview host because Bing has
    // it indexed and real traffic still hits it; will remain until the host
    // is noindexed in a follow-up.
    const ADAMA_HOSTS = [
      'cimaa-adama-restaurant-177872679701.vercel.app',
      'adamarestaurant.com',
      'www.adamarestaurant.com',
    ];

    const adamaRedirects = ADAMA_HOSTS.map((host) => ({
      source: '/services',
      destination: '/menu',
      permanent: true,
      has: [{ type: 'host', value: host }],
    }));

    return [...entrustedRedirects, ...adamaRedirects];
  },
}

module.exports = nextConfig
