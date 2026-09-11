import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSetting } from '@/lib/settings'
import { GalleryGrid, type GalleryImage } from './GalleryGrid'

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

export default async function GalleryPage() {
  const modules = await getEnabledModules()
  if (!modules.gallery) notFound()

  const rawGallery = await getSiteSetting('gallery_images')
  const images = parseGalleryImages(rawGallery)

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

        {images.length === 0 ? (
          <p className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
            Gallery coming soon.
          </p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </div>
    </section>
  )
}
