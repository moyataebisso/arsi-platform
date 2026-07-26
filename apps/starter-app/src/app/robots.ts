import type { MetadataRoute } from 'next'

// Per-tenant robots.txt. NEXT_PUBLIC_SITE_URL is set per Vercel project so
// each tenant's sitemap URL points at their own canonical host.
const DEFAULT_BASE_URL = 'https://example.com'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
