import type { MetadataRoute } from 'next'
import { siteConfig } from '@config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.siteUrl

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  const pageRoutes: Record<string, string> = {
    about: '/about',
    services: '/services',
    contact: '/contact',
    shop: '/shop',
    book: '/book',
    blog: '/blog',
    events: '/events',
    reviews: '/reviews',
    gallery: '/gallery',
    faq: '/faq',
  }

  for (const [key, path] of Object.entries(pageRoutes)) {
    const page = siteConfig.pages[key as keyof typeof siteConfig.pages]
    if (page?.enabled) {
      routes.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  return routes
}
