import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export interface GalleryHomeImage {
  url: string
  alt: string
}

// Home-page teaser strip that renders up to 8 images from
// site_settings.gallery_images, plus a "View all" link into /gallery when
// there are more. Rendered directly after the About section for tenants
// that seed the row; noops silently when the list is empty.
export function GalleryHomeSection({
  images,
  headline = 'From our kitchen',
  href = '/gallery',
}: {
  images: GalleryHomeImage[]
  headline?: string
  href?: string
}) {
  if (!images || images.length === 0) return null
  const shown = images.slice(0, 8)
  const hasMore = images.length > shown.length

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            {headline}
          </h2>
          {hasMore && (
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap hover:gap-3 transition-all"
              style={{ color: 'var(--color-primary)' }}
            >
              View all
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {shown.map((img, i) => (
            <Link
              key={img.url + i}
              href={href}
              className="relative block aspect-square overflow-hidden rounded-xl group focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
              aria-label={`View gallery: ${img.alt}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
