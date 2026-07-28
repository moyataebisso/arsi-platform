import type { MetadataRoute } from 'next'
import { resolveBaseUrl } from '@/lib/site-url'
import { getEnabledModules, type EnabledModules } from '@/lib/enabled-modules'

export const dynamic = 'force-dynamic'

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface RouteEntry {
  path: string
  priority: number
  changeFrequency: ChangeFrequency
}

const ALWAYS_PAGES: RouteEntry[] = [
  { path: '/',         priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/about',    priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/contact',  priority: 0.9, changeFrequency: 'monthly' },
]

interface FlagGatedRoute extends RouteEntry {
  flag: keyof EnabledModules
}

const FLAG_GATED_PAGES: FlagGatedRoute[] = [
  { flag: 'why_choose_us',  path: '/why-choose-us', priority: 0.7, changeFrequency: 'monthly' },
  { flag: 'referrals',      path: '/referrals',     priority: 0.8, changeFrequency: 'monthly' },
  { flag: 'jobs',           path: '/jobs',          priority: 0.7, changeFrequency: 'monthly' },
  { flag: 'our_homes',      path: '/our-homes',     priority: 0.7, changeFrequency: 'monthly' },
  { flag: 'resources_page', path: '/resources',     priority: 0.7, changeFrequency: 'monthly' },
  { flag: 'order_online',   path: '/order',         priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'drinks',         path: '/drinks',        priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'parties',        path: '/parties',       priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'catering',       path: '/catering',      priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'ecommerce',      path: '/shop',          priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'booking',        path: '/book',          priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'blog',           path: '/blog',          priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'events',         path: '/events',        priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'reviews',        path: '/reviews',       priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'gallery',        path: '/gallery',       priority: 0.6, changeFrequency: 'weekly'  },
  { flag: 'faq',            path: '/faq',           priority: 0.6, changeFrequency: 'weekly'  },
]

// MN 144G / 245D routes. Only appear when the tenant flips
// license_separated_nav on. When they do, /our-homes is removed below so the
// sitemap does not point crawlers at the un-scoped homes page.
const LICENSE_SEPARATED_PAGES: RouteEntry[] = [
  { path: '/assisted-living',          priority: 0.8, changeFrequency: 'monthly' },
  { path: '/assisted-living/homes',    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/assisted-living/services', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/hcbs',                     priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hcbs/homes',               priority: 0.7, changeFrequency: 'monthly' },
  { path: '/hcbs/services',            priority: 0.7, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveBaseUrl()
  const enabled = await getEnabledModules()
  const now = new Date()

  const routes: MetadataRoute.Sitemap = ALWAYS_PAGES.map((p) => ({
    url: `${baseUrl}${p.path === '/' ? '' : p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  for (const r of FLAG_GATED_PAGES) {
    // Suppress /our-homes when the tenant has opted into license-separated nav;
    // the license-scoped /assisted-living/homes and /hcbs/homes replace it.
    if (r.flag === 'our_homes' && enabled.license_separated_nav) continue
    if (enabled[r.flag]) {
      routes.push({
        url: `${baseUrl}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      })
    }
  }

  if (enabled.license_separated_nav) {
    for (const p of LICENSE_SEPARATED_PAGES) {
      routes.push({
        url: `${baseUrl}${p.path}`,
        lastModified: now,
        changeFrequency: p.changeFrequency,
        priority: p.priority,
      })
    }
  }

  return routes
}
