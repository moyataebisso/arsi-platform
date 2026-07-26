import type { MetadataRoute } from 'next'
import { resolveBaseUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl()
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
