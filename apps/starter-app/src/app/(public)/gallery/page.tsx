import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { GalleryGrid } from './GalleryGrid'

export default async function GalleryPage() {
  if (!(siteConfig.modules as any).gallery) return notFound()

  const supabase = getAdminClient()
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

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

      {(!images || images.length === 0) ? (
        <p className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          Gallery coming soon.
        </p>
      ) : (
        <GalleryGrid images={images} />
      )}
    </div>
  )
}
