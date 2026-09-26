import { siteConfig } from '@config'
import { notFound, permanentRedirect } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getAdminClient } from '@/lib/supabase/admin'
import { getSiteSetting } from '@/lib/settings'
import { GalleryGrid, type GalleryImage } from './GalleryGrid'

// Per-tenant opt-out for the /gallery route. Any value other than the
// literal string "false" (case-insensitive, trimmed) leaves the historical
// behavior in place. Value === "false" triggers a 308 to /menu — same
// mechanism drinks/page.tsx uses via drinks_redirect_to, kept intentionally
// symmetric so operators only learn one pattern.
async function galleryPageEnabled(): Promise<boolean> {
  const raw = ((await getSiteSetting('gallery_page_enabled')) || '')
    .trim()
    .toLowerCase()
  return raw !== 'false'
}

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Gallery' }
}

function parseGalleryImages(raw: string | null): GalleryImage[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: GalleryImage[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const rec = item as { url?: unknown; alt?: unknown }
      const url = typeof rec.url === 'string' ? rec.url.trim() : ''
      const alt = typeof rec.alt === 'string' ? rec.alt.trim() : ''
      if (url) out.push({ url, alt })
    }
    return out
  } catch {
    return []
  }
}

interface LegacyGalleryRow {
  id: string
  image_url: string
  caption?: string | null
  category?: string | null
}

export default async function GalleryPage() {
  // Route-level opt-out — checked first so a disabled tenant never touches
  // the module gate or the TABLE query. Bookmarks + external links keep
  // working via the 308 to /menu.
  if (!(await galleryPageEnabled())) permanentRedirect('/menu')

  // Tenant-scoped resolution, mirroring the /book gate: use the new
  // site_settings.gallery_images renderer only when the tenant has BOTH
  // opted into gallery via enabled_modules AND seeded a non-empty object
  // array. Every other tenant falls through to the a02e21f build-time
  // siteConfig.modules.gallery gate + the gallery_images TABLE query so
  // Entrusted / El Roi / any historical caller renders byte-identically.
  const modules = await getEnabledModules()
  if (modules.gallery) {
    const raw = await getSiteSetting('gallery_images')
    const images = parseGalleryImages(raw)
    if (images.length > 0) {
      return (
        <section className="py-14 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-3"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Gallery
            </h1>
            <p className="mb-10 text-lg" style={{ color: 'var(--color-text-muted)' }}>
              A closer look at our kitchen.
            </p>
            <GalleryGrid images={images} />
          </div>
        </section>
      )
    }
  }

  // a02e21f behaviour: build-time siteConfig gate + gallery_images TABLE.
  if (!(siteConfig.modules as Record<string, boolean>).gallery) return notFound()

  const supabase = getAdminClient()
  const { data: rows } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  const legacy = ((rows as LegacyGalleryRow[] | null) || []).map((r) => ({
    url: r.image_url,
    alt: r.caption || '',
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}
      >
        Gallery
      </h1>
      <p className="mb-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Browse our collection of images.
      </p>

      {legacy.length === 0 ? (
        <p className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          Gallery coming soon.
        </p>
      ) : (
        <GalleryGrid images={legacy} />
      )}
    </div>
  )
}
