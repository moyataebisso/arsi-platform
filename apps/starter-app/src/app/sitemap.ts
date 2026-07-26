import type { MetadataRoute } from 'next'
import { siteConfig } from '@config'

// Per-tenant sitemap. The base URL comes from NEXT_PUBLIC_SITE_URL (set per
// Vercel project) so every tenant emits its own canonical URLs. Fallback is
// a neutral placeholder — tenants without NEXT_PUBLIC_SITE_URL get an
// obviously-wrong sitemap rather than one silently pointing at another tenant.
const DEFAULT_BASE_URL = 'https://example.com'

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface CorePage {
  path: string
  priority: number
  changeFrequency: ChangeFrequency
}

const CORE_PAGES: CorePage[] = [
  { path: '/',              priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/about',         priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services',      priority: 0.9, changeFrequency: 'monthly' },
  { path: '/why-choose-us', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/referrals',     priority: 0.8, changeFrequency: 'monthly' },
  { path: '/jobs',          priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact',       priority: 0.9, changeFrequency: 'monthly' },
]

// Ecommerce / content pages — only included when the tenant has them enabled
// in siteConfig.pages. Adama and Entrusted keep their existing coverage here.
const OPTIONAL_PAGES: Array<[keyof typeof siteConfig.pages, string]> = [
  ['shop',    '/shop'],
  ['book',    '/book'],
  ['blog',    '/blog'],
  ['events',  '/events'],
  ['reviews', '/reviews'],
  ['gallery', '/gallery'],
  ['faq',     '/faq'],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL
  const now = new Date()

  const routes: MetadataRoute.Sitemap = CORE_PAGES.map((p) => ({
    url: `${baseUrl}${p.path === '/' ? '' : p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  for (const [key, path] of OPTIONAL_PAGES) {
    if (siteConfig.pages[key]?.enabled) {
      routes.push({
        url: `${baseUrl}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  return routes
}
