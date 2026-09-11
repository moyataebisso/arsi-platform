import { unstable_noStore as noStore } from 'next/cache'
import { resolveBaseUrl } from '@/lib/site-url'
import { getEnabledModules, type EnabledModules } from '@/lib/enabled-modules'
import { getSiteSetting } from '@/lib/settings'

// Route handler variant of the previous `app/sitemap.ts` MetadataRoute
// export. Two changes over the MetadataRoute form:
//   1. `noStore()` guarantees the underlying Supabase reads (via
//      getEnabledModules) never get memoized inside a single request.
//   2. Explicit `Cache-Control: no-store` on the response defeats
//      Vercel's edge cache — the previous file convention emitted no
//      cache header, and Vercel was serving a stale sitemap for hours
//      after `enabled_modules.parties` was flipped false in the DB.
// Together they make /sitemap.xml reflect runtime enabled_modules
// changes without a redeploy, per Phase 2 F0.

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

interface RouteEntry {
  path: string
  priority: number
  changeFrequency: ChangeFrequency
}

interface FlagGatedRoute extends RouteEntry {
  flag: keyof EnabledModules
}

const ALWAYS_PAGES: RouteEntry[] = [
  { path: '/',         priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/about',    priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/contact',  priority: 0.9, changeFrequency: 'monthly' },
]

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
  { flag: 'bakery',         path: '/bakery',        priority: 0.6, changeFrequency: 'weekly'  },
]

const LICENSE_SEPARATED_PAGES: RouteEntry[] = [
  { path: '/assisted-living',          priority: 0.8, changeFrequency: 'monthly' },
  { path: '/assisted-living/homes',    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/assisted-living/services', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/hcbs',                     priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hcbs/homes',               priority: 0.7, changeFrequency: 'monthly' },
  { path: '/hcbs/services',            priority: 0.7, changeFrequency: 'monthly' },
]

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(base: string, path: string, iso: string, freq: ChangeFrequency, priority: number): string {
  const loc = xmlEscape(`${base}${path === '/' ? '' : path}`)
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${iso}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`
}

export async function GET() {
  noStore()

  const baseUrl = resolveBaseUrl().replace(/\/$/, '')
  const enabled = await getEnabledModules()
  const iso = new Date().toISOString()

  // /gallery only appears when the tenant has actually seeded gallery_images.
  // enabled_modules.gallery alone is not enough — Adama has it true while the
  // list is empty during rollout, and we don't want crawlers indexing an
  // empty "Gallery coming soon" page.
  let hasGalleryImages = false
  try {
    const raw = await getSiteSetting('gallery_images')
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      hasGalleryImages = Array.isArray(parsed) && parsed.length > 0
    }
  } catch {
    hasGalleryImages = false
  }

  const entries: string[] = []

  for (const p of ALWAYS_PAGES) {
    entries.push(urlEntry(baseUrl, p.path, iso, p.changeFrequency, p.priority))
  }

  for (const r of FLAG_GATED_PAGES) {
    // Suppress /our-homes when the tenant is on license-separated nav; its
    // license-scoped routes replace it.
    if (r.flag === 'our_homes' && enabled.license_separated_nav) continue
    // /gallery needs both the module flag and a non-empty image list.
    if (r.flag === 'gallery' && !hasGalleryImages) continue
    if (enabled[r.flag]) {
      entries.push(urlEntry(baseUrl, r.path, iso, r.changeFrequency, r.priority))
    }
  }

  if (enabled.license_separated_nav) {
    for (const p of LICENSE_SEPARATED_PAGES) {
      entries.push(urlEntry(baseUrl, p.path, iso, p.changeFrequency, p.priority))
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-0.9">\n${entries.join('\n')}\n</urlset>\n`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Defeat Vercel edge cache — the previous MetadataRoute sitemap
      // was being served stale for hours after a DB flag flip because
      // no header pinned it to no-store.
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    },
  })
}
